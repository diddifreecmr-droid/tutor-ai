import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pdf from 'pdf-parse';
import { pool, ensureSchema } from '@/lib/db';
import { extractImageText } from '@/lib/ai';

const MAX_PAGES = 10;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function GET(request: NextRequest) {
  await ensureSchema();
  const workspaceId = request.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) return NextResponse.json({ error: 'Workspace requis.' }, { status: 400 });
  const result = await pool.query(`
    select d.id, d.filename, d.mime_type, d.page_count, d.status, d.subject, d.level, d.series, d.chapter, d.created_at,
           coalesce(json_agg(json_build_object('pageNumber', p.page_number, 'text', p.ocr_text) order by p.page_number) filter (where p.id is not null), '[]') as pages
    from documents d left join document_pages p on p.document_id = d.id
    where d.workspace_id = $1
    group by d.id
    order by d.created_at desc
  `, [workspaceId]);
  return NextResponse.json({ documents: result.rows });
}

export async function POST(request: NextRequest) {
  await ensureSchema();
  const form = await request.formData();
  const workspaceId = String(form.get('workspaceId') ?? '');
  const files = form.getAll('files').filter((value): value is File => value instanceof File);
  if (!workspaceId || files.length === 0) return NextResponse.json({ error: 'Workspace et fichiers requis.' }, { status: 400 });
  if (files.some((file) => file.size > MAX_FILE_BYTES)) return NextResponse.json({ error: 'Chaque fichier doit faire moins de 25 Mo.' }, { status: 413 });

  let pages = 0;
  const inspected: Array<{ file: File; pageCount: number; buffer: Buffer; pdfText?: string }> = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    let pageCount = 1;
    let pdfText = '';
    if (file.type === 'application/pdf') {
      const parsed = await pdf(buffer);
      pageCount = parsed.numpages;
      pdfText = parsed.text.trim();
    }
    pages += pageCount;
    inspected.push({ file, pageCount, buffer, pdfText });
  }
  if (pages > MAX_PAGES) return NextResponse.json({ error: `Maximum ${MAX_PAGES} pages par analyse.`, pages }, { status: 413 });

  const uploadRoot = path.join(process.cwd(), 'uploads', workspaceId);
  await mkdir(uploadRoot, { recursive: true });
  const created = [];
  for (const item of inspected) {
    const safeName = `${Date.now()}-${item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = path.join(uploadRoot, safeName);
    await writeFile(storagePath, item.buffer);
    const doc = await pool.query('insert into documents (workspace_id, filename, mime_type, storage_path, page_count, status) values ($1,$2,$3,$4,$5,$6) returning id, filename, page_count, status', [workspaceId, item.file.name, item.file.type || 'application/octet-stream', storagePath, item.pageCount, 'uploaded']);
    const document = doc.rows[0];
    let status = 'ocr_pending';
    try {
      if (item.file.type.startsWith('image/') && process.env.OPENROUTER_API_KEY) {
        const text = await extractImageText(item.buffer.toString('base64'), item.file.type);
        await pool.query('insert into document_pages (document_id, page_number, ocr_text) values ($1,1,$2)', [document.id, text ?? '']);
        status = text ? 'ocr_complete' : 'ocr_pending';
      } else if (item.file.type === 'application/pdf' && item.pdfText) {
        await pool.query('insert into document_pages (document_id, page_number, ocr_text) values ($1,1,$2)', [document.id, item.pdfText]);
        status = 'ocr_complete';
      }
    } catch {
      status = 'ocr_error';
    }
    await pool.query('update documents set status = $1 where id = $2', [status, document.id]);
    document.status = status;
    created.push(document);
  }
  return NextResponse.json({ documents: created, pages, message: 'Documents enregistrés.' }, { status: 201 });
}