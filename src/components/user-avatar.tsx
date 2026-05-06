'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function normalizeImageSrc(src: string | null | undefined): string | undefined {
  const s = src?.trim()
  if (!s) return undefined
  if (
    s.startsWith('data:') ||
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('/') ||
    s.startsWith('./')
  ) {
    return s
  }
  return undefined
}

/** Two-letter (or single) initials for staff display avatars — BM/EN safe. */
export function getUserInitials(name: string | null | undefined): string {
  const n = name?.trim()
  if (!n) return 'U'
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    const w = parts[0]
    return w.slice(0, Math.min(2, w.length)).toUpperCase()
  }
  const a = parts[0][0]
  const b = parts[parts.length - 1][0]
  return `${a}${b}`.toUpperCase()
}

const sizeRoot = {
  sm: 'h-8 w-8',
  chat: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
} as const

const sizeText = {
  sm: 'text-[10px] tracking-tight',
  chat: 'text-xs tracking-tight',
  md: 'text-sm tracking-tight',
  lg: 'text-lg tracking-tight',
} as const

export type UserAvatarSize = keyof typeof sizeRoot

export interface UserAvatarProps {
  name?: string | null
  /**
   * Profile photo URL: same-origin path, absolute http(s), or data URL.
   * When missing or invalid, initials fallback is shown.
   */
  src?: string | null
  /** Optional override when initials should not be derived from `name`. */
  label?: string | null
  className?: string
  fallbackClassName?: string
  size?: UserAvatarSize
}

export function UserAvatar({
  name,
  src,
  label,
  className,
  fallbackClassName,
  size = 'sm',
}: UserAvatarProps) {
  const raw = label?.trim() || getUserInitials(name)
  const initials = raw.slice(0, 2).toUpperCase()
  const imageSrc = normalizeImageSrc(src)

  return (
    <Avatar
      className={cn(
        sizeRoot[size],
        'shrink-0 ring-2 ring-background shadow-md',
        className
      )}
    >
      {imageSrc ? (
        <AvatarImage
          src={imageSrc}
          alt={name?.trim() ? `Avatar ${name.trim()}` : 'Avatar pengguna'}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback
        className={cn(
          'rounded-full bg-gradient-to-br from-violet-600 via-purple-700 to-purple-950 text-white font-semibold tabular-nums antialiased border border-white/25',
          sizeText[size],
          fallbackClassName
        )}
      >
        {initials || 'U'}
      </AvatarFallback>
    </Avatar>
  )
}
