import { createClient } from '@/lib/supabase/server'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'staff' | 'admin' | 'developer'
}

function normalizeRole(role: unknown): 'staff' | 'admin' | 'developer' {
  if (role === 'admin' || role === 'developer') return role
  return 'staff'
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Extract role from user metadata or default to staff
    const role = normalizeRole(user.user_metadata?.role)
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User'

    return {
      id: user.id,
      email: user.email || '',
      name,
      role,
    }
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Sesi tidak sah. Sila log masuk semula.')
  }
  return user
}

export async function requireRole(minRole: 'staff' | 'admin' | 'developer'): Promise<AuthUser> {
  const user = await requireAuth()
  const roleLevel = { staff: 1, admin: 2, developer: 3 }
  if (roleLevel[user.role] < roleLevel[minRole]) {
    throw new Error(`Akses ditolak. Peranan minimum: ${minRole}`)
  }
  return user
}
