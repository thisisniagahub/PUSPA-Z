import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { MariaEmotionState, MariaPresenceState } from '@/stores/maria-character-store'
import MariaAvatarScene from './MariaVRMModel'

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
        'relative inline-flex items-center justify-center rounded-full transition-all shadow-md',
        'after:absolute after:inset-0 after:rounded-full after:content-[""]',
        glowClass,
        emotionToneClass,
        className
      )}
      style={{
        transform: presenceState === 'idle' ? 'scale(1)' : 'scale(1.01)',
      }}
      aria-hidden="true"
    >
      <div className="h-full w-full rounded-full overflow-hidden">
        <MariaAvatarScene />
      </div>
    </div>
  )
}
