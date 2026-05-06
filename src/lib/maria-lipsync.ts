export type LipSyncFrameCallback = (energy: number) => void

export class MariaLipSyncController {
  private rafId: number | null = null
  private running = false
  private startedAt = 0
  private frameCallback: LipSyncFrameCallback

  constructor(frameCallback: LipSyncFrameCallback) {
    this.frameCallback = frameCallback
  }

  start() {
    if (this.running) return
    this.running = true
    this.startedAt = performance.now()
    this.tick()
  }

  stop() {
    this.running = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.frameCallback(0)
  }

  pulse() {
    if (!this.running) return
    this.frameCallback(0.7)
  }

  private tick = () => {
    if (!this.running) return

    const elapsed = performance.now() - this.startedAt
    const base = (Math.sin(elapsed / 70) + 1) / 2
    const energy = 0.2 + base * 0.5
    this.frameCallback(energy)
    this.rafId = requestAnimationFrame(this.tick)
  }
}

