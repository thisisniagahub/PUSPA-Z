'use client'

import { useAppStore } from '@/lib/store'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { ViewRenderer } from '@/components/view-renderer'
import { AiChatPanel } from '@/components/ai-chat-panel'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export default function Home() {
  const { aiChatOpen } = useAppStore()

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className={cn(
        "transition-all duration-300",
        aiChatOpen ? "md:mr-80" : "mr-0"
      )}>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <ViewRenderer />
        </main>
      </SidebarInset>

      {/* AI Chat Panel */}
      <AiChatPanel />
    </SidebarProvider>
  )
}
