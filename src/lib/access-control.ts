import type { ViewId } from './store'

type Role = 'staff' | 'admin' | 'developer'

const roleHierarchy: Record<Role, number> = {
  staff: 1,
  admin: 2,
  developer: 3,
}

const viewAccess: Record<ViewId, Role> = {
  dashboard: 'staff',
  members: 'staff',
  cases: 'staff',
  programmes: 'staff',
  donations: 'staff',
  donors: 'staff',
  disbursements: 'staff',
  volunteers: 'staff',
  activities: 'staff',
  documents: 'staff',
  asnafpreneur: 'staff',
  'sedekah-jumaat': 'staff',
  docs: 'staff',
  compliance: 'admin',
  reports: 'admin',
  ekyc: 'admin',
  tapsecure: 'admin',
  admin: 'admin',
  ai: 'developer',
  settings: 'staff',
}

export function canAccessView(view: ViewId, userRole: Role): boolean {
  const requiredRole = viewAccess[view] || 'staff'
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function getRequiredRole(view: ViewId): Role {
  return viewAccess[view] || 'staff'
}

export function getViewAccessMap(): Record<ViewId, Role> {
  return { ...viewAccess }
}
