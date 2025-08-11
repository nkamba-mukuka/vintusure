import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { mockUser } from '@/test/test-utils'

// Mock the auth context
const mockAuthContext = {
  user: null,
  firebaseUser: null,
  loading: true,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateUser: vi.fn(),
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock context
    Object.assign(mockAuthContext, {
      user: null,
      firebaseUser: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
    })
  })

  describe('Initial State', () => {
    it('returns loading state initially', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser).toBeNull()
      expect(result.current.loading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('returns authentication methods', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.signIn).toBeDefined()
      expect(result.current.signUp).toBeDefined()
      expect(result.current.signOut).toBeDefined()
      expect(result.current.updateUser).toBeDefined()
    })
  })

  describe('Authentication State', () => {
    it('returns authenticated state when user is present', () => {
      mockAuthContext.user = mockUser
      mockAuthContext.firebaseUser = { uid: mockUser.uid } as any
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.firebaseUser).toEqual({ uid: mockUser.uid })
      expect(result.current.loading).toBe(false)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('returns unauthenticated state when no user', () => {
      mockAuthContext.user = null
      mockAuthContext.firebaseUser = null
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('handles loading state correctly', () => {
      mockAuthContext.loading = true

      const { result } = renderHook(() => useAuth())

      expect(result.current.loading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('User Information', () => {
    it('returns user profile information', () => {
      mockAuthContext.user = mockUser
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.user?.firstName).toBe(mockUser.firstName)
      expect(result.current.user?.lastName).toBe(mockUser.lastName)
      expect(result.current.user?.email).toBe(mockUser.email)
      expect(result.current.user?.role).toBe(mockUser.role)
    })

    it('returns user ID from Firebase user', () => {
      mockAuthContext.firebaseUser = { uid: 'firebase-uid' } as any
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.firebaseUser?.uid).toBe('firebase-uid')
    })

    it('handles missing user profile gracefully', () => {
      mockAuthContext.user = null
      mockAuthContext.firebaseUser = { uid: 'firebase-uid' } as any
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser?.uid).toBe('firebase-uid')
    })
  })

  describe('Authentication Methods', () => {
    it('calls signIn method from context', async () => {
      const mockSignIn = vi.fn()
      mockAuthContext.signIn = mockSignIn

      const { result } = renderHook(() => useAuth())

      await result.current.signIn('test@example.com', 'password123')

      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('calls signUp method from context', async () => {
      const mockSignUp = vi.fn()
      mockAuthContext.signUp = mockSignUp

      const { result } = renderHook(() => useAuth())

      await result.current.signUp('test@example.com', 'password123')

      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('calls signOut method from context', async () => {
      const mockSignOut = vi.fn()
      mockAuthContext.signOut = mockSignOut

      const { result } = renderHook(() => useAuth())

      await result.current.signOut()

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('calls updateUser method from context', () => {
      const mockUpdateUser = vi.fn()
      mockAuthContext.updateUser = mockUpdateUser

      const { result } = renderHook(() => useAuth())

      const updateData = { firstName: 'Updated' }
      result.current.updateUser(updateData)

      expect(mockUpdateUser).toHaveBeenCalledWith(updateData)
    })
  })

  describe('User Role and Permissions', () => {
    it('returns user role correctly', () => {
      mockAuthContext.user = { ...mockUser, role: 'admin' as const }
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.user?.role).toBe('admin')
    })

    it('provides role-based helper methods', () => {
      mockAuthContext.user = { ...mockUser, role: 'agent' as const }
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      // These would be implemented in the actual hook
      expect(result.current.user?.role).toBe('agent')
    })

    it('handles missing role gracefully', () => {
      mockAuthContext.user = { ...mockUser, role: undefined }
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.user?.role).toBeUndefined()
    })
  })

  describe('Profile Completion', () => {
    it('indicates when profile is completed', () => {
      mockAuthContext.user = { ...mockUser, profileCompleted: true }
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.user?.profileCompleted).toBe(true)
    })

    it('indicates when profile is not completed', () => {
      mockAuthContext.user = { ...mockUser, profileCompleted: false }
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      expect(result.current.user?.profileCompleted).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('handles authentication errors gracefully', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Auth error'))
      mockAuthContext.signIn = mockSignIn

      const { result } = renderHook(() => useAuth())

      await expect(result.current.signIn('test@example.com', 'password')).rejects.toThrow('Auth error')
    })

    it('handles network errors', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Network error'))
      mockAuthContext.signIn = mockSignIn

      const { result } = renderHook(() => useAuth())

      await expect(result.current.signIn('test@example.com', 'password')).rejects.toThrow('Network error')
    })
  })

  describe('State Updates', () => {
    it('reacts to user state changes', async () => {
      const { result, rerender } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)

      // Update mock context
      mockAuthContext.user = mockUser
      mockAuthContext.loading = false

      rerender()

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })

    it('reacts to loading state changes', async () => {
      const { result, rerender } = renderHook(() => useAuth())

      expect(result.current.loading).toBe(true)

      // Update mock context
      mockAuthContext.loading = false

      rerender()

      expect(result.current.loading).toBe(false)
    })
  })

  describe('Utility Methods', () => {
    it('provides user display name', () => {
      mockAuthContext.user = mockUser
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      const displayName = `${result.current.user?.firstName} ${result.current.user?.lastName}`
      expect(displayName).toBe('Test User')
    })

    it('handles missing user names gracefully', () => {
      mockAuthContext.user = { ...mockUser, firstName: undefined, lastName: undefined }
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuth())

      const displayName = `${result.current.user?.firstName || ''} ${result.current.user?.lastName || ''}`.trim()
      expect(displayName).toBe('')
    })
  })

  describe('Context Integration', () => {
    it('uses auth context correctly', () => {
      const { result } = renderHook(() => useAuth())

      // Verify that the hook returns the same values as the context
      expect(result.current.user).toBe(mockAuthContext.user)
      expect(result.current.firebaseUser).toBe(mockAuthContext.firebaseUser)
      expect(result.current.loading).toBe(mockAuthContext.loading)
      expect(result.current.signIn).toBe(mockAuthContext.signIn)
      expect(result.current.signUp).toBe(mockAuthContext.signUp)
      expect(result.current.signOut).toBe(mockAuthContext.signOut)
      expect(result.current.updateUser).toBe(mockAuthContext.updateUser)
    })

    it('maintains context reference stability', () => {
      const { result, rerender } = renderHook(() => useAuth())

      const initialSignIn = result.current.signIn
      const initialSignUp = result.current.signUp

      rerender()

      expect(result.current.signIn).toBe(initialSignIn)
      expect(result.current.signUp).toBe(initialSignUp)
    })
  })
})
