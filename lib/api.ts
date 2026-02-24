import type { ShortenedLink, ShortenRequest, ShortenResponse, LinksResponse } from './types'
import { getDb, initDb, rowStr, rowStrNull, rowNum } from './db'
import type { Row } from '@libsql/client'

const DEFAULT_BASE_URL = 'http://localhost:3000'

function rowToLink(row: Row, baseUrl: string): ShortenedLink {
  return {
    id: rowStr(row, 'id'),
    originalUrl: rowStr(row, 'original_url'),
    shortCode: rowStr(row, 'short_code'),
    shortUrl: `${baseUrl}/${rowStr(row, 'short_code')}`,
    clicks: rowNum(row, 'clicks'),
    createdAt: rowStr(row, 'created_at'),
    expiresAt: rowStrNull(row, 'expires_at'),
    isExpired: rowNum(row, 'is_expired') === 1,
  }
}

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * POST /api/shorten
 * Persists a new shortened link to Turso (cloud SQLite).
 */
export async function shortenUrl(
  request: ShortenRequest,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<ShortenResponse> {
  // Validate URL
  try {
    new URL(request.url)
  } catch {
    return { success: false, error: 'Please enter a valid URL' }
  }

  await initDb()
  const db = getDb()

  // Check custom alias uniqueness
  if (request.customAlias) {
    const { rows } = await db.execute({
      sql: 'SELECT id FROM links WHERE short_code = ?',
      args: [request.customAlias],
    })
    if (rows.length > 0) {
      return { success: false, error: 'This alias is already taken' }
    }
  }

  const shortCode = request.customAlias || generateShortCode()
  const id = String(Date.now())
  const createdAt = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO links (id, original_url, short_code, clicks, created_at, expires_at, is_expired)
          VALUES (?, ?, ?, 0, ?, ?, 0)`,
    args: [id, request.url, shortCode, createdAt, request.expiresAt ?? null],
  })

  const { rows } = await db.execute({
    sql: 'SELECT * FROM links WHERE id = ?',
    args: [id],
  })

  return { success: true, data: rowToLink(rows[0], baseUrl) }
}

/**
 * GET /api/links
 * Returns all shortened links ordered by creation date (newest first).
 */
export async function getLinks(baseUrl: string = DEFAULT_BASE_URL): Promise<LinksResponse> {
  await initDb()
  const db = getDb()

  const { rows } = await db.execute(
    'SELECT * FROM links ORDER BY created_at DESC'
  )

  return {
    success: true,
    data: rows.map((r) => rowToLink(r, baseUrl)),
  }
}

/**
 * GET /api/resolve/:shortCode
 * Resolves a short code to its original URL; increments the click counter.
 */
export async function resolveShortCode(
  shortCode: string
): Promise<{ success: boolean; data?: { originalUrl: string; isExpired: boolean } }> {
  await initDb()
  const db = getDb()

  const { rows } = await db.execute({
    sql: 'SELECT * FROM links WHERE short_code = ?',
    args: [shortCode],
  })

  if (rows.length === 0) return { success: false }

  const row = rows[0]
  const expiresAt = rowStrNull(row, 'expires_at')
  const isExpired =
    rowNum(row, 'is_expired') === 1 ||
    (expiresAt ? new Date(expiresAt) < new Date() : false)

  // Increment click count only if not expired
  if (!isExpired) {
    await db.execute({
      sql: 'UPDATE links SET clicks = clicks + 1 WHERE short_code = ?',
      args: [shortCode],
    })
  }

  return {
    success: true,
    data: { originalUrl: rowStr(row, 'original_url'), isExpired },
  }
}

/**
 * DELETE /api/links/:id
 * Permanently deletes a shortened link by ID.
 */
export async function deleteLink(id: string): Promise<{ success: boolean }> {
  await initDb()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM links WHERE id = ?', args: [id] })
  return { success: true }
}
