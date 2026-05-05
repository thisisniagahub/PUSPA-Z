// PUSPA V4 — Inline SVG Logo Component
// No external file dependency — works on any deployment platform (serverless, static, etc.)

import { cn } from '@/lib/utils'

interface PuspaLogoProps {
  className?: string
  size?: number
  animate?: boolean
}

export function PuspaLogo({ className, size = 28, animate = false }: PuspaLogoProps) {
  return (
    <svg
      viewBox="0 0 30 30"
      width={size}
      height={size}
      className={cn('object-contain', className)}
      aria-label="PUSPA Logo"
    >
      {/* Rounded square background */}
      <path
        d="M24.51,28.51H5.49c-2.21,0-4-1.79-4-4V5.49c0-2.21,1.79-4,4-4h19.03c2.21,0,4,1.79,4,4v19.03 C28.51,26.72,26.72,28.51,24.51,28.51z"
        fill="currentColor"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.6"
      />
      {/* Z symbol top */}
      <path
        d="M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z"
        fill="#ffffff"
        style={animate ? { animation: 'puspa-breathe 2.5s ease-in-out infinite' } : undefined}
      />
      {/* Z symbol diagonal */}
      <polygon
        points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1"
        fill="#ffffff"
        style={animate ? { animation: 'puspa-breathe 2.5s ease-in-out infinite' } : undefined}
      />
      {/* Z symbol bottom */}
      <path
        d="M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z"
        fill="#ffffff"
        style={animate ? { animation: 'puspa-breathe 2.5s ease-in-out infinite' } : undefined}
      />
      {/* Breathing animation keyframes */}
      {animate && (
        <style>{`
          @keyframes puspa-breathe {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
        `}</style>
      )}
    </svg>
  )
}
