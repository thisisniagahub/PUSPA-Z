'use client'

import { cn } from '@/lib/utils'
import { PUSPA_LOGO_URI } from '@/lib/puspa-brand-assets'

interface PuspaLoadingSpinnerProps {
  size?: number
  className?: string
  text?: string
}

export function PuspaLoadingSpinner({ size = 48, className, text }: PuspaLoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <img
        src={PUSPA_LOGO_URI}
        alt="Loading..."
        className="bg-white rounded-full object-contain p-1"
        style={{
          width: size,
          height: size,
          animation: 'puspa-spin 4s linear infinite',
        }}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
      <style>{`
        @keyframes puspa-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
