import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try { await pool.query('select 1'); return NextResponse.json({ ok: true, service: 'tutor-ai' }); }
  catch { return NextResponse.json({ ok: false, service: 'tutor-ai', database: 'unavailable' }, { status: 503 }); }
}
