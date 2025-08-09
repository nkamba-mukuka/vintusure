import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from '../../App'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock Firebase
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn((callback) => {
    callback(mockAuth.currentUser)
    return vi.fn() // unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}

const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  profileCompleted: true,
}

vi.mock('@/lib/firebase/config', () => ({
  auth: mockAuth,
  db: {},
  functions: {},
}))

// Mock user service
vi.mock('@/lib/services/userService', () => ({
  userService: {
    getUserProfile: vi.fn(),
    createUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
  },
}))

// Mock React Router navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const createTestApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.currentUser = null
    // Reset window location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/', href: 'http://localhost:3000/' },
      writable: true,
    })
  })

  describe('Landing Page for Unauthenticated Users', () => {
    it('renders landing page when user is not authenticated', async () => {
      render(createTestApp())

      await waitFor(() => {
        expect(screen.getByText('AI-Powered Insurance Intelligence')).toBeInTheDocument()
      })

      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('navigates to login page when sign in button is clicked', async () => {
      const user = userEvent.setup()
      render(createTestApp())

      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(screen.getByText('Sign in to VintuSure')).toBeInTheDocument()
      })
    })

    it('navigates to signup page when sign up button is clicked', async () => {
      const user = userEvent.setup()
      render(createTestApp())

      await waitFor(() => {
        expect(screen.getByText('Sign Up')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Sign Up'))

      await waitFor(() => {
        expect(screen.getByText('Create your account')).toBeInTheDocument()
      })
    })
  })

  describe('Login Flow', () => {
    it('completes successful login flow', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'test-user-123', email: 'test@example.com' }
      })

      render(createTestApp())

      // Navigate to login
      await user.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(screen.getByText('Sign in to VintuSure')).toBeInTheDocument()
      })

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Verify Firebase auth was called
      expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      )
    })

    it('handles login errors gracefully', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Invalid credentials')
      )

      render(createTestApp())

      // Navigate to login and submit invalid credentials
      await user.click(screen.getByText('Sign In'))
      
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/email/i), 'invalid@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('Registration Flow', () => {
    it('completes successful registration flow', async () => {
      const user = userEvent.setup()
      
      mockAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-user-123', email: 'newuser@example.com' }
      })

      render(createTestApp())

      // Navigate to signup
      await user.click(screen.getByText('Sign Up'))

      await waitFor(() => {
        expect(screen.getByText('Create your account')).toBeInTheDocument()
      })

      // Fill in registration form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(emailInput, 'newuser@example.com')
      await user.type(passwordInput, 'securepassword123')
      await user.type(confirmPasswordInput, 'securepassword123')
      await user.click(submitButton)

      // Verify Firebase auth was called
      expect(mockAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        'newuser@example.com',
        'securepassword123'
      )
    })

    it('validates password confirmation', async () => {
      const user = userEvent.setup()
      render(createTestApp())

      await user.click(screen.getByText('Sign Up'))

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      // Enter mismatched passwords
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
      
      // Try to submit
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/passwords.*match/i)).toBeInTheDocument()
      })
    })
  })

  describe('Protected Route Access', () => {
    it('redirects unauthenticated users to login', async () => {
      // Try to access protected route
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      })

      render(createTestApp())

      await waitFor(() => {
        expect(screen.getByText('Sign in to VintuSure')).toBeInTheDocument()
      })
    })

    it('allows authenticated users to access protected routes', async () => {
      // Mock authenticated user
      mockAuth.currentUser = mockUser
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser)
        return vi.fn()
      })

      render(createTestApp())

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })
  })

  describe('Profile Onboarding Flow', () => {
    it('redirects to onboarding when profile is incomplete', async () => {
      const incompleteUser = { ...mockUser, profileCompleted: false }
      mockAuth.currentUser = incompleteUser
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(incompleteUser)
        return vi.fn()
      })

      render(createTestApp())

      await waitFor(() => {
        expect(screen.getByText(/complete.*profile/i)).toBeInTheDocument()
      })
    })

    it('completes onboarding flow', async () => {
      const user = userEvent.setup()
      const incompleteUser = { ...mockUser, profileCompleted: false }
      
      mockAuth.currentUser = incompleteUser
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(incompleteUser)
        return vi.fn()
      })

      render(createTestApp())

      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      })

      // Fill in onboarding form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/phone/i), '+260123456789')
      
      // Select role
      const roleSelect = screen.getByLabelText(/role/i)
      await user.click(roleSelect)
      await user.click(screen.getByText('Agent'))

      // Submit onboarding
      await user.click(screen.getByRole('button', { name: /complete profile/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Logout Flow', () => {
    it('completes logout flow', async () => {
      const user = userEvent.setup()
      
      // Start with authenticated user
      mockAuth.currentUser = mockUser
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser)
        return vi.fn()
      })

      render(createTestApp())

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      // Find and click logout button
      const logoutButton = screen.getByText(/sign out/i)
      await user.click(logoutButton)

      // Verify signOut was called
      expect(mockAuth.signOut).toHaveBeenCalled()
    })
  })

  describe('Password Reset Flow', () => {
    it('sends password reset email', async () => {
      const user = userEvent.setup()
      
      mockAuth.sendPasswordResetEmail.mockResolvedValue(undefined)

      render(createTestApp())

      // Navigate to login then forgot password
      await user.click(screen.getByText('Sign In'))
      
      await waitFor(() => {
        expect(screen.getByText('Forgot password?')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Forgot password?'))

      await waitFor(() => {
        expect(screen.getByText('Reset your password')).toBeInTheDocument()
      })

      // Enter email and submit
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset email/i }))

      // Verify password reset was called
      expect(mockAuth.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com')

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/reset email sent/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Boundaries in Auth Flow', () => {
    it('handles authentication errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock a critical error
      mockAuth.onAuthStateChanged.mockImplementation(() => {
        throw new Error('Auth state error')
      })

      render(createTestApp())

      // Should show error boundary
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      })

      // Should have retry button
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })
})
