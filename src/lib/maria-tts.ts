import { MariaLipSyncController } from '@/lib/maria-lipsync'

export interface MariaTtsOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onPause?: () => void
  onResume?: () => void
  onError?: (message: string) => void
  onLipSyncFrame?: (energy: number) => void
}

export class MariaTtsEngine {
  private utterance: SpeechSynthesisUtterance | null = null
  private lipSyncController: MariaLipSyncController | null = null
  private preferredVoice: SpeechSynthesisVoice | null = null

  static isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  private getPreferredLanguagePool(voices: SpeechSynthesisVoice[], lang: string) {
    const normalized = lang.toLowerCase()
    const preferredLangs = [normalized, 'ms-my', 'id-id', 'en-us', 'en-gb']

    for (const preferred of preferredLangs) {
      const matched = voices.filter((voice) => voice.lang.toLowerCase() === preferred)
      if (matched.length) return matched
    }

    const base = normalized.split('-')[0]
    const byBase = voices.filter((voice) => voice.lang.toLowerCase().startsWith(base))
    if (byBase.length) return byBase

    const malayFallback = voices.filter((voice) => voice.lang.toLowerCase().startsWith('ms'))
    if (malayFallback.length) return malayFallback

    return voices
  }

  private scoreFemaleVoice(voice: SpeechSynthesisVoice) {
    const lowerName = `${voice.name} ${voice.lang}`.toLowerCase()
    const femaleHints = [
      'female',
      'woman',
      'zira',
      'hazel',
      'aria',
      'siti',
      'nur',
      'amelia',
      'sara',
      'farah',
    ]
    const maleHints = ['male', 'man', 'david', 'mark', 'ryan', 'guy']

    let score = 0
    if (femaleHints.some((hint) => lowerName.includes(hint))) score += 10
    if (maleHints.some((hint) => lowerName.includes(hint))) score -= 10
    if (voice.default) score += 2
    return score
  }

  private selectPreferredVoice(voices: SpeechSynthesisVoice[], lang: string) {
    if (!voices.length) return null
    const pool = this.getPreferredLanguagePool(voices, lang)
    return [...pool].sort((a, b) => this.scoreFemaleVoice(b) - this.scoreFemaleVoice(a))[0] ?? null
  }

  private async getVoicesWithTimeout(timeoutMs = 900) {
    const synth = window.speechSynthesis
    const immediate = synth.getVoices()
    if (immediate.length) return immediate

    return await new Promise<SpeechSynthesisVoice[]>((resolve) => {
      let settled = false
      const done = (voices: SpeechSynthesisVoice[]) => {
        if (settled) return
        settled = true
        synth.onvoiceschanged = null
        resolve(voices)
      }

      const timer = window.setTimeout(() => {
        window.clearTimeout(timer)
        done(synth.getVoices())
      }, timeoutMs)

      synth.onvoiceschanged = () => {
        window.clearTimeout(timer)
        done(synth.getVoices())
      }
    })
  }

  async speak(text: string, options: MariaTtsOptions = {}) {
    if (!MariaTtsEngine.isSupported()) {
      options.onError?.('Speech synthesis is not supported in this browser.')
      return
    }

    if (!text.trim()) return

    this.stop()

    this.utterance = new SpeechSynthesisUtterance(text)
    this.utterance.lang = options.lang || 'ms-MY'
    this.utterance.rate = options.rate ?? 0.98
    this.utterance.pitch = options.pitch ?? 1.18
    this.utterance.volume = options.volume ?? 1

    const voices = await this.getVoicesWithTimeout()
    this.preferredVoice = this.selectPreferredVoice(voices, this.utterance.lang)

    if (this.preferredVoice) {
      this.utterance.voice = this.preferredVoice
      this.utterance.lang = this.preferredVoice.lang || this.utterance.lang
    }

    this.lipSyncController = new MariaLipSyncController(
      options.onLipSyncFrame || (() => undefined)
    )

    this.utterance.onstart = () => {
      this.lipSyncController?.start()
      options.onStart?.()
    }

    this.utterance.onend = () => {
      this.lipSyncController?.stop()
      options.onEnd?.()
    }

    this.utterance.onpause = () => {
      options.onPause?.()
    }

    this.utterance.onresume = () => {
      options.onResume?.()
    }

    this.utterance.onerror = () => {
      this.lipSyncController?.stop()
      options.onError?.('Failed to play Maria voice response.')
    }

    this.utterance.onboundary = () => {
      this.lipSyncController?.pulse()
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(this.utterance)
  }

  pause() {
    if (!MariaTtsEngine.isSupported()) return
    window.speechSynthesis.pause()
  }

  resume() {
    if (!MariaTtsEngine.isSupported()) return
    window.speechSynthesis.resume()
  }

  stop() {
    if (!MariaTtsEngine.isSupported()) return
    this.lipSyncController?.stop()
    window.speechSynthesis.cancel()
    this.utterance = null
    this.lipSyncController = null
  }
}

