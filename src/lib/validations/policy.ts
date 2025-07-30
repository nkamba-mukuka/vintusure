import { z } from 'zod';
import { PolicyType, PolicyStatus } from '@/types/policy';

export const vehicleSchema = z.object({
    registrationNumber: z.string().min(1, 'Registration number is required'),
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number()
        .min(1900, 'Year must be after 1900')
        .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
    engineNumber: z.string().min(1, 'Engine number is required'),
    chassisNumber: z.string().min(1, 'Chassis number is required'),
    value: z.number().min(1, 'Value must be greater than 0'),
    usage: z.enum(['private', 'commercial'] as const),
});

export const policyFormSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    type: z.enum(['comprehensive', 'third_party'] as const),
    vehicle: vehicleSchema,
    startDate: z.date({
        required_error: 'Start date is required',
        invalid_type_error: 'Start date must be a valid date',
    }),
    endDate: z.date({
        required_error: 'End date is required',
        invalid_type_error: 'End date must be a valid date',
    }),
    premium: z.object({
        amount: z.number().min(1, 'Premium amount must be greater than 0'),
        currency: z.string().min(1, 'Currency is required'),
        paymentStatus: z.enum(['paid', 'pending', 'partial'] as const),
        paymentMethod: z.string().optional(),
    }),
}).refine(
    (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
    },
    {
        message: 'End date must be after start date',
        path: ['endDate'],
    }
);

export type PolicyFormData = z.infer<typeof policyFormSchema>; 