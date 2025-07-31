import { z } from 'zod'
import type { PolicyType, PolicyStatus } from '../types/policy'

export const policyFormSchema = z.object({
    type: z.enum(['comprehensive', 'third_party'] as const),
    status: z.enum(['active', 'expired', 'cancelled', 'pending'] as const).default('pending'),
    customerId: z.string(),
    vehicle: z.object({
        registrationNumber: z.string(),
        make: z.string(),
        model: z.string(),
        year: z.number(),
        engineNumber: z.string(),
        chassisNumber: z.string(),
        value: z.number(),
        usage: z.enum(['private', 'commercial'] as const)
    }),
    startDate: z.date(),
    endDate: z.date(),
    premium: z.object({
        amount: z.number(),
        currency: z.string(),
        paymentStatus: z.enum(['paid', 'pending', 'failed'] as const),
        paymentMethod: z.string()
    }),
    policyNumber: z.string()
}).refine(
    (data) => {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end > start
    },
    {
        message: 'End date must be after start date',
        path: ['endDate'],
    }
)

export type PolicyFormData = z.infer<typeof policyFormSchema> 