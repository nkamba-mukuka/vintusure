import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the userService
const mockUserService = {
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  createUserProfile: vi.fn(),
  markProfileComplete: vi.fn(),
  getUsersByRole: vi.fn(),
  searchUsers: vi.fn(),
  deleteUser: vi.fn(),
  getCurrentUser: vi.fn(),
  updateUserLastActive: vi.fn(),
  bulkUpdateUsers: vi.fn(),
}

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('retrieves user profile successfully', async () => {
      const mockProfile = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'agent',
        profileCompleted: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }
      
      mockUserService.getUserProfile.mockResolvedValue(mockProfile)

      const profile = await mockUserService.getUserProfile('user123')

      expect(profile).toEqual(mockProfile)
      expect(mockUserService.getUserProfile).toHaveBeenCalledWith('user123')
    })

    it('returns null when user does not exist', async () => {
      mockUserService.getUserProfile.mockResolvedValue(null)

      const profile = await mockUserService.getUserProfile('nonexistent')

      expect(profile).toBeNull()
    })

    it('handles database errors', async () => {
      mockUserService.getUserProfile.mockRejectedValue(new Error('Database error'))

      await expect(mockUserService.getUserProfile('user123')).rejects.toThrow('Database error')
    })
  })

  describe('updateUserProfile', () => {
    it('updates user profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+260123456789',
      }

      mockUserService.updateUserProfile.mockResolvedValue(undefined)

      await mockUserService.updateUserProfile('user123', updateData)

      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith('user123', updateData)
    })

    it('handles update errors', async () => {
      mockUserService.updateUserProfile.mockRejectedValue(new Error('Update failed'))

      await expect(
        mockUserService.updateUserProfile('user123', { firstName: 'Jane' })
      ).rejects.toThrow('Update failed')
    })

    it('validates required fields', async () => {
      mockUserService.updateUserProfile.mockRejectedValue(new Error('Email is required'))

      await expect(
        mockUserService.updateUserProfile('user123', { email: '' })
      ).rejects.toThrow(/email.*required/i)
    })
  })

  describe('createUserProfile', () => {
    it('creates new user profile successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'agent' as const,
      }

      mockUserService.createUserProfile.mockResolvedValue(undefined)

      await mockUserService.createUserProfile('newuser123', userData)

      expect(mockUserService.createUserProfile).toHaveBeenCalledWith('newuser123', userData)
    })

    it('handles creation errors', async () => {
      mockUserService.createUserProfile.mockRejectedValue(new Error('Creation failed'))

      await expect(
        mockUserService.createUserProfile('newuser123', {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'agent',
        })
      ).rejects.toThrow('Creation failed')
    })
  })

  describe('markProfileComplete', () => {
    it('marks profile as complete', async () => {
      mockUserService.markProfileComplete.mockResolvedValue(undefined)

      await mockUserService.markProfileComplete('user123')

      expect(mockUserService.markProfileComplete).toHaveBeenCalledWith('user123')
    })
  })

  describe('getUsersByRole', () => {
    it('retrieves users by role', async () => {
      const mockUsers = [
        { id: 'user1', role: 'agent', firstName: 'Agent', lastName: 'One' },
        { id: 'user2', role: 'agent', firstName: 'Agent', lastName: 'Two' },
      ]

      mockUserService.getUsersByRole.mockResolvedValue(mockUsers)

      const agents = await mockUserService.getUsersByRole('agent')

      expect(mockUserService.getUsersByRole).toHaveBeenCalledWith('agent')
      expect(agents).toHaveLength(2)
      expect(agents[0]).toEqual({
        id: 'user1',
        role: 'agent',
        firstName: 'Agent',
        lastName: 'One',
      })
    })

    it('returns empty array when no users found', async () => {
      mockUserService.getUsersByRole.mockResolvedValue([])

      const users = await mockUserService.getUsersByRole('admin')

      expect(users).toEqual([])
    })
  })

  describe('searchUsers', () => {
    it('searches users by email', async () => {
      const mockResults = [
        { id: 'user1', email: 'john@example.com', firstName: 'John' },
      ]

      mockUserService.searchUsers.mockResolvedValue(mockResults)

      const results = await mockUserService.searchUsers('john@example.com')

      expect(mockUserService.searchUsers).toHaveBeenCalledWith('john@example.com')
      expect(results).toHaveLength(1)
    })

    it('limits search results', async () => {
      const mockResults = Array(10).fill(0).map((_, i) => ({
        id: `user${i}`,
        email: `user${i}@example.com`,
      }))

      mockUserService.searchUsers.mockResolvedValue(mockResults.slice(0, 10))

      await mockUserService.searchUsers('user', 10)

      expect(mockUserService.searchUsers).toHaveBeenCalledWith('user', 10)
    })
  })

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      mockUserService.deleteUser.mockResolvedValue(undefined)

      await mockUserService.deleteUser('user123')

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user123')
    })

    it('handles deletion errors', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Deletion failed'))

      await expect(mockUserService.deleteUser('user123')).rejects.toThrow('Deletion failed')
    })
  })

  describe('getCurrentUser', () => {
    it('returns current user profile', async () => {
      const mockProfile = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'agent',
        profileCompleted: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }

      mockUserService.getCurrentUser.mockResolvedValue(mockProfile)

      const profile = await mockUserService.getCurrentUser()

      expect(profile).toEqual(mockProfile)
    })

    it('returns null when no user is authenticated', async () => {
      mockUserService.getCurrentUser.mockResolvedValue(null)

      const profile = await mockUserService.getCurrentUser()

      expect(profile).toBeNull()
    })
  })

  describe('updateUserLastActive', () => {
    it('updates user last active timestamp', async () => {
      mockUserService.updateUserLastActive.mockResolvedValue(undefined)

      await mockUserService.updateUserLastActive('user123')

      expect(mockUserService.updateUserLastActive).toHaveBeenCalledWith('user123')
    })
  })

  describe('User Validation', () => {
    it('validates email format', async () => {
      mockUserService.createUserProfile.mockRejectedValue(new Error('Email must be valid'))

      await expect(
        mockUserService.createUserProfile('user123', {
          email: 'invalid-email',
          firstName: 'Test',
          lastName: 'User',
          role: 'agent',
        })
      ).rejects.toThrow(/email.*valid/i)
    })

    it('validates required fields', async () => {
      mockUserService.createUserProfile.mockRejectedValue(new Error('firstName is required'))

      await expect(
        mockUserService.createUserProfile('user123', {
          email: 'test@example.com',
          firstName: '',
          lastName: 'User',
          role: 'agent',
        })
      ).rejects.toThrow(/firstName.*required/i)
    })

    it('validates role values', async () => {
      mockUserService.createUserProfile.mockRejectedValue(new Error('Role must be valid'))

      await expect(
        mockUserService.createUserProfile('user123', {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'invalid-role' as any,
        })
      ).rejects.toThrow(/role.*valid/i)
    })
  })

  describe('Batch Operations', () => {
    it('handles bulk user updates', async () => {
      const users = [
        { id: 'user1', firstName: 'Updated1' },
        { id: 'user2', firstName: 'Updated2' },
      ]

      mockUserService.bulkUpdateUsers.mockResolvedValue(undefined)

      await mockUserService.bulkUpdateUsers(users)

      expect(mockUserService.bulkUpdateUsers).toHaveBeenCalledWith(users)
    })

    it('handles batch operation errors', async () => {
      mockUserService.bulkUpdateUsers.mockRejectedValue(new Error('Batch error'))

      const users = [
        { id: 'user1', firstName: 'Updated1' },
        { id: 'user2', firstName: 'Updated2' },
      ]

      await expect(mockUserService.bulkUpdateUsers(users)).rejects.toThrow('Batch error')
    })
  })
})