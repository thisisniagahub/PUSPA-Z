// PUSPA V5 — Supabase Realtime Hook
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  table: string
  schema?: string
  filter?: string
  onInsert?: (payload: unknown) => void
  onUpdate?: (payload: unknown) => void
  onDelete?: (payload: unknown) => void
}

export function useRealtime({ 
  table, 
  schema = 'public', 
  filter, 
  onInsert, 
  onUpdate, 
  onDelete 
}: UseRealtimeOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()
  
  useEffect(() => {
    const channelName = `realtime:${table}:${filter || 'all'}`
    const ch = supabase.channel(channelName)
    
    // Listen for INSERT
    if (onInsert) {
      ch.on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema,
          table,
          ...(filter ? { filter } : {})
        },
        (payload) => {
          console.log(`[Realtime] INSERT on ${table}:`, payload)
          onInsert(payload.new)
        }
      )
    }
    
    // Listen for UPDATE
    if (onUpdate) {
      ch.on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema,
          table,
          ...(filter ? { filter } : {})
        },
        (payload) => {
          console.log(`[Realtime] UPDATE on ${table}:`, payload)
          onUpdate(payload.new)
        }
      )
    }
    
    // Listen for DELETE
    if (onDelete) {
      ch.on(
        'postgres_changes' as any,
        {
          event: 'DELETE',
          schema,
          table,
          ...(filter ? { filter } : {})
        },
        (payload) => {
          console.log(`[Realtime] DELETE on ${table}:`, payload)
          onDelete(payload.old)
        }
      )
    }
    
    // Subscribe
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to ${table}`)
      }
    })
    
    setChannel(ch)
    
    // Cleanup on unmount
    return () => {
      if (ch) {
        supabase.removeChannel(ch)
        console.log(`[Realtime] Unsubscribed from ${table}`)
      }
    }
  }, [table, schema, filter])
  
  return { channel }
}
