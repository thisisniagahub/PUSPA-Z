'use client'

import { useEffect, useMemo, useState } from 'react'
import { MARIA_PUSPA_AVATAR_URI } from '@/lib/maria-avatar'
import { cn } from '@/lib/utils'
import type { MariaEmotionState, MariaPresenceState } from '@/stores/maria-character-store'

interface MariaCharacterRendererProps {
  className?: string
  presenceState: MariaPresenceState
  emotionState: MariaEmotionState
  phonemeEnergy?: number
}

export function MariaCharacterRenderer({
  className,
  presenceState,
  emotionState,
  phonemeEnergy = 0,
}: MariaCharacterRendererProps) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBlink(true)
      window.setTimeout(() => setBlink(false), 130)
    }, 3000 + Math.round(Math.random() * 1400))

    return () => clearInterval(interval)
  }, [])

  const mouthScale = useMemo(() => {
    if (presenceState !== 'speaking') return 1
    return 1 + phonemeEnergy * 0.2
  }, [presenceState, phonemeEnergy])

  const glowClass = useMemo(() => {
    if (presenceState === 'thinking') return 'ring-2 ring-amber-400/60'
    if (presenceState === 'speaking') return 'ring-2 ring-emerald-400/70'
    if (presenceState === 'listening') return 'ring-2 ring-sky-400/60'
    return 'ring-1 ring-primary/20'
  }, [presenceState])

  const emotionToneClass = useMemo(() => {
    if (emotionState === 'warm') return 'after:bg-rose-400/15'
    if (emotionState === 'focus') return 'after:bg-blue-400/15'
    if (emotionState === 'alert') return 'after:bg-amber-400/15'
    if (emotionState === 'empathetic') return 'after:bg-violet-400/15'
    return 'after:bg-primary/10'
  }, [emotionState])

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full transition-all',
        'after:absolute after:inset-0 after:rounded-full after:content-[""]',
        glowClass,
        emotionToneClass,
        className
      )}
      style={{
        transform: presenceState === 'idle' ? 'scale(1)' : 'scale(1.01)',
      }}
      aria-hidden="true" // Sembunyikan dari screen reader kerana parent (button) sudah ada label
    >
      <img
        src={MARIA_PUSPA_AVATAR_URI}
        alt="Maria Puspa"
        className="h-full w-full rounded-full object-cover"
        style={{
          filter: blink ? 'brightness(0.94)' : 'brightness(1)',
          transform: `scale(${mouthScale})`,
          transition: 'transform 80ms linear, filter 120ms ease',
        }}
      />
    </div>
  )
}
