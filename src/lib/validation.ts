// PUSPA V5 — Common Validation Schemas
import { z } from 'zod'

// AI API validation
export const aiRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(10000)
  })).min(1),
  userId: z.string().uuid().optional(),
  userRole: z.enum(['staff', 'admin', 'developer']).optional(),
  stream: z.boolean().optional()
})

// Donation validation
export const createDonationSchema = z.object({
  donorName: z.string().min(2).max(100),
  donorIC: z.string().regex(/^\d{6}-\d{2}-\d{4}$/),
  amount: z.number().positive(),
  type: z.enum(['zakat', 'sadaqah', 'waqf', 'infaq', 'general']),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'online']),
})

// Member validation
export const createMemberSchema = z.object({
  name: z.string().min(2).max(100),
  icNumber: z.string().regex(/^\d{6}-\d{2}-\d{4}$/, 'Invalid IC number format (e.g., 900101-14-5678)'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: z.number().min(0).optional(),
  householdSize: z.number().int().min(1).optional(),
  asnafCategory: z.enum(['fakir', 'miskin', 'amil', 'gharim', 'riqab', 'ibn sabil', 'muallaf', 'fisabilillah']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  notes: z.string().optional()
})

// Case validation
export const createCaseSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  type: z.enum(['welfare', 'medical', 'education', 'housing', 'emergency', 'financial']),
  asnafId: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
})

export function validateRequest<T>(schema: z.Schema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return {
    success: false,
    errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
  }
}
