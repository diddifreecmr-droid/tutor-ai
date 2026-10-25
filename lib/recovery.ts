import crypto from 'node:crypto';

export function createRecoveryCode() { return crypto.randomBytes(5).toString('hex').toUpperCase(); }
export function hashRecoveryCode(code: string) { return crypto.createHash('sha256').update(code).digest('hex'); }
