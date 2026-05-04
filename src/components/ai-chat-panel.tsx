'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useState, useRef, useEffect } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AiChatPanel() {
  const { aiChatOpen, setAiChatOpen, currentView } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hai! 🦞 Saya PUSPA, AI Assistant anda. Cerdas. Mesra. Sentiasa di sisi anda. Apa yang boleh saya bantu hari ini?',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/v1/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          currentView,
        }),
      })

      if (!res.ok) throw new Error('AI request failed')

      const data = await res.json()
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || data.message || 'Maaf, saya tidak dapat memproses permintaan anda.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terdapat ralat dalam memproses permintaan anda. Sila cuba lagi. 🦞',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!aiChatOpen) return null

  return (
    <aside className={cn(
      "fixed right-0 top-0 z-40 h-full w-80 border-l bg-background shadow-lg transition-all duration-300",
      "flex flex-col",
    )}>
      {/* Header - PUSPA AI Branded */}
      <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground">
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
            <h3 className="text-xs font-bold">PUSPA AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] opacity-80">Online • Hermes Runtime</p>
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

      {/* Context Badge */}
      <div className="px-3 pt-2">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-primary/5 rounded-md px-2 py-1 border border-primary/10">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Context: {currentView}</span>
          <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1 border-primary/20 text-primary">AI</Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div ref={scrollRef} className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto">
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
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
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

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-muted-foreground mb-1.5">Cadangan:</p>
          <div className="flex flex-wrap gap-1">
            {['Ringkasan operasi', 'Senarai kes', 'Daftar ahli baru', 'Status derma'].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
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
            placeholder="Tanya PUSPA sesuatu..."
            className="h-8 text-xs border-primary/20 focus:border-primary"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-8 w-8 shrink-0 bg-primary hover:bg-primary/90" 
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
        <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
          Cerdas. Mesra. Sentiasa di sisi anda. 🦞
        </p>
      </div>
    </aside>
  )
}
