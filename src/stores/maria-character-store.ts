import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MariaPresenceState = 'idle' | 'listening' | 'thinking' | 'speaking'
export type MariaEmotionState = 'neutral' | 'warm' | 'focus' | 'alert' | 'empathetic'

interface MariaSpeechState {
  isTTSOn: boolean
  autoReadLatest: boolean
  isPlaying: boolean
  phonemeEnergy: number
  currentUtteranceId: string | null
  preferredVoiceURI: string | null
}

interface MariaUiState {
  isWidgetOpen: boolean
  isPinned: boolean
  minimized: boolean
  unreadCount: number
}

interface MariaCharacterState {
  presenceState: MariaPresenceState
  emotionState: MariaEmotionState
  speechState: MariaSpeechState
  uiState: MariaUiState
  setEmotionState: (emotion: MariaEmotionState) => void
  setPresenceState: (presence: MariaPresenceState) => void
  setWidgetOpen: (open: boolean) => void
  setPinned: (pinned: boolean) => void
  setMinimized: (minimized: boolean) => void
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  resetUnread: () => void
  setTTSOn: (enabled: boolean) => void
  setAutoReadLatest: (enabled: boolean) => void
  setSpeechPlaying: (playing: boolean, utteranceId?: string | null) => void
  setPhonemeEnergy: (energy: number) => void
  setPreferredVoiceURI: (voiceURI: string | null) => void
  onUserStartInput: () => void
  onAiStreamStart: () => void
  onAiStreamChunk: () => void
  onAiStreamDone: () => void
  onToolCallStart: () => void
  onToolCallDone: () => void
  onRouteContextChange: (route: string) => void
}

const initialSpeechState: MariaSpeechState = {
  isTTSOn: true,
  autoReadLatest: true,
  isPlaying: false,
  phonemeEnergy: 0,
  currentUtteranceId: null,
  preferredVoiceURI: null,
}

const initialUiState: MariaUiState = {
  isWidgetOpen: false,
  isPinned: false,
  minimized: false,
  unreadCount: 0,
}

export const useMariaCharacterStore = create<MariaCharacterState>()(
  persist(
    (set, get) => ({
      presenceState: 'idle',
      emotionState: 'neutral',
      speechState: initialSpeechState,
      uiState: initialUiState,

      setEmotionState: (emotion) => set({ emotionState: emotion }),
      setPresenceState: (presence) => set({ presenceState: presence }),

      setWidgetOpen: (open) =>
        set((state) => ({
          uiState: { ...state.uiState, isWidgetOpen: open },
        })),

      setPinned: (pinned) =>
        set((state) => ({
          uiState: { ...state.uiState, isPinned: pinned },
        })),

      setMinimized: (minimized) =>
        set((state) => ({
          uiState: { ...state.uiState, minimized },
        })),

      setUnreadCount: (count) =>
        set((state) => ({
          uiState: { ...state.uiState, unreadCount: Math.max(0, count) },
        })),

      incrementUnread: () =>
        set((state) => ({
          uiState: { ...state.uiState, unreadCount: state.uiState.unreadCount + 1 },
        })),

      resetUnread: () =>
        set((state) => ({
          uiState: { ...state.uiState, unreadCount: 0 },
        })),

      setTTSOn: (enabled) =>
        set((state) => ({
          speechState: { ...state.speechState, isTTSOn: enabled },
        })),

      setAutoReadLatest: (enabled) =>
        set((state) => ({
          speechState: { ...state.speechState, autoReadLatest: enabled },
        })),

      setSpeechPlaying: (playing, utteranceId = null) =>
        set((state) => ({
          presenceState: playing ? 'speaking' : state.presenceState === 'speaking' ? 'idle' : state.presenceState,
          speechState: {
            ...state.speechState,
            isPlaying: playing,
            currentUtteranceId: playing ? utteranceId : null,
            phonemeEnergy: playing ? state.speechState.phonemeEnergy : 0,
          },
        })),

      setPhonemeEnergy: (energy) =>
        set((state) => ({
          speechState: { ...state.speechState, phonemeEnergy: Math.max(0, Math.min(1, energy)) },
        })),

      setPreferredVoiceURI: (voiceURI) =>
        set((state) => ({
          speechState: { ...state.speechState, preferredVoiceURI: voiceURI },
        })),

      onUserStartInput: () =>
        set({
          presenceState: 'listening',
          emotionState: 'focus',
        }),

      onAiStreamStart: () =>
        set({
          presenceState: 'thinking',
          emotionState: 'focus',
        }),

      onAiStreamChunk: () => {
        const { speechState } = get()
        if (!speechState.isPlaying) {
          set({
            presenceState: 'thinking',
          })
        }
      },

      onAiStreamDone: () =>
        set((state) => ({
          presenceState: state.speechState.isPlaying ? 'speaking' : 'idle',
          emotionState: state.emotionState === 'focus' ? 'neutral' : state.emotionState,
        })),

      onToolCallStart: () =>
        set({
          presenceState: 'thinking',
          emotionState: 'focus',
        }),

      onToolCallDone: () =>
        set((state) => ({
          presenceState: state.speechState.isPlaying ? 'speaking' : 'idle',
        })),

      onRouteContextChange: (route) => {
        if (route === 'compliance' || route === 'ekyc') {
          set({ emotionState: 'alert' })
          return
        }
        if (route === 'donations' || route === 'donors' || route === 'sedekah-jumaat') {
          set({ emotionState: 'warm' })
          return
        }
        set({ emotionState: 'neutral' })
      },
    }),
    {
      name: 'maria-character-store',
      partialize: (state) => ({
        speechState: {
          isTTSOn: state.speechState.isTTSOn,
          autoReadLatest: state.speechState.autoReadLatest,
          preferredVoiceURI: state.speechState.preferredVoiceURI,
        },
        uiState: {
          isPinned: state.uiState.isPinned,
        },
      }),
    }
  )
)

