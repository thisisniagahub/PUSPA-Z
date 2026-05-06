'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ClipboardList,
  User,
  Home,
  Briefcase,
  Heart,
  Users,
  FileCheck,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Save,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Form Schema (maps to AidApplication Prisma model) ─────────

const dependentSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan'),
  age: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().min(0).max(120).optional()),
  relationship: z.string().optional(),
  status: z.string().optional(),
})

const aidFormSchema = z.object({
  // Maklumat Pemohon
  applicantName: z.string().min(2, 'Nama penuh diperlukan'),
  applicantIC: z.string().min(12, 'No IC mesti 12 digit').max(14).optional().or(z.literal('')),
  fullAddress: z.string().min(5, 'Alamat diperlukan'),
  phoneNumber: z.string().min(10, 'No telefon diperlukan'),
  maritalStatus: z.string().min(1, 'Status diperlukan'),
  employment: z.string().min(1, 'Pekerjaan diperlukan'),
  monthlyRent: z.preprocess((v) => (v === '' ? 0 : Number(v)), z.number().min(0)),
  monthlyIncome: z.preprocess((v) => (v === '' ? 0 : Number(v)), z.number().min(0)),
  healthStatus: z.string().min(1, 'Taraf kesihatan diperlukan'),

  // Maklumat Pasangan
  spouseName: z.string().optional().or(z.literal('')),
  spouseRelation: z.string().optional().or(z.literal('')),
  spouseJob: z.string().optional().or(z.literal('')),
  spouseIncome: z.preprocess((v) => (v === '' ? 0 : Number(v)), z.number().min(0)),
  spouseHealth: z.string().optional().or(z.literal('')),

  // Tanggungan
  dependents: z.array(dependentSchema),

  // Agensi Lain
  otherAgencyHelp: z.boolean().default(false),
  agencyDetails: z.string().optional().or(z.literal('')),
  careAidReceived: z.boolean().default(false),

  // PDPA
  applicantConsent: z.boolean().refine((v) => v === true, 'Persetujuan PDPA diperlukan'),
})

type AidFormData = z.infer<typeof aidFormSchema>

// ─── Steps config ─────────────────────────────────────────────────

const STEPS = [
  { id: 'personal', label: 'Maklumat Pemohon', icon: User },
  { id: 'spouse', label: 'Maklumat Pasangan', icon: Heart },
  { id: 'dependents', label: 'Tanggungan', icon: Users },
  { id: 'agency', label: 'Bantuan Lain', icon: Briefcase },
  { id: 'consent', label: 'Pengesahan', icon: FileCheck },
]

// ─── Helpers ──────────────────────────────────────────────────────

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────

