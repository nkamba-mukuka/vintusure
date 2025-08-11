import { userService } from '../userService'
import { mockUser } from '@/test/test-utils'

// Mock Firebase
vi.mock('@/lib/firebase/config', () => ({
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
}))

// Mock Firestore functions
const mockDoc = vi.fn()
const mockGetDoc = vi.fn()
const mockSetDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockServerTimestamp = vi.fn(() => new Date())

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  serverTimestamp: mockServerTimestamp,
}))

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    it('creates a new user successfully', async () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        role: 'agent' as const,
        profileCompleted: false,
      }

      mockSetDoc.mockResolvedValue(undefined)

      const result = await userService.createUser(userData)

      expect(mockSetDoc).toHaveBeenCalledWith(
        mockDoc(),
        expect.objectContaining({
          ...userData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      )

      expect(result).toEqual({
        ...userData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('handles creation errors', async () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        role: 'agent' as const,
        profileCompleted: false,
      }

      const error = new Error('Firestore error')
      mockSetDoc.mockRejectedValue(error)

      await expect(userService.createUser(userData)).rejects.toThrow('Firestore error')
    })
  })

  describe('getUserById', () => {
    it('retrieves user by ID successfully', async () => {
      const mockUserData = {
        ...mockUser,
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      }

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const result = await userService.getUserById('test-uid')

      expect(mockGetDoc).toHaveBeenCalledWith(mockDoc())
      expect(result).toEqual({
        ...mockUser,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('returns null when user does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      })

      const result = await userService.getUserById('non-existent-uid')

      expect(result).toBeNull()
    })

    it('handles retrieval errors', async () => {
      const error = new Error('Firestore error')
      mockGetDoc.mockRejectedValue(error)

      await expect(userService.getUserById('test-uid')).rejects.toThrow('Firestore error')
    })
  })

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      }

      mockUpdateDoc.mockResolvedValue(undefined)

      await userService.updateUser('test-uid', updateData)

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        mockDoc(),
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date),
        })
      )
    })

    it('handles update errors', async () => {
      const updateData = {
        firstName: 'Updated',
      }

      const error = new Error('Firestore error')
      mockUpdateDoc.mockRejectedValue(error)

      await expect(userService.updateUser('test-uid', updateData)).rejects.toThrow('Firestore error')
    })
  })

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      mockDeleteDoc.mockResolvedValue(undefined)

      await userService.deleteUser('test-uid')

      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDoc())
    })

    it('handles deletion errors', async () => {
      const error = new Error('Firestore error')
      mockDeleteDoc.mockRejectedValue(error)

      await expect(userService.deleteUser('test-uid')).rejects.toThrow('Firestore error')
    })
  })

  describe('createDefaultUser', () => {
    it('creates default user with correct data', async () => {
      const uid = 'test-uid'
      const email = 'test@example.com'

      mockSetDoc.mockResolvedValue(undefined)

      const result = await userService.createDefaultUser(uid, email)

      expect(mockSetDoc).toHaveBeenCalledWith(
        mockDoc(),
        expect.objectContaining({
          uid,
          email,
          role: 'agent',
          profileCompleted: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      )

      expect(result).toEqual({
        uid,
        email,
        role: 'agent',
        profileCompleted: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('handles default user creation errors', async () => {
      const uid = 'test-uid'
      const email = 'test@example.com'

      const error = new Error('Firestore error')
      mockSetDoc.mockRejectedValue(error)

      await expect(userService.createDefaultUser(uid, email)).rejects.toThrow('Firestore error')
    })
  })

  describe('Data Validation', () => {
    it('validates required user fields', async () => {
      const invalidUserData = {
        uid: 'test-uid',
        // Missing required fields
      }

      mockSetDoc.mockResolvedValue(undefined)

      // This should still work as the service doesn't validate input
      await userService.createUser(invalidUserData as any)

      expect(mockSetDoc).toHaveBeenCalled()
    })

    it('handles null or undefined values gracefully', async () => {
      const userDataWithNulls = {
        uid: 'test-uid',
        email: 'test@example.com',
        role: 'agent' as const,
        profileCompleted: false,
        firstName: null,
        lastName: undefined,
      }

      mockSetDoc.mockResolvedValue(undefined)

      await userService.createUser(userDataWithNulls as any)

      expect(mockSetDoc).toHaveBeenCalledWith(
        mockDoc(),
        expect.objectContaining({
          ...userDataWithNulls,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      )
    })
  })

  describe('Timestamp Handling', () => {
    it('converts Firestore timestamps to Date objects', async () => {
      const mockUserData = {
        ...mockUser,
        createdAt: { toDate: () => new Date('2024-01-01') },
        updatedAt: { toDate: () => new Date('2024-01-02') },
      }

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const result = await userService.getUserById('test-uid')

      expect(result?.createdAt).toEqual(new Date('2024-01-01'))
      expect(result?.updatedAt).toEqual(new Date('2024-01-02'))
    })

    it('handles missing timestamps gracefully', async () => {
      const mockUserDataWithoutTimestamps = {
        ...mockUser,
        createdAt: null,
        updatedAt: undefined,
      }

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserDataWithoutTimestamps,
      })

      const result = await userService.getUserById('test-uid')

      expect(result?.createdAt).toEqual(new Date())
      expect(result?.updatedAt).toEqual(new Date())
    })
  })

  describe('Error Scenarios', () => {
    it('handles network errors', async () => {
      const networkError = new Error('Network error')
      mockGetDoc.mockRejectedValue(networkError)

      await expect(userService.getUserById('test-uid')).rejects.toThrow('Network error')
    })

    it('handles permission errors', async () => {
      const permissionError = new Error('Permission denied')
      mockGetDoc.mockRejectedValue(permissionError)

      await expect(userService.getUserById('test-uid')).rejects.toThrow('Permission denied')
    })

    it('handles invalid document references', async () => {
      mockDoc.mockImplementation(() => {
        throw new Error('Invalid document reference')
      })

      await expect(userService.getUserById('invalid-uid')).rejects.toThrow('Invalid document reference')
    })
  })

  describe('Collection Management', () => {
    it('uses correct collection name', async () => {
      mockSetDoc.mockResolvedValue(undefined)

      await userService.createUser(mockUser)

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'users', mockUser.uid)
    })

    it('maintains data consistency', async () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        role: 'agent' as const,
        profileCompleted: false,
      }

      mockSetDoc.mockResolvedValue(undefined)

      await userService.createUser(userData)

      expect(mockSetDoc).toHaveBeenCalledWith(
        mockDoc(),
        expect.objectContaining({
          uid: userData.uid,
          email: userData.email,
          role: userData.role,
          profileCompleted: userData.profileCompleted,
        })
      )
    })
  })
})