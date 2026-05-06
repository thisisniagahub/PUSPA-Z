'use client'

import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useMariaCharacterStore } from '@/stores/maria-character-store'
import { MariaCharacterRenderer } from './maria-character-renderer'
import { cn } from '@/lib/utils'

/**
 * MariaFloatingWidget
 * Widget terapung global yang menggunakan gaya butang kustom PUSPA V5.
 * Bertindak sebagai trigger untuk membuka AiChatPanel.
 */
export function MariaFloatingWidget() {
  const { aiChatOpen, setAiChatOpen } = useAppStore()
  const { presenceState, emotionState, speechState } = useMariaCharacterStore()

  // Widget disembunyikan jika chat panel sudah terbuka
  if (aiChatOpen) return null

  return (
    <Button
      type="button"
      variant="default"
      onClick={() => setAiChatOpen(true)}
      className={cn(
        'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full p-0 shadow-xl active:scale-95',
        'animate-in fade-in-0 duration-300'
      )}
      aria-label="Hubungi Maria Puspa"
    >
      <MariaCharacterRenderer
        className="h-11 w-11"
        presenceState={presenceState}
        emotionState={emotionState}
        phonemeEnergy={speechState.phonemeEnergy}
      />
    </Button>
  )
}