export default function PermohonanBantuanPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<AidFormData>({
    resolver: zodResolver(aidFormSchema) as any,
    defaultValues: {
      applicantName: '',
      applicantIC: '',
      fullAddress: '',
      phoneNumber: '',
      maritalStatus: '',
      employment: '',
      monthlyRent: 0,
      monthlyIncome: 0,
      healthStatus: '',
      spouseName: '',
      spouseRelation: '',
      spouseJob: '',
      spouseIncome: 0,
      spouseHealth: '',
      dependents: [],
      otherAgencyHelp: false,
      agencyDetails: '',
      careAidReceived: false,
      applicantConsent: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dependents',
  })

  const watchOtherAgency = watch('otherAgencyHelp')

  const onSubmit = useCallback((data: AidFormData) => {
    console.log('Form submitted:', data)
    setSubmitted(true)
  }, [])

  const nextStep = useCallback(async () => {
    const stepFields: Record<number, (keyof AidFormData)[]> = {
      0: ['applicantName', 'fullAddress', 'phoneNumber', 'maritalStatus', 'employment', 'healthStatus'],
      1: [],
      2: [],
      3: [],
      4: ['applicantConsent'],
    }
    const valid = await trigger(stepFields[currentStep])
    if (valid) setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  }, [currentStep, trigger])

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Permohonan Berjaya Dihantar</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Permohonan bantuan anda telah berjaya dihantar. Pihak PUSPA akan menghubungi anda dalam tempoh 5 hari bekerja untuk tindakan seterusnya.
          </p>
          <Button onClick={() => { setSubmitted(false); setCurrentStep(0) }} variant="outline">
            Hantar Permohonan Baru
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Borang Permohonan Bantuan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pertubuhan Urus Peduli Asnaf (PUSPA) — Borang Permohonan Digital
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const isActive = i === currentStep
          const isDone = i < currentStep
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => i < currentStep && setCurrentStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : isDone
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 cursor-pointer hover:opacity-80'
                    : 'bg-muted text-muted-foreground'
                  }`}
                disabled={i > currentStep}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-4 h-0.5 mx-1 ${isDone ? 'bg-green-400' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {(() => { const Icon = STEPS[currentStep].icon; return <Icon className="h-5 w-5 text-primary" /> })()}
              {STEPS[currentStep].label}
            </CardTitle>
            <CardDescription>
              {currentStep === 0 && 'Sila isi maklumat peribadi pemohon seperti dalam kad pengenalan.'}
              {currentStep === 1 && 'Isi maklumat pasangan jika berkenaan (tidak wajib).'}
              {currentStep === 2 && 'Senarai tanggungan dalam isi rumah pemohon.'}
              {currentStep === 3 && 'Maklumat bantuan daripada agensi atau institusi lain.'}
              {currentStep === 4 && 'Pengesahan dan persetujuan PDPA sebelum menghantar borang.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Step 0: Personal */}
            {currentStep === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nama Penuh" required error={errors.applicantName?.message}>
                    <Input {...register('applicantName')} placeholder="Seperti dalam IC" />
                  </FormField>
                  <FormField label="No Kad Pengenalan" error={errors.applicantIC?.message}>
                    <Input {...register('applicantIC')} placeholder="000000-00-0000" />
                  </FormField>
                </div>
                <FormField label="Alamat Penuh" required error={errors.fullAddress?.message}>
                  <Textarea {...register('fullAddress')} placeholder="Alamat kediaman sekarang" rows={2} />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="No Telefon" required error={errors.phoneNumber?.message}>
                    <Input {...register('phoneNumber')} placeholder="012-3456789" />
                  </FormField>
                  <FormField label="Status Perkahwinan" required error={errors.maritalStatus?.message}>
                    <Controller
                      control={control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="berkahwin">Berkahwin</SelectItem>
                            <SelectItem value="bujang">Bujang</SelectItem>
                            <SelectItem value="ibu_tunggal">Ibu Tunggal</SelectItem>
                            <SelectItem value="duda">Duda</SelectItem>
                            <SelectItem value="janda">Janda</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Pekerjaan" required error={errors.employment?.message}>
                    <Controller
                      control={control}
                      name="employment"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kerajaan">Kerajaan</SelectItem>
                            <SelectItem value="swasta">Swasta</SelectItem>
                            <SelectItem value="sendiri">Sendiri</SelectItem>
                            <SelectItem value="tidak_bekerja">Tidak Bekerja</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="Sewa Sebulan (RM)" error={errors.monthlyRent?.message}>
                    <Input type="number" {...register('monthlyRent')} placeholder="0" />
                  </FormField>
                  <FormField label="Pendapatan Sebulan (RM)" error={errors.monthlyIncome?.message}>
                    <Input type="number" {...register('monthlyIncome')} placeholder="0" />
                  </FormField>
                </div>
                <FormField label="Taraf Kesihatan" required error={errors.healthStatus?.message}>
                  <Controller
                    control={control}
                    name="healthStatus"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sihat">Sihat</SelectItem>
                          <SelectItem value="sakit_kronik">Sakit Kronik</SelectItem>
                          <SelectItem value="uzur">Uzur</SelectItem>
                          <SelectItem value="oku">OKU</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </motion.div>
            )}

            {/* Step 1: Spouse */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nama Pasangan">
                    <Input {...register('spouseName')} placeholder="Nama penuh pasangan" />
                  </FormField>
                  <FormField label="Hubungan">
                    <Input {...register('spouseRelation')} placeholder="cth: Suami / Isteri" />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Pekerjaan Pasangan">
                    <Input {...register('spouseJob')} placeholder="Pekerjaan" />
                  </FormField>
                  <FormField label="Pendapatan Pasangan (RM)">
                    <Input type="number" {...register('spouseIncome')} placeholder="0" />
                  </FormField>
                  <FormField label="Taraf Kesihatan Pasangan">
                    <Controller
                      control={control}
                      name="spouseHealth"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sihat">Sihat</SelectItem>
                            <SelectItem value="sakit_kronik">Sakit Kronik</SelectItem>
                            <SelectItem value="uzur">Uzur</SelectItem>
                            <SelectItem value="oku">OKU</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                </div>
              </motion.div>
            )}

            {/* Step 2: Dependents */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {fields.map((field, idx) => (
                  <Card key={field.id} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">Tanggungan #{idx + 1}</Badge>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)} className="h-7 w-7 text-red-500 hover:text-red-700">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <FormField label="Nama" required error={errors.dependents?.[idx]?.name?.message}>
                          <Input {...register(`dependents.${idx}.name`)} placeholder="Nama" />
                        </FormField>
                        <FormField label="Umur" error={errors.dependents?.[idx]?.age?.message}>
                          <Input type="number" {...register(`dependents.${idx}.age`)} placeholder="0" />
                        </FormField>
                        <FormField label="Hubungan">
                          <Input {...register(`dependents.${idx}.relationship`)} placeholder="cth: Anak" />
                        </FormField>
                        <FormField label="Status">
                          <Input {...register(`dependents.${idx}.status`)} placeholder="cth: Sekolah" />
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '', age: undefined, relationship: '', status: '' })}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Tanggungan
                </Button>
                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Tiada tanggungan ditambah. Klik butang di atas jika ada.
                  </p>
                )}
              </motion.div>
            )}

            {/* Step 3: Other Agency */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                  <Controller
                    control={control}
                    name="otherAgencyHelp"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="otherAgency"
                      />
                    )}
                  />
                  <Label htmlFor="otherAgency" className="text-sm cursor-pointer">
                    Adakah menerima bantuan daripada institusi/agensi lain?
                  </Label>
                </div>
                {watchOtherAgency && (
                  <FormField label="Nyatakan butiran agensi/institusi">
                    <Textarea {...register('agencyDetails')} placeholder="Nama agensi, jenis bantuan, jumlah..." rows={3} />
                  </FormField>
                )}
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                  <Controller
                    control={control}
                    name="careAidReceived"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="careAid"
                      />
                    )}
                  />
                  <Label htmlFor="careAid" className="text-sm cursor-pointer">
                    Adakah menerima bantuan kos penjagaan?
                  </Label>
                </div>
              </motion.div>
            )}

            {/* Step 4: Consent */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Perakuan & Persetujuan PDPA</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Saya dengan ini mengaku bahawa segala maklumat yang diberikan adalah benar dan tepat. Saya memahami bahawa
                      maklumat peribadi saya akan digunakan oleh Pertubuhan Urus Peduli Asnaf (PUSPA) untuk tujuan pemprosesan
                      permohonan bantuan dan disimpan selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA).
                      Saya bersetuju untuk PUSPA menghubungi saya bagi tujuan verifikasi dan tindakan susulan.
                    </p>
                  </CardContent>
                </Card>
                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  <Controller
                    control={control}
                    name="applicantConsent"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="consent"
                      />
                    )}
                  />
                  <Label htmlFor="consent" className="text-sm cursor-pointer font-medium">
                    Saya bersetuju dengan perakuan dan persetujuan PDPA di atas *
                  </Label>
                </div>
                {errors.applicantConsent && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.applicantConsent.message}
                  </p>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
          <span className="text-xs text-muted-foreground">
            Langkah {currentStep + 1} / {STEPS.length}
          </span>
          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep} className="gap-1.5">
              Seterusnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="gap-1.5 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4" />
              Hantar Permohonan
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
