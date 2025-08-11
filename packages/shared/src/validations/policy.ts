import { z } from 'zod';

export const policySchema = z.object({
    type: z.enum(['comprehensive', 'third_party']),
    status: z.enum(['active', 'expired', 'cancelled', 'pending']),
    customerId: z.string(),
    policyNumber: z.string(),
    vehicle: z.object({
        registrationNumber: z.string(),
        make: z.string(),
        model: z.string(),
        year: z.number(),
        engineNumber: z.string(),
        chassisNumber: z.string(),
        value: z.number(),
        usage: z.enum(['private', 'commercial'])
    }),
    startDate: z.date(),
    endDate: z.date(),
    premium: z.object({
        amount: z.number(),
        currency: z.string(),
        paymentStatus: z.enum(['pending', 'paid', 'partial']),
        paymentMethod: z.string()
    }),
    createdAt: z.date(),
    updatedAt: z.date(),
    createdBy: z.string()
});

export type PolicyFormData = z.infer<typeof policySchema> 