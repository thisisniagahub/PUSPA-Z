'use client'

import { useAppStore, type ViewId } from '@/lib/store'
import { canAccessView } from '@/lib/access-control'
import dynamic from 'next/dynamic'
import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamic imports for all modules - lazy loaded
const moduleMap: Record<ViewId, React.ComponentType> = {
  dashboard: dynamic(() => import('@/modules/dashboard/page'), { ssr: false }),
  members: dynamic(() => import('@/modules/members/page'), { ssr: false }),
  cases: dynamic(() => import('@/modules/cases/page'), { ssr: false }),
  programmes: dynamic(() => import('@/modules/programmes/page'), { ssr: false }),
  donations: dynamic(() => import('@/modules/donations/page'), { ssr: false }),
  donors: dynamic(() => import('@/modules/donors/page'), { ssr: false }),
  disbursements: dynamic(() => import('@/modules/disbursements/page'), { ssr: false }),
  volunteers: dynamic(() => import('@/modules/volunteers/page'), { ssr: false }),
  compliance: dynamic(() => import('@/modules/compliance/page'), { ssr: false }),
  reports: dynamic(() => import('@/modules/reports/page'), { ssr: false }),
  ekyc: dynamic(() => import('@/modules/ekyc/page'), { ssr: false }),
  documents: dynamic(() => import('@/modules/documents/page'), { ssr: false }),
  activities: dynamic(() => import('@/modules/activities/page'), { ssr: false }),
  asnafpreneur: dynamic(() => import('@/modules/asnafpreneur/page'), { ssr: false }),
  'sedekah-jumaat': dynamic(() => import('@/modules/sedekah-jumaat/page'), { ssr: false }),
  docs: dynamic(() => import('@/modules/docs/page'), { ssr: false }),
  ai: dynamic(() => import('@/modules/ai/page'), { ssr: false }),
  settings: dynamic(() => import('@/modules/settings/page'), { ssr: false }),
  tapsecure: dynamic(() => import('@/modules/tapsecure/page'), { ssr: false }),
  admin: dynamic(() => import('@/modules/admin/page'), { ssr: false }),
  'carta-organisasi': dynamic(() => import('@/modules/carta-organisasi/page'), { ssr: false }),
  institusi: dynamic(() => import('@/modules/institusi/page'), { ssr: false }),
  'permohonan-bantuan': dynamic(() => import('@/modules/permohonan-bantuan/page'), { ssr: false }),
}

function AccessDenied({ view }: { view: ViewId }) {
  const { setView } = useAppStore()
  return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Akses Ditolak</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You do not have permission to access this module. Contact your administrator.
            </p>
          </div>
          <Button variant="outline" onClick={() => setView('dashboard')}>
            Kembali ke Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function ViewRenderer() {
  const { currentView, currentUser } = useAppStore()
  const userRole = currentUser?.role || 'staff'

  const ModuleComponent = moduleMap[currentView]
  const hasAccess = canAccessView(currentView, userRole)

  return (
    <AnimatePresence mode="wait">
      {!hasAccess ? (
        <motion.div
          key="access-denied"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <AccessDenied view={currentView} />
        </motion.div>
      ) : !ModuleComponent ? (
        <motion.div
          key="not-found"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center h-full min-h-[50vh]"
        >
          <p className="text-muted-foreground">Module not found: {currentView}</p>
        </motion.div>
      ) : (
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          <ModuleComponent />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
