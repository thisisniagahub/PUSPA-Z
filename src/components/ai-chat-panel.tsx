'use client'

import { useAppStore } from '@/lib/store'
import { useHermesStore } from '@/stores/hermes-store'
import { cn } from '@/lib/utils'
import { X, Send, User, Loader2, Sparkles, Wrench } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useState, useRef, useEffect } from 'react'

export function AiChatPanel() {
  const { aiChatOpen, setAiChatOpen, currentView, currentUser } = useAppStore()
  const {
    messages, isStreaming, modelName, toolCalls, lastError,
    sendMessage, setLastError,
  } = useHermesStore()

  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setAiChatOpen(false)} />
      <aside className={cn(
        "fixed z-40 flex flex-col bg-background border-l md:border-l shadow-lg transition-all duration-300",
        "inset-x-0 bottom-0 h-[70vh] rounded-t-2xl border-t md:border-t",
        "md:inset-y-0 md:right-0 md:left-auto md:top-0 md:h-full md:w-80 md:rounded-none",
      )}>
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-2xl md:rounded-none">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-white/20 shrink-0">
              <Image
                src="/puspa-logo-transparent.png"
                alt="PUSPA"
                width={32}
                height={32}
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <h3 className="text-xs font-bold">Hermes AI</h3>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  isStreaming ? "bg-amber-400" : "bg-emerald-400"
                )} />
                <p className="text-[10px] opacity-80">
                  {isStreaming ? 'Memproses...' : 'Online'} • {modelName}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground hover:bg-white/20"
            onClick={() => setAiChatOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error banner */}
        {lastError && (
          <div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20 text-[10px] text-destructive flex items-center gap-1">
            <span className="truncate">{lastError}</span>
            <button className="ml-auto shrink-0 underline" onClick={() => setLastError(null)}>✕</button>
          </div>
        )}

        {/* Context Badge */}
        <div className="px-3 pt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-primary/5 rounded-md px-2 py-1 border border-primary/10">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Context: {currentView}</span>
            <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1 border-primary/20 text-primary">
              {currentUser?.role || 'staff'}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-3 py-2">
          <div ref={scrollRef} className="space-y-3 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === 'user' && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full overflow-hidden",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-primary/10"
                )}>
                  {msg.role === 'user' ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Image
                      src="/puspa-logo-transparent.png"
                      alt="PUSPA"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  )}
                </div>
                <div className={cn(
                  "rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border border-border"
                )}>
                  {msg.content || (msg.isStreaming ? '' : '...')}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-1 h-3 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
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
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                  <Image
                    src="/puspa-logo-transparent.png"
                    alt="PUSPA"
                    width={20}
                    height={20}
                    className="object-contain animate-pulse"
                  />
                </div>
                <div className="rounded-xl px-3 py-2 bg-muted border border-border">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Tool Calls indicator */}
        {toolCalls.length > 0 && (
          <div className="px-3 pb-1">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Wrench className="h-2.5 w-2.5" />
              <span>{toolCalls.length} tool call{toolCalls.length > 1 ? 's' : ''}</span>
              <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 ml-1">
                {toolCalls.filter((tc) => tc.status === 'success').length}/{toolCalls.length}
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Prompts */}
        {messages.length <= 1 && !isStreaming && (
          <div className="px-3 pb-2">
            <p className="text-[10px] text-muted-foreground mb-1.5">Cadangan:</p>
            <div className="flex flex-wrap gap-1">
              {['Ringkasan operasi', 'Senarai kes', 'Stats derma', 'Status sistem'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput('')
                    sendMessage(prompt, currentView, currentUser?.id || 'anonymous', currentUser?.role || 'staff')
                  }}
                  className="text-[10px] rounded-full bg-primary/5 border border-primary/15 px-2.5 py-1 text-primary hover:bg-primary/10 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya Hermes sesuatu..."
              className="h-8 text-xs border-primary/20 focus:border-primary"
              disabled={isStreaming}
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0 bg-primary hover:bg-primary/90"
              disabled={isStreaming || !input.trim()}
            >
              {isStreaming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </form>
          <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
            Hermes Runtime • Cerdas. Mesra. Sentiasa di sisi anda. 🦞
          </p>
        </div>
      </aside>
    </>
  )
}
