'use client'

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
    <button
      data-slot="button"
      onClick={() => setAiChatOpen(true)}
      className={cn(
        "fixed bottom-6 right-6 z-40 shadow-xl transition-all active:scale-95",
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        "shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "text-primary-foreground relative h-14 w-14 rounded-full bg-primary hover:bg-primary/90",
        "animate-in fade-in-0 duration-300" // Animasi fade-in apabila muncul
      )}
      aria-label="Hubungi Maria Puspa"
    >
      <MariaCharacterRenderer
        className="h-11 w-11"
        presenceState={presenceState}
        emotionState={emotionState}
        phonemeEnergy={speechState.phonemeEnergy}
      />
    </button>
  )
}