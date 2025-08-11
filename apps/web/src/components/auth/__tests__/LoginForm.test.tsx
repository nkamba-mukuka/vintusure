import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { mockUser } from '@/test/test-utils'

// Mock the auth context
const mockAuthContext = {
  signIn: vi.fn(),
  loading: false,
  user: null,
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}))

describe('LoginForm Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders login form with all required fields', () => {
      render(<LoginForm />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument()
    })

    it('renders form with proper accessibility attributes', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
    })

    it('renders loading state when auth is loading', () => {
      mockAuthContext.loading = true
      
      render(<LoginForm />)
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for invalid email format', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for short password', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })

    it('clears validation errors when user starts typing', async () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')
      
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockSignIn = vi.fn()
      mockAuthContext.signIn = mockSignIn
      mockAuthContext.loading = false
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('shows loading state during submission', async () => {
      const mockSignIn = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      mockAuthContext.signIn = mockSignIn
      mockAuthContext.loading = false
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })

    it('handles submission errors', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      mockAuthContext.signIn = mockSignIn
      mockAuthContext.loading = false
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('navigates to forgot password page', async () => {
      render(<LoginForm />)
      
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i })
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    })

    it('navigates to sign up page', async () => {
      render(<LoginForm />)
      
      const signUpLink = screen.getByRole('link', { name: /create account/i })
      expect(signUpLink).toHaveAttribute('href', '/signup')
    })
  })

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      emailInput.focus()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(passwordInput).toHaveFocus()
      
      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('announces form errors to screen readers', async () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('has proper form labels and associations', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('id')
      expect(passwordInput).toHaveAttribute('id')
      
      const emailLabel = screen.getByText(/email/i)
      const passwordLabel = screen.getByText(/password/i)
      
      expect(emailLabel).toHaveAttribute('for', emailInput.id)
      expect(passwordLabel).toHaveAttribute('for', passwordInput.id)
    })
  })

  describe('Error Handling', () => {
    it('displays network error messages', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Network error'))
      mockAuthContext.signIn = mockSignIn
      mockAuthContext.loading = false
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('displays Firebase auth error messages', async () => {
      const mockSignIn = vi.fn().mockRejectedValue({ code: 'auth/user-not-found' })
      mockAuthContext.signIn = mockSignIn
      mockAuthContext.loading = false
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Remember Me Functionality', () => {
    it('renders remember me checkbox', () => {
      render(<LoginForm />)
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument()
    })

    it('toggles remember me state', async () => {
      render(<LoginForm />)
      
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i })
      expect(rememberMeCheckbox).not.toBeChecked()
      
      await user.click(rememberMeCheckbox)
      expect(rememberMeCheckbox).toBeChecked()
      
      await user.click(rememberMeCheckbox)
      expect(rememberMeCheckbox).not.toBeChecked()
    })
  })
})
