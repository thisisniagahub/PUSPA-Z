import type { MariaEmotionState } from '@/stores/maria-character-store'

export interface MariaEmotionContext {
  route: string
  replyText?: string
  hasToolCalls?: boolean
  hasError?: boolean
}

export function getMariaEmotionState(context: MariaEmotionContext): MariaEmotionState {
  const route = context.route.toLowerCase()
  const text = (context.replyText || '').toLowerCase()

  if (context.hasError || text.includes('ralat') || text.includes('error')) {
    return 'alert'
  }

  if (route === 'compliance' || route === 'ekyc' || text.includes('amaran') || text.includes('risiko')) {
    return 'alert'
  }

  if (
    route === 'donations' ||
    route === 'donors' ||
    route === 'sedekah-jumaat' ||
    text.includes('terima kasih') ||
    text.includes('syukur')
  ) {
    return 'warm'
  }

  if (
    route === 'cases' ||
    route === 'reports' ||
    route === 'dashboard' ||
    context.hasToolCalls ||
    text.includes('analisis') ||
    text.includes('laporan')
  ) {
    return 'focus'
  }

  if (text.includes('bantu') || text.includes('sokong') || text.includes('empati')) {
    return 'empathetic'
  }

  return 'neutral'
}

