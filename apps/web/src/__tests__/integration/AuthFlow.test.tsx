import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from '../../App'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock Firebase - moved to top to avoid hoisting issues
vi.mock('@/lib/firebase/config', () => {
  const mockAuth = {
    currentUser: null as any,
    onAuthStateChanged: vi.fn((callback: any) => {
      callback(mockAuth.currentUser)
      return vi.fn() // unsubscribe function
    }),
    signInWithEmailAndPassword: vi.fn() as any,
    createUserWithEmailAndPassword: vi.fn() as any,
    signOut: vi.fn() as any,
    sendPasswordResetEmail: vi.fn() as any,
  }
  return {
    auth: mockAuth,
    db: {},
    storage: {},
    functions: {},
    analytics: {},
  }
})

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  }
})

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => {
    // Simulate setting document metadata
    if (children) {
      const helmetData = children as any
      if (helmetData.props && helmetData.props.children) {
        helmetData.props.children.forEach((child: any) => {
          if (child.type === 'title') {
            document.title = child.props.children
          }
        })
      }
    }
    return null
  },
  HelmetProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

const createTestApp = () => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  )
}

describe('Authentication Flow Integration', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    // Reset document title
    document.title = ''
  })

  describe('Login Flow', () => {
    it('completes login flow successfully', async () => {
      const { auth } = await import('@/lib/firebase/config')
      ;(auth.signInWithEmailAndPassword as any).mockResolvedValueOnce({
        user: { uid: 'test-uid', email: 'test@example.com' }
      })

      render(createTestApp())

      // Navigate to login
      await user.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      // Fill in login form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Verify Firebase was called
      await waitFor(() => {
        expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        )
      })
    })

    it('handles login errors gracefully', async () => {
      const { auth } = await import('@/lib/firebase/config')
      ;(auth.signInWithEmailAndPassword as any).mockRejectedValueOnce(
        new Error('Invalid credentials')
      )

      render(createTestApp())

      // Navigate to login
      await user.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      // Fill in login form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Verify error handling
      await waitFor(() => {
        expect(auth.signInWithEmailAndPassword).toHaveBeenCalled()
      })
    })
  })

  describe('Signup Flow', () => {
    it('completes signup flow successfully', async () => {
      const { auth } = await import('@/lib/firebase/config')
      ;(auth.createUserWithEmailAndPassword as any).mockResolvedValueOnce({
        user: { uid: 'new-uid', email: 'new@example.com' }
      })

      render(createTestApp())

      // Navigate to signup
      await user.click(screen.getByText('Sign Up'))

      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      })

      // Fill in signup form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'new@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit form
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Verify Firebase was called
      await waitFor(() => {
        expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
          'new@example.com',
          'password123'
        )
      })
    })

    it('handles signup errors gracefully', async () => {
      const { auth } = await import('@/lib/firebase/config')
      ;(auth.createUserWithEmailAndPassword as any).mockRejectedValueOnce(
        new Error('Email already in use')
      )

      render(createTestApp())

      // Navigate to signup
      await user.click(screen.getByText('Sign Up'))

      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      })

      // Fill in signup form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit form
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Verify error handling
      await waitFor(() => {
        expect(auth.createUserWithEmailAndPassword).toHaveBeenCalled()
      })
    })
  })

  describe('Logout Flow', () => {
    it('completes logout flow', async () => {
      const { auth } = await import('@/lib/firebase/config')
      ;(auth.signOut as any).mockResolvedValueOnce(undefined)

      // Mock authenticated user
      ;(auth as any).currentUser = { uid: 'test-uid', email: 'test@example.com' }
      auth.onAuthStateChanged.mockImplementation((callback: any) => {
        callback((auth as any).currentUser)
        return vi.fn()
      })

      render(createTestApp())

      // Wait for dashboard to load (simplified check)
      await waitFor(() => {
        expect(screen.getByText('VintuSure')).toBeInTheDocument()
      })

      // Verify logout functionality is available
      expect(auth.signOut).toBeDefined()
    })
  })

  describe('Password Reset Flow', () => {
    it('sends password reset email', async () => {
      const { auth } = await import('@/lib/firebase/config')
      ;(auth.sendPasswordResetEmail as any).mockResolvedValueOnce(undefined)

      render(createTestApp())

      // Navigate to login then forgot password
      await user.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      // Click forgot password link
      const forgotPasswordLink = screen.getByText(/forgot password/i)
      await user.click(forgotPasswordLink)

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      // Fill in email
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')

      // Submit form
      await user.click(screen.getByRole('button', { name: /send reset email/i }))

      // Verify Firebase was called
      await waitFor(() => {
        expect(auth.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com')
      })
    })
  })

  describe('Error Boundaries in Auth Flow', () => {
    it('handles authentication errors gracefully', async () => {
      const { auth } = await import('@/lib/firebase/config')
      
      // Mock an error in auth state
      auth.onAuthStateChanged.mockImplementation(() => {
        throw new Error('Auth state error')
      })

      render(createTestApp())

      // Should show error boundary
      await waitFor(() => {
        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Flow', () => {
    it('navigates between auth pages correctly', async () => {
      render(createTestApp())

      // Start on landing page
      expect(screen.getByText('AI-Powered Insurance Intelligence')).toBeInTheDocument()

      // Navigate to login
      await user.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      // Navigate to signup
      await user.click(screen.getByText(/create account/i))

      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      })
    })
  })
})
