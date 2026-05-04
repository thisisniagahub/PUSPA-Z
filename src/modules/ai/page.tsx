'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, ScrollArea, Separator,
} from '@/components/ui'
import {
  Send, Bot, User, Loader2, Sparkles, Cpu, MessageSquare,
  Zap, History, ArrowRight, RotateCcw, Terminal,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
  toolCalls?: string[]
}

interface ToolCallLog {
  id: string
  tool: string
  status: 'success' | 'error' | 'pending'
  timestamp: Date
}

/* ─── Suggested Prompts ────────────────────────────────── */
const suggestedPrompts = [
  { label: 'Ringkasan operasi bulan ini', icon: History },
  { label: 'Senarai kes menunggu kelulusan', icon: MessageSquare },
  { label: 'Bantu saya daftar ahli baru', icon: Zap },
  { label: 'Terangkan kategori asnaf', icon: Sparkles },
]

/* ─── Component ────────────────────────────────────────── */
export default function AiPage() {
  const { currentView } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Salam! 🦞 Saya PUSPA AI (Hermes Runtime). Saya boleh bantu anda dengan pengurusan asnaf, kes, derma, agihan, program, pematuhan, dan operasi NGO. Apa yang boleh saya bantu hari ini?',
      timestamp: new Date(),
      model: 'hermes',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [modelName, setModelName] = useState('hermes')
  const [toolCalls, setToolCalls] = useState<ToolCallLog[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(async (overrideInput?: string) => {
    const text = overrideInput || input.trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
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
        content: data.content || 'Maaf, saya tidak dapat memproses permintaan anda.',
        timestamp: new Date(),
        model: data.model || 'hermes',
      }
      setModelName(data.model || 'hermes')
      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terdapat ralat dalam memproses permintaan anda. Sila cuba lagi. 🦞',
        timestamp: new Date(),
        model: 'fallback',
      }
      setMessages(prev => [...prev, errorMessage])
      setModelName('fallback')
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, currentView])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Salam! 🦞 Saya PUSPA AI (Hermes Runtime). Apa yang boleh saya bantu hari ini?',
        timestamp: new Date(),
        model: 'hermes',
      },
    ])
    setToolCalls([])
    inputRef.current?.focus()
  }

  const userMessages = messages.filter(m => m.role === 'user')
  const aiMessages = messages.filter(m => m.role === 'assistant')

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PUSPA AI — Hermes Runtime</h1>
            <p className="text-sm text-muted-foreground">AI assistant untuk pengurusan NGO</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Cpu className="h-3 w-3" />
            {modelName}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Terminal className="h-3 w-3" />
            v4.0
          </Badge>
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-1">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Layout: Chat + Context Panel */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Chat Area (70%) */}
        <Card className="flex-1 lg:flex-[7] flex flex-col min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div ref={scrollRef} className="space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <span className="text-sm">🦞</span>}
                  </div>
                  {/* Bubble */}
                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-2 mt-1 text-[10px] text-muted-foreground ${
                      msg.role === 'user' ? 'justify-end' : ''
                    }`}>
                      <span>{msg.timestamp.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.model && msg.role === 'assistant' && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{msg.model}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    <span className="text-sm">🦞</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Hermes sedang berfikir...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Prompts (show when few messages) */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Cadangan soalan:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt.label}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleSend(prompt.label)}
                  >
                    <prompt.icon className="h-3 w-3" />
                    {prompt.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya Hermes sesuatu..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Context Panel (30%) */}
        <div className="lg:flex-[3] space-y-4">
          {/* Current Context */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
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
                <Badge variant="outline">{modelName}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {isLoading ? 'Memproses...' : 'Sedia'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
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
                <span className="text-xs text-muted-foreground">Sesi Bermula</span>
                <span className="text-xs text-muted-foreground">
                  {messages[0]?.timestamp.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tool Calls Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-violet-500" />
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
                      <span className="font-mono">{tc.tool}</span>
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${
                        tc.status === 'success' ? 'text-green-600' : tc.status === 'error' ? 'text-red-600' : 'text-amber-600'
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
                <ArrowRight className="h-4 w-4 text-emerald-500" />
                Tindakan Pantas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2" onClick={() => handleSend('Ringkasan operasi bulan ini')}>
                <History className="h-3 w-3" />
                Ringkasan Bulanan
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2" onClick={() => handleSend('Senarai kes menunggu kelulusan')}>
                <MessageSquare className="h-3 w-3" />
                Kes Menunggu
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2" onClick={() => handleSend('Bantu saya daftar ahli baru')}>
                <Zap className="h-3 w-3" />
                Daftar Ahli
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
  )
}
