'use client'

import { useAppStore } from '@/lib/store'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { ViewRenderer } from '@/components/view-renderer'
import { AiChatPanel } from '@/components/ai-chat-panel'
import { cn } from '@/lib/utils'

export default function Home() {
  const { sidebarOpen, aiChatOpen } = useAppStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "ml-0",
        aiChatOpen ? "md:mr-80" : "mr-0"
      )}>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <ViewRenderer />
        </main>
      </div>

      {/* AI Chat Panel */}
      <AiChatPanel />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => useAppStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
