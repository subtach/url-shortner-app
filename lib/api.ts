import type { ShortenedLink, ShortenRequest, ShortenResponse, LinksResponse, CodePaste, PasteRequest, PasteResponse, MediaShare, MediaShareResponse } from './types'
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

// ---------------------------------------------------------------------------
// Code Paste API
// ---------------------------------------------------------------------------

function rowToPaste(row: import('@libsql/client').Row, baseUrl: string): CodePaste {
  return {
    id: rowStr(row, 'id'),
    code: rowStr(row, 'code'),
    language: rowStr(row, 'language'),
    shortCode: rowStr(row, 'short_code'),
    shortUrl: `${baseUrl}/paste/${rowStr(row, 'short_code')}`,
    title: rowStrNull(row, 'title'),
    clicks: rowNum(row, 'clicks'),
    createdAt: rowStr(row, 'created_at'),
    expiresAt: rowStrNull(row, 'expires_at'),
    isExpired: rowNum(row, 'is_expired') === 1,
  }
}

/**
 * POST /api/paste
 * Stores a new code paste and returns its short URL.
 */
export async function createPaste(
  request: PasteRequest,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<PasteResponse> {
  if (!request.code?.trim()) {
    return { success: false, error: 'Code cannot be empty' }
  }

  await initDb()
  const db = getDb()

  // Check custom alias uniqueness across both tables
  if (request.customAlias) {
    const [linkRows, pasteRows] = await Promise.all([
      db.execute({ sql: 'SELECT id FROM links WHERE short_code = ?', args: [request.customAlias] }),
      db.execute({ sql: 'SELECT id FROM code_pastes WHERE short_code = ?', args: [request.customAlias] }),
    ])
    if (linkRows.rows.length > 0 || pasteRows.rows.length > 0) {
      return { success: false, error: 'This alias is already taken' }
    }
  }

  const shortCode = request.customAlias || generateShortCode()
  const id = String(Date.now())
  const createdAt = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO code_pastes (id, code, language, short_code, title, clicks, created_at, expires_at, is_expired)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?, 0)`,
    args: [
      id,
      request.code,
      request.language || 'plaintext',
      shortCode,
      request.title ?? null,
      createdAt,
      request.expiresAt ?? null,
    ],
  })

  const { rows } = await db.execute({
    sql: 'SELECT * FROM code_pastes WHERE id = ?',
    args: [id],
  })

  return { success: true, data: rowToPaste(rows[0], baseUrl) }
}

/**
 * GET /paste/:shortCode  (used by the page server action)
 * Resolves a paste short code; increments click counter.
 */
export async function resolvePasteShortCode(
  shortCode: string,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<{ success: boolean; data?: CodePaste }> {
  await initDb()
  const db = getDb()

  const { rows } = await db.execute({
    sql: 'SELECT * FROM code_pastes WHERE short_code = ?',
    args: [shortCode],
  })

  if (rows.length === 0) return { success: false }

  const row = rows[0]
  const expiresAt = rowStrNull(row, 'expires_at')
  const isExpired =
    rowNum(row, 'is_expired') === 1 ||
    (expiresAt ? new Date(expiresAt) < new Date() : false)

  if (!isExpired) {
    await db.execute({
      sql: 'UPDATE code_pastes SET clicks = clicks + 1 WHERE short_code = ?',
      args: [shortCode],
    })
  }

  return { success: true, data: rowToPaste(row, baseUrl) }
}

// ---------------------------------------------------------------------------
// Media Share API
// ---------------------------------------------------------------------------

function rowToMedia(row: import('@libsql/client').Row, baseUrl: string): MediaShare {
  const shortCode = rowStr(row, 'short_code')
  return {
    id: rowStr(row, 'id'),
    filename: rowStr(row, 'filename'),
    mimeType: rowStr(row, 'mime_type'),
    sizeBytes: rowNum(row, 'size_bytes'),
    shortCode,
    shortUrl: `${baseUrl}/media/${shortCode}`,
    rawUrl: `/api/media/${shortCode}/raw`,
    title: rowStrNull(row, 'title'),
    clicks: rowNum(row, 'clicks'),
    createdAt: rowStr(row, 'created_at'),
    expiresAt: rowStrNull(row, 'expires_at'),
    isExpired: rowNum(row, 'is_expired') === 1,
  }
}

export interface CreateMediaShareInput {
  filename: string
  mimeType: string
  sizeBytes: number
  title?: string
  customAlias?: string
  expiresAt?: string
}

/**
 * Stores media share metadata in Turso.
 * The caller is responsible for persisting the blob to Netlify Blobs
 * using the returned shortCode as the blob key.
 */
export async function createMediaShare(
  input: CreateMediaShareInput,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<MediaShareResponse> {
  await initDb()
  const db = getDb()

  // Uniqueness check across all three tables
  if (input.customAlias) {
    const [linkRows, pasteRows, mediaRows] = await Promise.all([
      db.execute({ sql: 'SELECT id FROM links WHERE short_code = ?', args: [input.customAlias] }),
      db.execute({ sql: 'SELECT id FROM code_pastes WHERE short_code = ?', args: [input.customAlias] }),
      db.execute({ sql: 'SELECT id FROM media_shares WHERE short_code = ?', args: [input.customAlias] }),
    ])
    if (linkRows.rows.length > 0 || pasteRows.rows.length > 0 || mediaRows.rows.length > 0) {
      return { success: false, error: 'This alias is already taken' }
    }
  }

  const shortCode = input.customAlias || generateShortCode()
  const id = String(Date.now())
  const createdAt = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO media_shares (id, filename, mime_type, size_bytes, short_code, title, clicks, created_at, expires_at, is_expired)
          VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 0)`,
    args: [
      id,
      input.filename,
      input.mimeType,
      input.sizeBytes,
      shortCode,
      input.title ?? null,
      createdAt,
      input.expiresAt ?? null,
    ],
  })

  const { rows } = await db.execute({
    sql: 'SELECT * FROM media_shares WHERE id = ?',
    args: [id],
  })

  return { success: true, data: rowToMedia(rows[0], baseUrl) }
}

/**
 * Resolves a media short code to its metadata; increments click counter.
 */
export async function resolveMediaShortCode(
  shortCode: string,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<{ success: boolean; data?: MediaShare }> {
  await initDb()
  const db = getDb()

  const { rows } = await db.execute({
    sql: 'SELECT * FROM media_shares WHERE short_code = ?',
    args: [shortCode],
  })

  if (rows.length === 0) return { success: false }

  const row = rows[0]
  const expiresAt = rowStrNull(row, 'expires_at')
  const isExpired =
    rowNum(row, 'is_expired') === 1 ||
    (expiresAt ? new Date(expiresAt) < new Date() : false)

  if (!isExpired) {
    await db.execute({
      sql: 'UPDATE media_shares SET clicks = clicks + 1 WHERE short_code = ?',
      args: [shortCode],
    })
  }

  return { success: true, data: rowToMedia(row, baseUrl) }
}
