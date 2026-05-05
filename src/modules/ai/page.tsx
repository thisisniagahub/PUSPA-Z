'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useHermesStore } from '@/stores/hermes-store'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, ScrollArea, Separator,
} from '@/components/ui'
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion'
import {
  Send, User, Loader2, Sparkles, Cpu, MessageSquare,
  Zap, History, ArrowRight, RotateCcw, Terminal,
  AlertCircle, Wrench, ChevronDown, ArrowDown, Mic,
} from 'lucide-react'
import { MARIA_PUSPA_AVATAR_URI } from '@/lib/maria-avatar'

/* ─── Suggested Prompts ────────────────────────────────── */
const suggestedPrompts = [
  { label: 'Ringkasan operasi bulan ini', icon: History },
  { label: 'Senarai kes menunggu kelulusan', icon: MessageSquare },
  { label: 'Statistik derma bulan semasa', icon: Zap },
  { label: 'Terangkan kategori asnaf', icon: Sparkles },
]

/* ─── Component ────────────────────────────────────────── */
export default function AiPage() {
  const { currentView, currentUser } = useAppStore()
  const {
    messages, isStreaming, modelName, toolCalls, lastError,
    sendMessage, clearMessages, setLastError,
  } = useHermesStore()

  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
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

  // Detect scroll position for "scroll to bottom" button
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollBtn(!isNearBottom)
  }, [])

  const handleSend = useCallback(async (overrideInput?: string) => {
    const text = overrideInput || input.trim()
    if (!text || isStreaming) return

    setInput('')
    await sendMessage(
      text,
      currentView,
      currentUser?.id || 'anonymous',
      currentUser?.role || 'staff'
    )
  }, [input, currentView, currentUser, isStreaming, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    clearMessages()
    inputRef.current?.focus()
  }

  const userMessages = messages.filter((m) => m.role === 'user')
  const aiMessages = messages.filter((m) => m.role === 'assistant')

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] gap-3 sm:gap-4">
      {/* Header — simplified on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 overflow-hidden">
            <img src={MARIA_PUSPA_AVATAR_URI} alt="Maria Puspa" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">Maria Puspa</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">AI Assistant — Cerdas. Mesra. Sentiasa di sisi anda.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hide some badges on mobile to reduce clutter */}
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
              <Cpu className="h-3 w-3" />
              Maria Puspa
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Terminal className="h-3 w-3" />
              v4.0
            </Badge>
          </div>
          <Badge variant="outline" className="gap-1 text-[10px]">
            {currentUser?.role || 'staff'}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-1 touch-manipulation min-h-[36px]">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {lastError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 sm:px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="truncate text-xs sm:text-sm">{lastError}</span>
          <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={() => setLastError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Layout — stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 flex-1 min-h-0 overflow-hidden">

        {/* Chat Area */}
        <Card className="flex-1 lg:flex-[7] flex flex-col min-h-0 relative">
          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full overflow-hidden ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4 sm:h-4 sm:w-4" />
                    ) : (
                      <img src={MARIA_PUSPA_AVATAR_URI} alt="MP" className="h-full w-full rounded-full object-cover" />
                    )}
                  </div>
                  <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block rounded-2xl px-4 py-3 sm:py-2.5 text-sm sm:text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      {msg.content || (msg.isStreaming ? '' : '...')}
                      {msg.isStreaming && !msg.content && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary inline-block" />
                      )}
                      {msg.isStreaming && msg.content && (
                        <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
                      )}
                    </div>
                    <div className={`flex items-center gap-2 mt-1 text-[10px] text-muted-foreground ${
                      msg.role === 'user' ? 'justify-end' : ''
                    }`}>
                      <span>{msg.timestamp.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.model && msg.role === 'assistant' && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 hidden sm:inline-flex">Maria Puspa</Badge>
                      )}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 gap-0.5">
                          <Wrench className="h-2.5 w-2.5" />
                          {msg.toolCalls.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator when waiting for first chunk */}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                    <img src={MARIA_PUSPA_AVATAR_URI} alt="MP" className="h-full w-full rounded-full object-cover animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Maria Puspa sedang berfikir...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full shadow-lg touch-manipulation"
                onClick={() => scrollToBottom()}
                aria-label="Tatal ke bawah"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Suggested Prompts — compact pills on mobile */}
          {messages.length <= 2 && !isStreaming && (
            <div className="px-2 sm:px-4 pb-2">
              <p className="text-[11px] sm:text-xs text-muted-foreground mb-1.5">Cadangan:</p>
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt.label}
                    variant="outline"
                    size="sm"
                    className="gap-1 text-[12px] sm:text-xs hover:bg-primary/5 hover:border-primary/30 hover:text-primary justify-center min-h-[36px] sm:min-h-0 touch-manipulation whitespace-nowrap shrink-0 rounded-full px-3"
                    onClick={() => handleSend(prompt.label)}
                  >
                    <prompt.icon className="h-3.5 w-3.5 sm:h-3 sm:w-3 shrink-0" />
                    <span className="hidden sm:inline">{prompt.label}</span>
                    <span className="sm:hidden">{prompt.label.split(' ').slice(0, 2).join(' ')}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input — mobile-optimized with round inputs */}
          <div className="border-t p-2 sm:p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-2 items-center">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya Maria Puspa..."
                className="flex-1 focus-visible:ring-primary h-11 sm:h-9 text-[15px] sm:text-sm touch-manipulation rounded-full px-4 border-primary/20"
                disabled={isStreaming}
              />
              {/* Mic button — mobile only */}
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 sm:hidden shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/5 touch-manipulation rounded-full"
                aria-label="Input suara"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => handleSend()}
                disabled={isStreaming || !input.trim()}
                size="icon"
                className="shrink-0 bg-primary hover:bg-primary/90 h-11 w-11 sm:h-9 sm:w-9 touch-manipulation rounded-full"
                aria-label="Hantar mesej"
              >
                <Send className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Context Panel — collapsible on mobile, sidebar on desktop */}
        <div className="lg:flex-[3]">
          {/* Mobile: collapsible accordion for context */}
          <div className="lg:hidden">
            <Accordion type="single" collapsible defaultValue="character" className="border rounded-lg bg-card">
              <AccordionItem value="character" className="border-b-0">
                <AccordionTrigger className="px-3 py-2.5 text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6 rounded-full overflow-hidden bg-primary/10 shrink-0">
                      <img src={MARIA_PUSPA_AVATAR_URI} alt="MP" className="h-full w-full rounded-full object-cover" />
                    </div>
                    <span>Maria Puspa</span>
                    <Badge variant="secondary" className="text-[9px] bg-emerald-100 text-emerald-700 ml-1">Online</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Peranan</span>
                      <span className="text-xs font-medium">AI Assistant & Data Operator</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Personaliti</span>
                      <span className="text-xs">Cerdas, Mesra, Profesional</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Bahasa</span>
                      <span className="text-xs">BM & English</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tool Access</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{currentUser?.role || 'staff'}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Modul Aktif</span>
                      <Badge variant="secondary" className="capitalize text-[10px]">{currentView}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[10px]">
                        {isStreaming ? 'Memproses...' : 'Sedia'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-lg font-semibold">{messages.length}</p>
                        <p className="text-[10px] text-muted-foreground">Jumlah Mesej</p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-lg font-semibold">{toolCalls.length}</p>
                        <p className="text-[10px] text-muted-foreground">Tool Calls</p>
                      </div>
                    </div>
                    {toolCalls.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-medium text-muted-foreground">Log Tool Calls</p>
                          <div className="max-h-24 overflow-y-auto space-y-1">
                            {toolCalls.map((tc) => (
                              <div key={tc.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Wrench className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-mono text-[10px]">{tc.tool}</span>
                                </div>
                                <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${
                                  tc.status === 'success' ? 'text-emerald-600' : tc.status === 'error' ? 'text-red-600' : 'text-amber-600'
                                }`}>
                                  {tc.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Quick Actions — full-width on mobile */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start text-xs gap-1.5 hover:bg-primary/5 hover:border-primary/30 hover:text-primary touch-manipulation min-h-[44px]" onClick={() => handleSend('Ringkasan operasi bulan ini')}>
                <History className="h-3 w-3 shrink-0" />
                <span className="truncate">Ringkasan</span>
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs gap-1.5 hover:bg-primary/5 hover:border-primary/30 hover:text-primary touch-manipulation min-h-[44px]" onClick={() => handleSend('Senarai kes menunggu kelulusan')}>
                <MessageSquare className="h-3 w-3 shrink-0" />
                <span className="truncate">Kes Menunggu</span>
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs gap-1.5 hover:bg-primary/5 hover:border-primary/30 hover:text-primary touch-manipulation min-h-[44px]" onClick={() => handleSend('Statistik derma bulan semasa')}>
                <Zap className="h-3 w-3 shrink-0" />
                <span className="truncate">Stats Derma</span>
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs gap-1.5 touch-manipulation min-h-[44px]" onClick={handleClear}>
                <RotateCcw className="h-3 w-3 shrink-0" />
                <span className="truncate">Reset</span>
              </Button>
            </div>
          </div>

          {/* Desktop: full sidebar layout */}
          <div className="hidden lg:block space-y-4">
            {/* Maria Puspa Character Card */}
            <Card className="overflow-hidden">
              <div className="bg-primary p-3 flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-white/20 shrink-0">
                  <img src={MARIA_PUSPA_AVATAR_URI} alt="Maria Puspa" className="h-10 w-10 rounded-full object-cover" />
                </div>
                <div className="text-primary-foreground">
                  <p className="text-sm font-bold">Maria Puspa</p>
                  <p className="text-[10px] opacity-80">Cerdas. Mesra. Sentiasa di sisi anda.</p>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Peranan</span>
                  <span className="text-xs font-medium">AI Assistant & Data Operator</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Personaliti</span>
                  <span className="text-xs">Cerdas, Mesra, Profesional</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Bahasa</span>
                  <span className="text-xs">BM & English</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ketersediaan</span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">24/7 Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tool Access</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{currentUser?.role || 'staff'}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Current Context */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Konteks Semasa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Modul Aktif</span>
                  <Badge variant="secondary" className="capitalize">{currentView}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Model</span>
                  <Badge variant="outline">Maria Puspa</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {isStreaming ? 'Memproses...' : 'Sedia'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Streaming</span>
                  <Badge variant={isStreaming ? 'default' : 'outline'} className="text-[10px]">
                    {isStreaming ? 'Aktif' : 'Sedia'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Conversation Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Statistik Perbualan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Jumlah Mesej</span>
                  <span className="text-sm font-semibold">{messages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Mesej Pengguna</span>
                  <span className="text-sm font-semibold">{userMessages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Respons AI</span>
                  <span className="text-sm font-semibold">{aiMessages.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tool Calls</span>
                  <span className="text-sm font-semibold">{toolCalls.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tool Calls Log */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  Log Tool Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                {toolCalls.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Tiada tool calls setakat ini
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {toolCalls.map((tc) => (
                      <div key={tc.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Wrench className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{tc.tool}</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${
                          tc.status === 'success' ? 'text-emerald-600' : tc.status === 'error' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {tc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  Tindakan Pantas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 hover:bg-primary/5 hover:border-primary/30 hover:text-primary" onClick={() => handleSend('Ringkasan operasi bulan ini')}>
                  <History className="h-3 w-3" />
                  Ringkasan Bulanan
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 hover:bg-primary/5 hover:border-primary/30 hover:text-primary" onClick={() => handleSend('Senarai kes menunggu kelulusan')}>
                  <MessageSquare className="h-3 w-3" />
                  Kes Menunggu
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 hover:bg-primary/5 hover:border-primary/30 hover:text-primary" onClick={() => handleSend('Statistik derma bulan semasa')}>
                  <Zap className="h-3 w-3" />
                  Stats Derma
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2" onClick={handleClear}>
                  <RotateCcw className="h-3 w-3" />
                  Reset Perbualan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
