import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pdf from 'pdf-parse';
import { pool } from '@/lib/db';
import { extractImageText } from '@/lib/ai';

const MAX_PAGES = 10;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const workspaceId = String(form.get('workspaceId') ?? '');
  const files = form.getAll('files').filter((value): value is File => value instanceof File);
  if (!workspaceId || files.length === 0) return NextResponse.json({ error: 'Workspace et fichiers requis.' }, { status: 400 });
  if (files.some((file) => file.size > MAX_FILE_BYTES)) return NextResponse.json({ error: 'Chaque fichier doit faire moins de 25 Mo.' }, { status: 413 });

  let pages = 0;
  const inspected: Array<{ file: File; pageCount: number }> = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const pageCount = file.type === 'application/pdf' ? (await pdf(buffer)).numpages : 1;
    pages += pageCount;
    inspected.push({ file, pageCount });
  }
  if (pages > MAX_PAGES) return NextResponse.json({ error: `Maximum ${MAX_PAGES} pages par analyse.`, pages }, { status: 413 });

  const uploadRoot = path.join(process.cwd(), 'uploads', workspaceId);
  await mkdir(uploadRoot, { recursive: true });
  const created = [];
  for (const item of inspected) {
    const safeName = `${Date.now()}-${item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = path.join(uploadRoot, safeName);
    const buffer = Buffer.from(await item.file.arrayBuffer());
    await writeFile(storagePath, buffer);
    const doc = await pool.query('insert into documents (workspace_id, filename, mime_type, storage_path, page_count, status) values ($1,$2,$3,$4,$5,$6) returning id, filename, page_count, status', [workspaceId, item.file.name, item.file.type || 'application/octet-stream', storagePath, item.pageCount, 'uploaded']);
    const document = doc.rows[0];
    if (item.file.type.startsWith('image/') && process.env.OPENROUTER_API_KEY) {
      const text = await extractImageText(buffer.toString('base64'), item.file.type);
      await pool.query('insert into document_pages (document_id, page_number, ocr_text) values ($1,1,$2)', [document.id, text ?? '']);
      await pool.query('update documents set status = $1 where id = $2', [text ? 'ocr_complete' : 'ocr_pending', document.id]);
      document.status = text ? 'ocr_complete' : 'ocr_pending';
    }
    created.push(document);
  }
  return NextResponse.json({ documents: created, pages, message: 'Documents enregistrés.' }, { status: 201 });
}
