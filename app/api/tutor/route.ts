import { NextResponse } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { answerTutorQuestion } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as { workspaceId?: string; question?: string };
    const workspaceId = body.workspaceId?.trim();
    const question = body.question?.trim();
    if (!workspaceId || !question) return NextResponse.json({ error: 'Workspace et question requis.' }, { status: 400 });
    if (question.length > 2000) return NextResponse.json({ error: 'La question est trop longue.' }, { status: 413 });

    const result = await pool.query(`
      select d.filename, p.page_number, p.ocr_text
      from documents d join document_pages p on p.document_id = d.id
      where d.workspace_id = $1 and p.ocr_text <> ''
      order by d.created_at desc, p.page_number asc
      limit 40
    `, [workspaceId]);
    if (!result.rowCount) return NextResponse.json({ error: 'Aucun texte OCR disponible. Importez d’abord un cours et vérifiez que l’OCR est terminé.' }, { status: 422 });

    const context = result.rows.map((row) => `[${row.filename}, page ${row.page_number}]\n${row.ocr_text}`).join('\n\n').slice(0, 30000);
    const answer = await answerTutorQuestion(question, context);
    if (!answer) return NextResponse.json({ error: 'Le service IA n’est pas configuré. Ajoutez OPENROUTER_API_KEY côté serveur.' }, { status: 503 });
    return NextResponse.json({ answer, sources: result.rows.map((row) => ({ filename: row.filename, page: row.page_number })) });
  } catch {
    return NextResponse.json({ error: 'Le tuteur est momentanément indisponible.' }, { status: 503 });
  }
}