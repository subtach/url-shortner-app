'use client'

import { useState } from 'react'
import { PasswordGate } from '@/components/password-gate'
import { MediaViewer } from '@/components/media-viewer'
import type { MediaShare } from '@/lib/types'

interface MediaPasswordGateWrapperProps {
  shortCode: string
}

export function MediaPasswordGateWrapper({ shortCode }: MediaPasswordGateWrapperProps) {
  const [media, setMedia] = useState<MediaShare | null>(null)

  if (media) {
    return <MediaViewer media={media} />
  }

  return (
    <PasswordGate
      shortCode={shortCode}
      type="media"
      onUnlock={(data) => setMedia(data as MediaShare)}
    />
  )
}
