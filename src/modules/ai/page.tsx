'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useHermesStore } from '@/stores/hermes-store'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, ScrollArea, Separator,
} from '@/components/ui'
import {
  Send, User, Loader2, Sparkles, Cpu, MessageSquare,
  Zap, History, ArrowRight, RotateCcw, Terminal,
  AlertCircle, Wrench,
} from 'lucide-react'
import { PuspaLogo } from '@/components/puspa-logo'

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
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 overflow-hidden">
            <PuspaLogo size={40} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">PUSPA AI</h1>
            <p className="text-sm text-muted-foreground">Hermes Runtime • Cerdas. Mesra. Sentiasa di sisi anda. 🦞</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
            <Cpu className="h-3 w-3" />
            {modelName}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Terminal className="h-3 w-3" />
            v4.0
          </Badge>
          <Badge variant="outline" className="gap-1 text-[10px]">
            {currentUser?.role || 'staff'}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-1">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {lastError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{lastError}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setLastError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Chat Area (70%) */}
        <Card className="flex-1 lg:flex-[7] flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div ref={scrollRef} className="space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <PuspaLogo size={20} className="text-primary" />
                    )}
                  </div>
                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
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
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{msg.model}</Badge>
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
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                    <PuspaLogo size={20} className="text-primary animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Hermes sedang berfikir...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Prompts */}
          {messages.length <= 2 && !isStreaming && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Cadangan soalan:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt.label}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
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
                className="flex-1 focus-visible:ring-primary"
                disabled={isStreaming}
              />
              <Button
                onClick={() => handleSend()}
                disabled={isStreaming || !input.trim()}
                size="icon"
                className="shrink-0 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Context Panel (30%) */}
        <div className="lg:flex-[3] space-y-4">
          {/* PUSPA Character Card */}
          <Card className="overflow-hidden">
            <div className="bg-primary p-3 flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-white/20 shrink-0">
                <PuspaLogo size={32} className="text-primary-foreground" animate />
              </div>
              <div className="text-primary-foreground">
                <p className="text-sm font-bold">Hermes AI Operator</p>
                <p className="text-[10px] opacity-80">Cerdas. Mesra. Sentiasa di sisi anda.</p>
              </div>
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Peranan</span>
                <span className="text-xs font-medium">AI Operator & Data Assistant</span>
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
                <Badge variant="outline">{modelName}</Badge>
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
  )
}
