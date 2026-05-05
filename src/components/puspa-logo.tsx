// PUSPA V4 — Inline PUSPA Logo Component
// Uses base64-encoded real PUSPA logo — no external file dependency
// Works on any deployment platform (serverless, static, etc.)

import { PUSPA_LOGO_BASE64 } from '@/lib/puspa-logo-data'
import { cn } from '@/lib/utils'

interface PuspaLogoProps {
  className?: string
  size?: number
  animate?: boolean
}

export function PuspaLogo({ className, size = 28, animate = false }: PuspaLogoProps) {
  return (
    <img
      src={PUSPA_LOGO_BASE64}
      alt="PUSPA Logo"
      width={size}
      height={size}
      className={cn('object-contain', animate && 'animate-pulse', className)}
      style={{ imageRendering: 'auto' }}
    />
  )
}
