import { or, and, lt, eq, SQL } from 'drizzle-orm';

export function encodeCursor(row: { createdAt: Date; id: string }): string {
  return Buffer.from(
    JSON.stringify({
      createdAt: row.createdAt.toISOString(),
      id: row.id,
    })
  ).toString('base64url');
}

export function decodeCursor(cursor: string): { createdAt: string; id: string } {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));
}

export function buildCursorWhere(
  cursor: string | undefined,
  table: any
): SQL | undefined {
  if (!cursor) return undefined;

  const { createdAt, id } = decodeCursor(cursor);

  return or(
    lt(table.createdAt, new Date(createdAt)),
    and(eq(table.createdAt, new Date(createdAt)), lt(table.id, id))
  );
}

