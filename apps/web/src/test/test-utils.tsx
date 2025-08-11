import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/toaster'

// Mock data for tests
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  role: 'agent' as const,
  profileCompleted: true,
  firstName: 'Test',
  lastName: 'User',
  phone: '+260123456789',
  department: 'Sales',
  employeeId: 'EMP001',
  insuranceCompany: 'Test Insurance',
  bio: 'Test bio',
  address: {
    street: '123 Test St',
    city: 'Lusaka',
    province: 'Lusaka',
    postalCode: '10101'
  },
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockCustomer = {
  id: 'customer-1',
  nrcPassport: '123456789',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+260123456789',
  address: {
    street: '456 Customer St',
    city: 'Lusaka',
    province: 'Lusaka',
    postalCode: '10101'
  },
  dateOfBirth: '1990-01-01',
  gender: 'male' as const,
  occupation: 'Engineer',
  createdBy: 'test-user-id',
  agent_id: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockPolicy = {
  id: 'policy-1',
  type: 'comprehensive' as const,
  status: 'active' as const,
  customerId: 'customer-1',
  policyNumber: 'POL001',
  vehicle: {
    registrationNumber: 'ABC123',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    engineNumber: 'ENG123',
    chassisNumber: 'CHS123',
    value: 50000,
    usage: 'personal'
  },
  startDate: '2024-01-01',
  endDate: '2025-01-01',
  premium: {
    amount: 5000,
    currency: 'ZMW',
    paymentStatus: 'paid' as const,
    paymentMethod: 'bank_transfer' as const
  },
  createdBy: 'test-user-id',
  agent_id: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockClaim = {
  id: 'claim-1',
  policyId: 'policy-1',
  customerId: 'customer-1',
  incidentDate: '2024-06-01',
  description: 'Vehicle accident',
  location: {
    latitude: -15.3875,
    longitude: 28.3228,
    address: 'Lusaka, Zambia'
  },
  damageType: 'Vehicle' as const,
  amount: 10000,
  status: 'pending' as const,
  createdBy: 'test-user-id',
  agent_id: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date()
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialAuthState?: {
    user: typeof mockUser | null
    loading?: boolean
  }
  initialTheme?: 'light' | 'dark'
  withRouter?: boolean
  withAuth?: boolean
  withTheme?: boolean
}

function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialAuthState = { user: null, loading: false },
    initialTheme = 'light',
    withRouter = true,
    withAuth = true,
    withTheme = true,
    ...renderOptions
  } = options

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    let element = children

    if (withTheme) {
      element = (
        <ThemeProvider initialTheme={initialTheme}>
          {element}
        </ThemeProvider>
      )
    }

    if (withAuth) {
      element = (
        <AuthProvider initialUser={initialAuthState.user} initialLoading={initialAuthState.loading}>
          {element}
        </AuthProvider>
      )
    }

    if (withRouter) {
      element = (
        <BrowserRouter>
          {element}
        </BrowserRouter>
      )
    }

    element = (
      <HelmetProvider>
        {element}
        <Toaster />
      </HelmetProvider>
    )

    return element
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Custom matchers for better assertions
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument()
  expect(element).toHaveTextContent(text)
}

export const expectElementToHaveClass = (element: HTMLElement, className: string) => {
  expect(element).toBeInTheDocument()
  expect(element).toHaveClass(className)
}

export const expectElementToBeDisabled = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeDisabled()
}

export const expectElementToBeEnabled = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).not.toBeDisabled()
}

// Helper functions for common test scenarios
export const waitForLoadingToFinish = async () => {
  // Wait for any loading states to disappear
  await new Promise(resolve => setTimeout(resolve, 100))
}

export const waitForAsyncOperation = async () => {
  // Wait for async operations to complete
  await new Promise(resolve => setTimeout(resolve, 500))
}

// Mock functions for common operations
export const mockNavigate = jest.fn()
export const mockLocation = { pathname: '/', search: '', hash: '', state: null }

// Test data factories
export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides
})

export const createMockCustomer = (overrides = {}) => ({
  ...mockCustomer,
  ...overrides
})

export const createMockPolicy = (overrides = {}) => ({
  ...mockPolicy,
  ...overrides
})

export const createMockClaim = (overrides = {}) => ({
  ...mockClaim,
  ...overrides
})
