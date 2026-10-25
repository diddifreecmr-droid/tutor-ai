import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { createRecoveryCode, hashRecoveryCode } from '@/lib/recovery';

export async function POST() {
  try {
    const recoveryCode = createRecoveryCode();
    const result = await pool.query('insert into workspaces (recovery_code_hash) values ($1) returning id', [hashRecoveryCode(recoveryCode)]);
    return NextResponse.json({ workspaceId: result.rows[0].id, recoveryCode });
  } catch { return NextResponse.json({ error: 'La base de données est indisponible.' }, { status: 503 }); }
}
