// PUSPA V5 — Enhanced Health Check
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isConfigured as isAiConfigured } from '@/lib/openrouter'

export const dynamic = 'force-dynamic'

export async function GET() {
  const health: {
    status: string
    timestamp: string
    version: string
    environment: string
    checks: {
      database: { status: string; message?: string }
      ai: { status: string; message?: string }
      memory: { status: string; usage: NodeJS.MemoryUsage }
    }
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.2.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'unknown' },
      ai: { status: 'unknown' },
      memory: { status: 'ok', usage: process.memoryUsage() },
    }
  }
  
  // Check database
  try {
    await db.$queryRaw`SELECT 1`
    health.checks.database = { status: 'ok' }
  } catch (error) {
    health.checks.database = { status: 'error', message: String(error) }
    health.status = 'degraded'
  }
  
  // Check AI configuration
  if (isAiConfigured()) {
    health.checks.ai = { status: 'ok' }
  } else {
    health.checks.ai = { status: 'warning', message: 'No API keys configured' }
    health.status = 'degraded'
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503
  return NextResponse.json(health, { status: statusCode })
}
