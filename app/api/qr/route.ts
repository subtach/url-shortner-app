import { NextRequest, NextResponse } from 'next/server'
import * as QRCode from 'qrcode'

/**
 * GET /api/qr?url=<encoded-url>&size=300
 * Returns a QR code as an SVG image for the given URL.
 * Uses SVG output (pure JS) instead of PNG (which requires native canvas bindings
 * unavailable in serverless/Netlify Functions environments).
 * - url   (required): the URL to encode
 * - size  (optional): output size in pixels, clamped 100–1000, default 300
 */
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const url = searchParams.get('url')
    const size = Math.min(Math.max(parseInt(searchParams.get('size') ?? '300', 10), 100), 1000)

    if (!url) {
        return NextResponse.json(
            { success: false, error: 'Missing required query parameter: url' },
            { status: 400 }
        )
    }

    // Validate the URL
    try {
        new URL(url)
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid URL' }, { status: 400 })
    }

    try {
        // toString('svg') is pure JavaScript — no native canvas bindings needed.
        // This works correctly in Netlify Functions and all serverless environments.
        const svgString = await QRCode.toString(url, {
            type: 'svg',
            width: size,
            margin: 2,
            color: { dark: '#2B2B2B', light: '#FFFFFF' },
            errorCorrectionLevel: 'M',
        })

        return new NextResponse(svgString, {
            status: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
                'Content-Disposition': 'inline; filename="qr.svg"',
            },
        })
    } catch (err) {
        console.error('QR generation error:', err)
        return NextResponse.json(
            { success: false, error: 'Failed to generate QR code' },
            { status: 500 }
        )
    }
}
