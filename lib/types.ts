export interface ShortenedLink {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  createdAt: string
  expiresAt: string | null
  isExpired: boolean
  userId?: string | null
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

export interface CodePaste {
  id: string
  code: string
  language: string
  shortCode: string
  shortUrl: string
  title: string | null
  clicks: number
  createdAt: string
  expiresAt: string | null
  isExpired: boolean
  userId?: string | null
}

export interface PasteRequest {
  code: string
  language: string
  title?: string
  customAlias?: string
  expiresAt?: string
}

export interface PasteResponse {
  success: boolean
  data?: CodePaste
  error?: string
}

export interface MediaShare {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  shortCode: string
  shortUrl: string
  rawUrl: string
  title: string | null
  clicks: number
  createdAt: string
  expiresAt: string | null
  isExpired: boolean
  userId?: string | null
}

export interface MediaShareResponse {
  success: boolean
  data?: MediaShare
  error?: string
}

export interface DashboardData {
  links: ShortenedLink[]
  pastes: CodePaste[]
  mediaShares: MediaShare[]
  stats: {
    totalLinks: number
    totalPastes: number
    totalMedia: number
    totalClicks: number
    activeLinks: number
    activePastes: number
    activeMedia: number
  }
}
