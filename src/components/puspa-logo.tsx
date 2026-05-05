'use client'

import { cn } from '@/lib/utils'

interface PuspaLogoProps {
  className?: string
  size?: number
  animate?: boolean
  variant?: 'auto' | 'light' | 'dark' | 'outline'
}

/**
 * PUSPA Logo — Pure SVG stylized lotus flower
 *
 * PUSPA means "flower" in Sanskrit. This component renders a geometric
 * lotus mandala with NO background rectangle — always transparent.
 *
 * Variants:
 * - 'auto' (default): Uses currentColor — adapts to parent text color
 * - 'light': Fixed dark emerald green for light backgrounds
 * - 'dark': Fixed light emerald for dark backgrounds
 * - 'outline': Stroke-only design — NO fill, just outlines. Always visible.
 *
 * IMPORTANT: No background color. No fill that matches any common background.
 */
export function PuspaLogo({ className, size = 28, animate = false, variant = 'auto' }: PuspaLogoProps) {
  const outerPetals = [0, 60, 120, 180, 240, 300]
  const innerPetals = [30, 90, 150, 210, 270, 330]

  // Color schemes — all use FILLS that are visible on both light AND dark backgrounds
  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          outerFill: '#166534',       // Dark green — visible on light bg
          innerFill: '#15803d',       // Green
          centerFill: '#14532d',      // Darkest green
          centerDot: '#052e16',       // Near-black green
          outerOpacity: 0.9,
          innerOpacity: 0.8,
          centerOpacity: 0.95,
          strokeColor: 'none',
          strokeWidth: 0,
        }
      case 'dark':
        return {
          outerFill: '#6ee7b7',       // Light emerald — visible on dark bg
          innerFill: '#a7f3d0',       // Pale mint
          centerFill: '#34d399',      // Emerald
          centerDot: '#ecfdf5',       // Near-white
          outerOpacity: 0.9,
          innerOpacity: 0.8,
          centerOpacity: 0.95,
          strokeColor: 'none',
          strokeWidth: 0,
        }
      case 'outline':
        // Stroke-only — NO fill at all. Works on ANY background.
        return {
          outerFill: 'none',
          innerFill: 'none',
          centerFill: 'none',
          centerDot: 'none',
          outerOpacity: 1,
          innerOpacity: 1,
          centerOpacity: 1,
          strokeColor: 'currentColor',
          strokeWidth: 1.2,
        }
      default: // 'auto' — uses currentColor for fill
        return {
          outerFill: 'currentColor',
          innerFill: 'currentColor',
          centerFill: 'currentColor',
          centerDot: 'currentColor',
          outerOpacity: 0.75,
          innerOpacity: 0.55,
          centerOpacity: 0.95,
          strokeColor: 'none',
          strokeWidth: 0,
        }
    }
  }

  const colors = getColors()

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
      <g transform="translate(20, 20)">
        {/* Outer petals — 6 petals, 60° apart */}
        {outerPetals.map((angle) => (
          <path
            key={`outer-${angle}`}
            d="M 0 -3.5 C -4.2 -7.5, -7.8 -13, 0 -17.5 C 7.8 -13, 4.2 -7.5, 0 -3.5 Z"
            fill={colors.outerFill}
            stroke={colors.strokeColor}
            strokeWidth={colors.strokeWidth}
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
            stroke={colors.strokeColor}
            strokeWidth={colors.strokeWidth}
            opacity={colors.innerOpacity}
            transform={`rotate(${angle})`}
          />
        ))}

        {/* Center circle */}
        <circle
          cx="0"
          cy="0"
          r="2.8"
          fill={colors.centerFill}
          stroke={colors.strokeColor}
          strokeWidth={colors.strokeWidth}
          opacity={colors.centerOpacity}
        />

        {/* Center inner dot */}
        <circle
          cx="0"
          cy="0"
          r="1.2"
          fill={colors.centerDot}
          stroke={colors.strokeColor}
          strokeWidth={colors.strokeWidth}
        />
      </g>
    </svg>
  )
}
