'use client'

import { useState } from 'react'
import { PasswordGate } from '@/components/password-gate'
import { PasteViewer } from '@/components/paste-viewer'
import type { CodePaste } from '@/lib/types'

interface PastePasswordGateWrapperProps {
  shortCode: string
}

export function PastePasswordGateWrapper({ shortCode }: PastePasswordGateWrapperProps) {
  const [paste, setPaste] = useState<CodePaste | null>(null)

  if (paste) {
    return <PasteViewer paste={paste} />
  }

  return (
    <PasswordGate
      shortCode={shortCode}
      type="paste"
      onUnlock={(data) => setPaste(data as CodePaste)}
    />
  )
}
