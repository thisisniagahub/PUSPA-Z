// PUSPA V5 — Audit Logging System
import { db } from '@/lib/db'

export type AuditAction = 
  | 'tool_execution'
  | 'user_login'
  | 'user_logout'
  | 'data_create'
  | 'data_update'
  | 'data_delete'
  | 'config_change'
  | 'ai_request'
  | 'ai_response'

export interface AuditEntry {
  userId: string
  action: AuditAction
  resource?: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

// In-memory audit log (for Vercel serverless compatibility)
const AUDIT_LOG: (AuditEntry & { timestamp: Date })[] = []
const MAX_LOG_SIZE = 10000

export async function auditLog(entry: AuditEntry): Promise<void> {
  const logEntry = {
    ...entry,
    timestamp: new Date()
  }
  
  // Always log to console
  console.log(`[AUDIT] ${entry.action} by ${entry.userId}`, entry.details)
  
  // Store in memory (for serverless)
  AUDIT_LOG.push(logEntry)
  
  // Trim if too large
  if (AUDIT_LOG.length > MAX_LOG_SIZE) {
    AUDIT_LOG.splice(0, AUDIT_LOG.length - MAX_LOG_SIZE)
  }
}

export function getAuditLogs(
  filters?: { userId?: string; action?: AuditAction; startDate?: Date; endDate?: Date }
): (AuditEntry & { timestamp: Date })[] {
  let logs = [...AUDIT_LOG]
  
  if (filters?.userId) {
    logs = logs.filter(l => l.userId === filters.userId)
  }
  if (filters?.action) {
    logs = logs.filter(l => l.action === filters.action)
  }
  if (filters?.startDate) {
    logs = logs.filter(l => l.timestamp >= filters.startDate!)
  }
  if (filters?.endDate) {
    logs = logs.filter(l => l.timestamp <= filters.endDate!)
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}
