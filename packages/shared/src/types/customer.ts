export interface Customer {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    nrcPassport: string
    address: {
        street: string
        city: string
        province: string
        postalCode: string
    }
    status: 'active' | 'inactive'
    createdAt: string
    updatedAt: string
}

export interface CustomerFilters {
    searchTerm?: string
    status?: Customer['status']
    sortBy?: keyof Customer
    sortOrder?: 'asc' | 'desc'
} 