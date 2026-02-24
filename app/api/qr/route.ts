import { NextRequest, NextResponse } from 'next/server'
import * as QRCode from 'qrcode'

/**
 * GET /api/qr?url=<encoded-url>&size=300
 * Returns a QR code as a PNG image for the given URL.
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
        const pngBuffer = await QRCode.toBuffer(url, {
            width: size,
            margin: 2,
            color: { dark: '#2B2B2B', light: '#FFFFFF' },
            errorCorrectionLevel: 'M',
        })

        // Convert Node.js Buffer → Uint8Array so it is assignable to NextResponse BodyInit
        const body = new Uint8Array(pngBuffer.buffer, pngBuffer.byteOffset, pngBuffer.byteLength)

        return new NextResponse(body, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
                'Content-Disposition': 'inline; filename="qr.png"',
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
