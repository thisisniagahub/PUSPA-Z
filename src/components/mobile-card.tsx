'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface MobileCardProps {
  id: string
  title: string
  subtitle?: string
  status?: {
    label: string
    className: string
  }
  category?: {
    label: string
    className: string
  }
  rightElement?: React.ReactNode
  onClick?: () => void
  loading?: boolean
}

export function MobileCard({
  id,
  title,
  subtitle,
  status,
  category,
  rightElement,
  onClick,
  loading
}: MobileCardProps) {
  if (loading) {
    return (
      <div className="p-4 border-b animate-pulse space-y-3">
        <div className="flex justify-between"><div className="h-3 w-20 bg-muted rounded" /><div className="h-4 w-12 bg-muted rounded-full" /></div>
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div 
      className="p-4 border-b active:bg-muted/50 transition-colors cursor-pointer group flex items-center gap-3"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{id}</span>
          {status && <Badge variant="outline" className={cn("text-[10px] px-2 py-0 border-none font-bold", status.className)}>{status.label}</Badge>}
        </div>
        <h4 className="font-bold text-sm text-foreground truncate">{title}</h4>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          {category && <span className={cn("text-[10px] font-medium", category.className)}>{category.label}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightElement}
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>
    </div>
  )
}