'use client'

import { useAppStore } from '@/lib/store'
import { useHermesStore } from '@/stores/hermes-store'
import { cn } from '@/lib/utils'
import { X, Send, User, Loader2, Sparkles, Wrench, Mic, ChevronDown, ArrowDown, Menu } from 'lucide-react'
import { MARIA_PUSPA_AVATAR_URI } from '@/lib/maria-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useState, useRef, useEffect, useCallback } from 'react'

export function AiChatPanel() {
  const { aiChatOpen, setAiChatOpen, currentView, currentUser } = useAppStore()
  const {
    messages, isStreaming, modelName, toolCalls, lastError,
    sendMessage, setLastError, clearMessages,
  } = useHermesStore()

  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragStartY = useRef<number | null>(null)
  const dragCurrentY = useRef<number | null>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Keyboard-aware: when input focuses on mobile, scroll to bottom after a small delay
  const handleInputFocus = useCallback(() => {
    setTimeout(() => scrollToBottom(), 300)
  }, [scrollToBottom])

  // Detect if user has scrolled up — show "scroll to bottom" button
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80
    setShowScrollBtn(!isNearBottom)
  }, [])

  // ─── Swipe-to-dismiss handler ────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    dragCurrentY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    dragCurrentY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (dragStartY.current !== null && dragCurrentY.current !== null) {
      const deltaY = dragCurrentY.current - dragStartY.current
      // If swiped down more than 80px, close the panel
      if (deltaY > 80) {
        setAiChatOpen(false)
      }
    }
    dragStartY.current = null
    dragCurrentY.current = null
  }, [setAiChatOpen])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    const text = input.trim()
    setInput('')
    await sendMessage(
      text,
      currentView,
      currentUser?.id || 'anonymous',
      currentUser?.role || 'staff'
    )
  }

  if (!aiChatOpen) return null

  // Quick prompts for mobile (more compact)
  const quickPrompts = [
    { label: 'Ringkasan', fullText: 'Ringkasan operasi bulan ini' },
    { label: 'Kes', fullText: 'Senarai kes aktif' },
    { label: 'Derma', fullText: 'Stats derma bulan semasa' },
    { label: 'Sistem', fullText: 'Status sistem' },
  ]

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300"
        onClick={() => setAiChatOpen(false)}
      />
      <aside className={cn(
        "fixed z-40 flex flex-col bg-background border-l md:border-l shadow-xl transition-all duration-300",
        // Mobile: bottom sheet — full screen when expanded, 85vh when collapsed
        "inset-x-0 bottom-0 rounded-t-2xl border-t md:border-t",
        "pb-[env(safe-area-inset-bottom,0px)]",
        isExpanded
          ? "h-[95vh] max-h-[95vh]"
          : "h-[85vh] max-h-[85vh]",
        // Desktop: side panel
        "md:inset-y-0 md:right-0 md:left-auto md:top-0 md:h-full md:w-80 md:rounded-none md:pb-0",
      )}>
        {/* Mobile drag handle — swipe to dismiss area */}
        <div
          className="flex flex-col items-center pt-2 pb-1 md:hidden touch-manipulation cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header — compact on mobile */}
        <div className="flex items-center justify-between px-3 py-2 sm:p-3 border-b bg-primary text-primary-foreground rounded-t-2xl md:rounded-none">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 sm:h-8 sm:w-8 rounded-full overflow-hidden shrink-0">
              <img src={MARIA_PUSPA_AVATAR_URI} alt="Maria Puspa" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-xs font-bold leading-tight">Maria Puspa</h3>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                )} />
                <p className="text-[10px] opacity-80">
                  {isStreaming ? 'Memproses...' : 'Online'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Expand/collapse toggle — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden text-primary-foreground hover:bg-white/20 touch-manipulation"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Kecilkan' : 'Besarkan'}
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-7 sm:w-7 text-primary-foreground hover:bg-white/20 touch-manipulation"
              onClick={() => setAiChatOpen(false)}
              aria-label="Tutup sembang"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error banner */}
        {lastError && (
          <div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20 text-[10px] text-destructive flex items-center gap-1">
            <span className="truncate flex-1">{lastError}</span>
            <button className="ml-auto shrink-0 underline touch-manipulation" onClick={() => setLastError(null)}>✕</button>
          </div>
        )}

        {/* Context Badge — hidden on mobile to save space */}
        <div className="hidden sm:block px-3 pt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-primary/5 rounded-md px-2 py-1 border border-primary/10">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Context: {currentView}</span>
            <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1 border-primary/20 text-primary">
              {currentUser?.role || 'staff'}
            </Badge>
          </div>
        </div>

        {/* Quick Prompts — always visible at top on mobile when chat is new */}
        {messages.length <= 1 && !isStreaming && (
          <div className="px-3 pt-2 pb-1 border-b border-border/50 md:border-b-0">
            <p className="text-[10px] text-muted-foreground mb-1.5">Cadangan pantas:</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => {
                    setInput('')
                    sendMessage(prompt.fullText, currentView, currentUser?.id || 'anonymous', currentUser?.role || 'staff')
                  }}
                  className="flex items-center gap-1 text-[11px] rounded-full bg-primary/5 border border-primary/15 px-3 py-1.5 text-primary hover:bg-primary/10 transition-colors touch-manipulation whitespace-nowrap shrink-0 min-h-[36px]"
                >
                  <Sparkles className="h-3 w-3 shrink-0" />
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-3 py-2">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="space-y-3 overflow-y-auto"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2 sm:gap-2",
                  msg.role === 'user' && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "flex h-7 w-7 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full overflow-hidden",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-primary/10"
                )}>
                  {msg.role === 'user' ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <img src={MARIA_PUSPA_AVATAR_URI} alt="MP" className="h-full w-full rounded-full object-cover" />
                  )}
                </div>
                <div className={cn(
                  "rounded-2xl px-3 py-2 sm:py-2 text-[13px] sm:text-xs max-w-[88%] sm:max-w-[85%] leading-relaxed",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted border border-border rounded-tl-sm"
                )}>
                  {msg.content || (msg.isStreaming ? '' : '...')}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-1 h-3.5 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
                  )}
                  {msg.isStreaming && !msg.content && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  )}
                </div>
              </div>
            ))}

            {/* Loading when waiting for first chunk */}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                  <img src={MARIA_PUSPA_AVATAR_URI} alt="MP" className="h-full w-full rounded-full object-cover animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-3 py-2 bg-muted border border-border">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-[11px] text-muted-foreground">Memikir...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <div className="flex justify-center -mt-8 mb-1 relative z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full shadow-md touch-manipulation"
              onClick={() => scrollToBottom()}
              aria-label="Tatal ke bawah"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Tool Calls indicator — compact on mobile */}
        {toolCalls.length > 0 && (
          <div className="px-3 pb-1">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Wrench className="h-2.5 w-2.5" />
              <span>{toolCalls.length} tool{toolCalls.length > 1 ? 's' : ''}</span>
              <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 ml-1">
                {toolCalls.filter((tc) => tc.status === 'success').length}/{toolCalls.length}
              </Badge>
            </div>
          </div>
        )}

        {/* Input — mobile-optimized with larger touch targets */}
        <div className="border-t p-2 sm:p-3 bg-background">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-2 items-center"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="Tanya Maria Puspa..."
              className="h-11 sm:h-8 text-[15px] sm:text-xs border-primary/20 focus:border-primary touch-manipulation rounded-full px-4"
              disabled={isStreaming}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:hidden shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/5 touch-manipulation rounded-full"
              aria-label="Input suara"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 sm:h-8 sm:w-8 shrink-0 bg-primary hover:bg-primary/90 touch-manipulation rounded-full"
              disabled={isStreaming || !input.trim()}
              aria-label="Hantar mesej"
            >
              {isStreaming ? (
                <Loader2 className="h-5 w-5 sm:h-3.5 sm:w-3.5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
              )}
            </Button>
          </form>
          <p className="text-[9px] text-muted-foreground/50 mt-1 text-center hidden sm:block">
            Maria Puspa — Cerdas. Mesra. Sentiasa di sisi anda.
          </p>
        </div>
      </aside>
    </>
  )
}
