'use client'

import { useAppStore } from '@/lib/store'
import { useHermesStore } from '@/stores/hermes-store'
import { cn } from '@/lib/utils'
import { X, Send, User, Loader2, Sparkles, Wrench, Mic, ChevronDown, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useState, useRef, useEffect, useCallback } from 'react'
import { MariaCharacterRenderer } from '@/components/maria/maria-character-renderer'
import { useMariaCharacterStore } from '@/stores/maria-character-store'
import { getMariaEmotionState } from '@/lib/maria-emotion-map'

export function AiChatPanel() {
  const { aiChatOpen, setAiChatOpen, currentView, currentUser } = useAppStore()
  const {
    messages, isStreaming, modelName, toolCalls, lastError,
    sendMessage, setLastError, clearMessages,
  } = useHermesStore()
  const {
    presenceState,
    emotionState,
    speechState,
    onUserStartInput,
    onAiStreamStart,
    onAiStreamChunk,
    onAiStreamDone,
    onRouteContextChange,
    setEmotionState,
  } = useMariaCharacterStore()

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

  useEffect(() => {
    onRouteContextChange(currentView)
  }, [currentView, onRouteContextChange])

  useEffect(() => {
    if (isStreaming) onAiStreamStart()
    else onAiStreamDone()
  }, [isStreaming, onAiStreamStart, onAiStreamDone])

  useEffect(() => {
    if (!isStreaming) return
    onAiStreamChunk()
  }, [messages, isStreaming, onAiStreamChunk])

  useEffect(() => {
    if (isStreaming) return
    const lastAssistant = [...messages].reverse().find((msg) => msg.role === 'assistant' && msg.content?.trim())
    if (!lastAssistant) return
    setEmotionState(
      getMariaEmotionState({
        route: currentView,
        replyText: lastAssistant.content,
        hasToolCalls: Boolean(lastAssistant.toolCalls?.length),
        hasError: Boolean(lastError),
      })
    )
  }, [messages, isStreaming, currentView, lastError, setEmotionState])

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
    onUserStartInput()
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
        // Desktop: side panel — wider for better readability
        "md:inset-y-0 md:right-0 md:left-auto md:top-0 md:h-full md:w-96 md:rounded-none md:pb-0",
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

        {/* Header — consistent sizing */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-2xl md:rounded-none">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0">
              <MariaCharacterRenderer
                className="h-9 w-9 rounded-full overflow-hidden"
                presenceState={presenceState}
                emotionState={emotionState}
                phonemeEnergy={speechState.phonemeEnergy}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-tight">Maria Puspa</h3>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                )} />
                <p className="text-xs opacity-80">
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
              className="h-8 w-8 text-primary-foreground hover:bg-white/20 touch-manipulation"
              onClick={() => setAiChatOpen(false)}
              aria-label="Tutup sembang"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error banner */}
        {lastError && (
          <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-xs text-destructive flex items-center gap-1">
            <span className="truncate flex-1">{lastError}</span>
            <button className="ml-auto shrink-0 underline touch-manipulation" onClick={() => setLastError(null)}>✕</button>
          </div>
        )}

        {/* Context Badge — desktop only */}
        <div className="hidden md:block px-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/5 rounded-md px-2 py-1 border border-primary/10">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Context: {currentView}</span>
            <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1.5 border-primary/20 text-primary">
              {currentUser?.role || 'staff'}
            </Badge>
          </div>
        </div>

        {/* Quick Prompts — always visible at top on mobile when chat is new */}
        {messages.length <= 1 && !isStreaming && (
          <div className="px-4 pt-2 pb-2 border-b border-border/50 md:border-b-0">
            <p className="text-xs text-muted-foreground mb-1.5">Cadangan pantas:</p>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => {
                    setInput('')
                    sendMessage(prompt.fullText, currentView, currentUser?.id || 'anonymous', currentUser?.role || 'staff')
                  }}
                  className="flex items-center gap-1.5 text-xs rounded-full bg-primary/5 border border-primary/15 px-3 py-2 text-primary hover:bg-primary/10 transition-colors touch-manipulation whitespace-nowrap shrink-0 min-h-[36px]"
                >
                  <Sparkles className="h-3 w-3 shrink-0" />
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages — single scroll container, no nested overflow */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="px-4 py-3 space-y-3"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2.5",
                    msg.role === 'user' && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden",
                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  )}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <MariaCharacterRenderer
                        className="h-full w-full rounded-full overflow-hidden"
                        presenceState={presenceState}
                        emotionState={emotionState}
                        phonemeEnergy={speechState.phonemeEnergy}
                      />
                    )}
                  </div>
                  <div className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] leading-relaxed break-words",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted border border-border rounded-tl-sm"
                  )}>
                    <span className="whitespace-pre-wrap">{msg.content || (msg.isStreaming ? '' : '...')}</span>
                    {msg.isStreaming && msg.content && (
                      <span className="inline-block w-1 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
                    )}
                    {msg.isStreaming && !msg.content && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                </div>
              ))}

              {/* Loading when waiting for first chunk */}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-2.5">
                  <MariaCharacterRenderer
                    className="h-8 w-8 shrink-0 rounded-full overflow-hidden"
                    presenceState={presenceState}
                    emotionState={emotionState}
                    phonemeEnergy={speechState.phonemeEnergy}
                  />
                  <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 bg-muted border border-border">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Memikir...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

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

        {/* Tool Calls indicator */}
        {toolCalls.length > 0 && (
          <div className="px-4 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wrench className="h-3 w-3" />
              <span>{toolCalls.length} tool{toolCalls.length > 1 ? 's' : ''}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                {toolCalls.filter((tc) => tc.status === 'success').length}/{toolCalls.length}
              </Badge>
            </div>
          </div>
        )}

        {/* Input — consistent sizing */}
        <div className="border-t p-3 bg-background">
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
              className="h-10 text-sm border-primary/20 focus:border-primary touch-manipulation rounded-full px-4"
              disabled={isStreaming}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 md:hidden shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/5 touch-manipulation rounded-full"
              aria-label="Input suara"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 touch-manipulation rounded-full"
              disabled={isStreaming || !input.trim()}
              aria-label="Hantar mesej"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-center hidden md:block">
            Maria Puspa — Cerdas. Mesra. Sentiasa di sisi anda.
          </p>
        </div>
      </aside>
    </>
  )
}
