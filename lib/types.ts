export interface ShortenedLink {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  createdAt: string
  expiresAt: string | null
  isExpired: boolean
}

export interface ShortenRequest {
  url: string
  customAlias?: string
  expiresAt?: string
}

export interface ShortenResponse {
  success: boolean
  data?: ShortenedLink
  error?: string
}

export interface LinksResponse {
  success: boolean
  data: ShortenedLink[]
}
