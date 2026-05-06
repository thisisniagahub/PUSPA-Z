import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewId = 
  | 'dashboard' | 'members' | 'cases' | 'programmes' | 'donations' 
  | 'disbursements' | 'volunteers' | 'compliance' | 'reports' | 'ekyc'
  | 'documents' | 'activities' | 'donors' | 'ai' | 'settings' 
  | 'tapsecure' | 'admin' | 'asnafpreneur' | 'sedekah-jumaat' | 'docs'
  | 'carta-organisasi' | 'institusi' | 'permohonan-bantuan'

interface AppState {
  // Navigation
  currentView: ViewId
  setView: (view: ViewId) => void
  
  // AI Chat
  aiChatOpen: boolean
  setAiChatOpen: (open: boolean) => void
  toggleAiChat: () => void
  
  // User (simulated for now)
  currentUser: {
    id: string
    name: string
    email: string
    role: 'staff' | 'admin' | 'developer'
    /** Data URL, https URL, or same-origin path — shown in UserAvatar when set */
    imageUrl?: string | null
  } | null
  setCurrentUser: (user: AppState['currentUser']) => void
  
  // Module search
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'dashboard',
      setView: (view) => set({ currentView: view }),
      
      aiChatOpen: false,
      setAiChatOpen: (open) => set({ aiChatOpen: open }),
      toggleAiChat: () => set((state) => ({ aiChatOpen: !state.aiChatOpen })),
      
      currentUser: {
        id: 'usr_admin_001',
        name: 'Admin PUSPA',
        email: 'admin@puspa.org',
        role: 'admin',
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'puspa-app-store',
      partialize: (state) => ({
        currentView: state.currentView,
        currentUser: state.currentUser,
      }),
    }
  )
)
