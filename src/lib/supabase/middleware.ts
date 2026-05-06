import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type AppRole = 'staff' | 'admin' | 'developer'

const API_ROLE_REQUIREMENTS: Record<string, AppRole> = {
  '/api/v1/compliance': 'admin',
  '/api/v1/reports': 'admin',
  '/api/v1/ekyc': 'admin',
}

function normalizeRole(role: unknown): AppRole {
  if (role === 'admin' || role === 'developer') return role
  return 'staff'
}

function roleLevel(role: AppRole): number {
  if (role === 'developer') return 3
  if (role === 'admin') return 2
  return 1
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  const isApiV1Route = request.nextUrl.pathname.startsWith('/api/v1/')
  const isTelegramAiRoute = request.nextUrl.pathname === '/api/v1/ai/telegram'
  /** Web Maria chat: allow anonymous POST unless PUSPA_REQUIRE_AUTH_FOR_AI=true */
  const isMariaWebAiPost =
    request.nextUrl.pathname === '/api/v1/ai' && request.method === 'POST'
  const requireAuthForMariaWebAi =
    process.env.PUSPA_REQUIRE_AUTH_FOR_AI === 'true'
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isRoot = request.nextUrl.pathname === '/'

  if (
    !user &&
    isApiV1Route &&
    !isTelegramAiRoute &&
    (requireAuthForMariaWebAi || !isMariaWebAiPost)
  ) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!user && !isLoginPage && !isApiRoute && !isRoot) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from login page
  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user && isApiV1Route && !isTelegramAiRoute) {
    const userRole = normalizeRole(user.user_metadata?.role)
    const pathRequirement = Object.entries(API_ROLE_REQUIREMENTS).find(([pathPrefix]) =>
      request.nextUrl.pathname.startsWith(pathPrefix)
    )

    if (pathRequirement) {
      const requiredRole = pathRequirement[1]
      if (roleLevel(userRole) < roleLevel(requiredRole)) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }
  }

  return supabaseResponse
}
