import { z } from 'zod'
import { Timestamp } from 'firebase/firestore'

export const policyFormSchema = z.object({
    id: z.string().optional(),
    type: z.enum(['comprehensive', 'third_party']),
    customerId: z.string(),
    status: z.enum(['active', 'expired', 'cancelled', 'pending']).default('pending'),
    policyNumber: z.string().optional(),
    vehicle: z.object({
        registrationNumber: z.string(),
        make: z.string(),
        model: z.string(),
        year: z.number(),
        engineNumber: z.string(),
        chassisNumber: z.string(),
        value: z.number(),
        usage: z.enum(['private', 'commercial']),
    }),
    startDate: z.string(),
    endDate: z.string(),
    premium: z.object({
        amount: z.number(),
        currency: z.string(),
        paymentStatus: z.enum(['pending', 'paid', 'partial']),
        nextPaymentDate: z.string().optional(),
    }),
})

export type PolicyFormData = z.infer<typeof policyFormSchema>

export type PolicyData = PolicyFormData & {
    createdAt: string
    updatedAt: string
    createdBy: string
}

export type PaymentStatus = 'pending' | 'paid' | 'partial' 