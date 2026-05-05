'use client'

import { cn } from '@/lib/utils'

interface PuspaLogoProps {
  className?: string
  size?: number
  animate?: boolean
  variant?: 'auto' | 'light' | 'dark' | 'colorful'
}

/**
 * PUSPA Logo — Pure SVG stylized lotus flower
 *
 * PUSPA means "flower" in Sanskrit. This component renders a geometric
 * lotus mandala with NO background rectangle.
 *
 * Variants:
 * - 'auto' (default): Uses currentColor for theme adaptation
 * - 'light': Fixed dark tones for light backgrounds
 * - 'dark': Fixed light tones for dark backgrounds
 * - 'colorful': Gradient fills with gold/crimson/green PUSPA colors
 *
 * The logo is ALWAYS visible regardless of background — no fill matches the background.
 */
export function PuspaLogo({ className, size = 28, animate = false, variant = 'auto' }: PuspaLogoProps) {
  const outerPetals = [0, 60, 120, 180, 240, 300]
  const innerPetals = [30, 90, 150, 210, 270, 330]

  // Color schemes based on variant
  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          outerFill: '#1a5c3a',       // Deep PUSPA green
          innerFill: '#0d7a4a',       // Medium green
          centerFill: '#0a5c35',      // Rich green center
          centerDot: '#073d23',       // Dark green dot
          outerOpacity: 0.85,
          innerOpacity: 0.7,
          centerOpacity: 0.95,
        }
      case 'dark':
        return {
          outerFill: '#6ee7b7',       // Light emerald
          innerFill: '#a7f3d0',       // Pale mint
          centerFill: '#6ee7b7',      // Light emerald center
          centerDot: '#ecfdf5',       // Almost white
          outerOpacity: 0.9,
          innerOpacity: 0.75,
          centerOpacity: 0.95,
        }
      case 'colorful':
        return {
          outerFill: 'url(#puspa-grad-outer)',
          innerFill: 'url(#puspa-grad-inner)',
          centerFill: 'url(#puspa-grad-center)',
          centerDot: '#b91c1c',
          outerOpacity: 0.9,
          innerOpacity: 0.8,
          centerOpacity: 1,
        }
      default: // 'auto' — uses currentColor
        return {
          outerFill: 'currentColor',
          innerFill: 'currentColor',
          centerFill: 'currentColor',
          centerDot: 'currentColor',
          outerOpacity: 0.7,
          innerOpacity: 0.5,
          centerOpacity: 0.9,
        }
    }
  }

  const colors = getColors()
  const needsGradients = variant === 'colorful'

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animate && 'animate-pulse', className)}
      aria-label="PUSPA Logo"
      role="img"
    >
      {/* Gradient definitions for colorful variant */}
      {needsGradients && (
        <defs>
          <linearGradient id="puspa-grad-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="50%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="puspa-grad-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <radialGradient id="puspa-grad-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b91c1c" />
          </radialGradient>
        </defs>
      )}

      <g transform="translate(20, 20)">
        {/* Outer petals — 6 petals, 60° apart */}
        {outerPetals.map((angle) => (
          <path
            key={`outer-${angle}`}
            d="M 0 -3.5 C -4.2 -7.5, -7.8 -13, 0 -17.5 C 7.8 -13, 4.2 -7.5, 0 -3.5 Z"
            fill={colors.outerFill}
            opacity={colors.outerOpacity}
            transform={`rotate(${angle})`}
          />
        ))}

        {/* Inner petals — 6 petals, offset 30° from outer */}
        {innerPetals.map((angle) => (
          <path
            key={`inner-${angle}`}
            d="M 0 -2.5 C -3 -5.5, -5.5 -9.5, 0 -13 C 5.5 -9.5, 3 -5.5, 0 -2.5 Z"
            fill={colors.innerFill}
            opacity={colors.innerOpacity}
            transform={`rotate(${angle})`}
          />
        ))}

        {/* Center circle */}
        <circle cx="0" cy="0" r="2.8" fill={colors.centerFill} opacity={colors.centerOpacity} />

        {/* Center inner dot */}
        <circle cx="0" cy="0" r="1.2" fill={colors.centerDot} />
      </g>
    </svg>
  )
}
