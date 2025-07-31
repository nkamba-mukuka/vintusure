export type PolicyType = 'comprehensive' | 'third_party'
export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending'

export interface Vehicle {
    registrationNumber: string
    make: string
    model: string
    year: number
    engineNumber: string
    chassisNumber: string
    value: number
    usage: 'private' | 'commercial'
}

export interface Premium {
    amount: number
    currency: string
    paymentStatus: 'paid' | 'pending' | 'failed'
    paymentMethod: string
}

export interface Policy {
    id: string
    type: PolicyType
    status: PolicyStatus
    customerId: string
    policyNumber: string
    vehicle: Vehicle
    startDate: string
    endDate: string
    premium: Premium
    documents: string[]
    createdAt: string
    updatedAt: string
}

export interface PolicyFilters {
    searchTerm?: string
    type?: PolicyType
    status?: PolicyStatus
    startDate?: string
    endDate?: string
    sortBy?: keyof Policy
    sortOrder?: 'asc' | 'desc'
} 