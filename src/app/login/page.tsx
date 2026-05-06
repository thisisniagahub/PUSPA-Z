'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, LogIn, UserPlus, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password, name)
        if (signUpError) {
          const translated = translateError(signUpError)
          setError(translated)
        } else {
          setSuccess('Pendaftaran berjaya! Sila semak e-mel anda untuk pengesahan.')
        }
      } else {
        const { error: signInError } = await signIn(email, password)
        if (signInError) {
          const translated = translateError(signInError)
          setError(translated)
        } else {
          router.push('/')
          router.refresh()
        }
      }
    } catch {
      setError('Ralat tidak dijangka. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-100/20 dark:bg-purple-900/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand header — Exact Mirror of Identity Image Layout */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-6">
            {/* Logo Icon on White */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-2xl shadow-white/10 ring-4 ring-white/5 transition-all hover:scale-105">
              <img
                src="/puspa-logo-transparent.png"
                alt="PUSPA Icon"
                className="h-14 w-14 object-contain"
              />
            </div>
            
            {/* PUSPA Text Layout */}
            <div className="flex flex-col items-start text-left">
              <h1 className="text-6xl font-black tracking-tighter text-white leading-none">
                PUSPA
              </h1>
              {/* TAGLINE: FORCED WHITE AS REQUESTED */}
              <p className="text-xs font-bold text-white uppercase tracking-[0.2em] mt-1">
                Pertubuhan Urus Peduli Asnaf
              </p>
            </div>
          </div>
          
          <p className="text-xs text-white/40 italic font-medium">
            "Cerdas. Mesra. Sentiasa di sisi anda."
          </p>
        </div>

        {/* Login card */}
        <Card className="border-purple-100 dark:border-purple-900/40 shadow-xl shadow-purple-100/30 dark:shadow-purple-900/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">
              {isSignUp ? 'Daftar Akaun Baru' : 'Log Masuk'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp
                ? 'Cipta akaun untuk mengakses platform PUSPA'
                : 'Masukkan maklumat anda untuk meneruskan'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (sign up only) */}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Penuh</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ahmad bin Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    disabled={loading}
                    className="h-11"
                  />
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mel</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@puspa.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Kata Laluan</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 pr-10"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900/50 p-3">
                  <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : isSignUp ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Daftar Sekarang
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log Masuk Sistem
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Sudah mempunyai akaun?' : 'Belum mempunyai akaun?'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccess(null)
                }}
                className="mt-1 text-sm font-bold text-purple-700 hover:underline dark:text-purple-400 transition-colors"
                disabled={loading}
              >
                {isSignUp ? 'Log masuk di sini' : 'Cipta akaun baru'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            PPM-024-10-05012022 &bull; NGO Management Platform
          </p>
        </div>
      </div>
    </div>
  )
}

function translateError(error: string): string {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'E-mel atau kata laluan tidak sah.',
    'Email not confirmed': 'E-mel belum disahkan.',
    'User already registered': 'E-mel ini sudah didaftarkan.',
    'Password should be at least 6 characters': 'Kata laluan terlalu pendek.',
  }
  return translations[error] || error
}
