import { NextResponse } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { createRecoveryCode, hashRecoveryCode } from '@/lib/recovery';

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json().catch(() => ({})) as { recoveryCode?: string };
    if (body.recoveryCode?.trim()) {
      const result = await pool.query('select id from workspaces where recovery_code_hash = $1', [hashRecoveryCode(body.recoveryCode)]);
      if (!result.rowCount) return NextResponse.json({ error: 'Code de récupération invalide.' }, { status: 404 });
      return NextResponse.json({ workspaceId: result.rows[0].id, restored: true });
    }
    const recoveryCode = createRecoveryCode();
    const result = await pool.query('insert into workspaces (recovery_code_hash) values ($1) returning id', [hashRecoveryCode(recoveryCode)]);
    return NextResponse.json({ workspaceId: result.rows[0].id, recoveryCode });
  } catch {
    return NextResponse.json({ error: 'La base de données est indisponible.' }, { status: 503 });
  }
}