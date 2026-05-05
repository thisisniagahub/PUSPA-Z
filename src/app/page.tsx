'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { useAppStore } from '@/lib/store'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { ViewRenderer } from '@/components/view-renderer'
import { AiChatPanel } from '@/components/ai-chat-panel'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

// Check if Supabase is configured
const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { currentUser, setCurrentUser } = useAppStore()

  // Sync Supabase auth user with app store
  useEffect(() => {
    if (user && isSupabaseConfigured) {
      const role = (user.user_metadata?.role as 'staff' | 'admin' | 'developer') || 'staff'
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna'
      setCurrentUser({
        id: user.id,
        name,
        email: user.email || '',
        role,
      })
    }
  }, [user, setCurrentUser])

  // Redirect to login if Supabase is configured and user is not authenticated
  useEffect(() => {
    if (isSupabaseConfigured && !loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading screen while checking auth
  if (isSupabaseConfigured && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/puspa-logo-official.png"
            alt="PUSPA Logo"
            className="h-16 w-16 object-contain rounded-full bg-white p-1"
            style={{ animation: 'puspa-spin 4s linear infinite' }}
          />
          <style>{`
            @keyframes puspa-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce" />
          </div>
          <p className="text-sm text-muted-foreground">Memuatkan...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting to login
  if (isSupabaseConfigured && !user) {
    return null
  }

  // Main app (authenticated or no Supabase = simulated auth)
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <ViewRenderer />
        </main>
      </SidebarInset>

      {/* AI Chat Panel — fixed positioned, no margin shift needed */}
      <AiChatPanel />
    </SidebarProvider>
  )
}
