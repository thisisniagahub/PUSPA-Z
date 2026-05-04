import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, currentView } = body

    // Use z-ai-web-dev-sdk for AI (dynamic import, server-side only)
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const systemPrompt = `You are PUSPA AI (Hermes), an assistant for the PUSPA NGO management platform. You help with asnaf member management, case workflows, donations, disbursements, programmes, compliance, and NGO operations. Be friendly and helpful. You may use light 🦞 personality. Respond in Bahasa Melayu when appropriate, English is also fine. Current module context: ${currentView || 'dashboard'}. Keep responses concise and practical.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' : m.role,
          content: m.content,
        })),
      ],
      thinking: { type: 'disabled' },
    })

    const content = completion.choices?.[0]?.message?.content || 'Saya tidak dapat memproses permintaan ini.'

    return NextResponse.json({
      content,
      model: 'hermes',
      success: true,
    })
  } catch (error: unknown) {
    console.error('AI chat error:', error)
    return NextResponse.json({
      content: 'Maaf, PUSPA AI sedang mengalami masalah teknikal. Sila cuba lagi nanti. 🦞',
      model: 'fallback',
      success: false,
      error: 'AI service unavailable',
    })
  }
}
