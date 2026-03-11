import { createClient, type Client, type Row } from '@libsql/client'

let _client: Client | null = null

export function getDb(): Client {
  if (_client) return _client

  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL is not set. Add it to .env.local for local dev, or set it in Netlify Environment Variables for production.'
    )
  }

  _client = createClient({ url, authToken })
  return _client
}

/** Helper to safely read a string column from a libsql Row */
export function rowStr(row: Row, col: string): string {
  const v = row[col]
  return v == null ? '' : String(v)
}

/** Helper to safely read a nullable string column from a libsql Row */
export function rowStrNull(row: Row, col: string): string | null {
  const v = row[col]
  return v == null ? null : String(v)
}

/** Helper to safely read a number column from a libsql Row */
export function rowNum(row: Row, col: string): number {
  const v = row[col]
  return v == null ? 0 : Number(v)
}

/**
 * Ensures the schema exists and seeds sample data on first run.
 * Safe to call multiple times — all DDL uses IF NOT EXISTS.
 */
export async function initDb(): Promise<void> {
  const db = getDb()

  // Create tables + indexes if they don't exist yet
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS links (
      id           TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_code   TEXT NOT NULL UNIQUE,
      clicks       INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL,
      expires_at   TEXT,
      is_expired   INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
    CREATE TABLE IF NOT EXISTS code_pastes (
      id         TEXT PRIMARY KEY,
      code       TEXT NOT NULL,
      language   TEXT NOT NULL DEFAULT 'plaintext',
      short_code TEXT NOT NULL UNIQUE,
      title      TEXT,
      clicks     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      expires_at TEXT,
      is_expired INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_pastes_short_code ON code_pastes(short_code);
    CREATE TABLE IF NOT EXISTS media_shares (
      id         TEXT PRIMARY KEY,
      filename   TEXT NOT NULL,
      mime_type  TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      short_code TEXT NOT NULL UNIQUE,
      title      TEXT,
      clicks     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      expires_at TEXT,
      is_expired INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_media_short_code ON media_shares(short_code);
  `)

  // Seed sample data only when the table is empty
  const { rows } = await db.execute('SELECT COUNT(*) AS n FROM links')
  if (rowNum(rows[0], 'n') === 0) {
    const seeds = [
      { id: '1', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', code: 'mdn-js', clicks: 142, created: '2026-01-15T10:30:00Z', expires: '2026-03-15T10:30:00Z', expired: 0 },
      { id: '2', url: 'https://nextjs.org/docs/getting-started/installation', code: 'nextjs', clicks: 87, created: '2026-01-20T14:00:00Z', expires: null, expired: 0 },
      { id: '3', url: 'https://tailwindcss.com/docs/responsive-design', code: 'tw-resp', clicks: 53, created: '2026-02-01T09:00:00Z', expires: '2026-02-10T09:00:00Z', expired: 1 },
      { id: '4', url: 'https://react.dev/learn/thinking-in-react', code: 'react-think', clicks: 215, created: '2026-02-05T16:45:00Z', expires: null, expired: 0 },
      { id: '5', url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html', code: 'ts-types', clicks: 31, created: '2025-12-01T08:00:00Z', expires: '2026-01-01T08:00:00Z', expired: 1 },
    ]

    for (const s of seeds) {
      await db.execute({
        sql: `INSERT INTO links (id, original_url, short_code, clicks, created_at, expires_at, is_expired)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [s.id, s.url, s.code, s.clicks, s.created, s.expires ?? null, s.expired],
      })
    }
  }
}
