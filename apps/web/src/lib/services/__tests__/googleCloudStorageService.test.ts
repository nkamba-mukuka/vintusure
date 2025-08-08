import { describe, it, expect, vi, beforeEach } from 'vitest'
import { googleCloudStorageService } from '../googleCloudStorageService'

// Mock Firebase Functions
vi.mock('@/lib/firebase/config', () => ({
  functions: {
    // Mock the functions object
  }
}))

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn())
}))

// Mock File object for testing
class MockFile extends File {
  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    super(bits, name, options)
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const text = this instanceof File ? await this.text() : ''
    const encoder = new TextEncoder()
    return encoder.encode(text).buffer
  }
}

// Mock global File constructor
global.File = MockFile as any

describe('googleCloudStorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateFile', () => {
    it('should validate a valid PDF file', () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const result = googleCloudStorageService.validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should validate a valid image file', () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const result = googleCloudStorageService.validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should validate a valid document file', () => {
      const file = new File(['test content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const result = googleCloudStorageService.validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should validate a valid text file', () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const result = googleCloudStorageService.validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject file larger than 10MB', () => {
      // Create a file larger than 10MB
      const largeContent = new Array(11 * 1024 * 1024).join('a') // 11MB
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
      
      const result = googleCloudStorageService.validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File size exceeds maximum allowed size of 10MB')
    })

    it('should reject invalid file type', () => {
      const file = new File(['test content'], 'test.exe', { type: 'application/x-msdownload' })
      const result = googleCloudStorageService.validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File type not allowed')
    })

    it('should reject file without extension', () => {
      const file = new File(['test content'], 'testfile', { type: 'text/plain' })
      const result = googleCloudStorageService.validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File type not allowed')
    })

    it('should reject file with unsupported extension', () => {
      const file = new File(['test content'], 'test.zip', { type: 'application/zip' })
      const result = googleCloudStorageService.validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File type not allowed')
    })
  })

  describe('uploadDocument', () => {
    it('should successfully upload a valid file', async () => {
      const mockHttpsCallable = vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: {
            url: 'https://storage.googleapis.com/test-url',
            path: 'agent documents/policies/user123/test-file.pdf'
          }
        }
      })

      // Mock the httpsCallable function
      const { httpsCallable } = await import('firebase/functions')
      vi.mocked(httpsCallable).mockReturnValue(mockHttpsCallable)

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const onProgress = vi.fn()

      const result = await googleCloudStorageService.uploadDocument({
        file,
        entityType: 'policy',
        entityId: 'user123',
        documentType: 'policy',
        userId: 'user123',
        onProgress
      })

      expect(result.url).toBe('https://storage.googleapis.com/test-url')
      expect(result.path).toBe('agent documents/policies/user123/test-file.pdf')
      expect(mockHttpsCallable).toHaveBeenCalledWith({
        fileData: expect.any(String), // base64 encoded file data
        fileName: expect.stringContaining('agent documents/policies/user123/'),
        userId: 'user123'
      })
    })

    it('should throw error for invalid file', async () => {
      const file = new File(['test content'], 'test.exe', { type: 'application/x-msdownload' })

      await expect(googleCloudStorageService.uploadDocument({
        file,
        entityType: 'policy',
        entityId: 'user123',
        documentType: 'policy',
        userId: 'user123'
      })).rejects.toThrow('File type not allowed')
    })

    it('should throw error when upload fails', async () => {
      const mockHttpsCallable = vi.fn().mockResolvedValue({
        data: {
          success: false,
          error: 'Upload failed'
        }
      })

      const { httpsCallable } = await import('firebase/functions')
      vi.mocked(httpsCallable).mockReturnValue(mockHttpsCallable)

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

      await expect(googleCloudStorageService.uploadDocument({
        file,
        entityType: 'policy',
        entityId: 'user123',
        documentType: 'policy',
        userId: 'user123'
      })).rejects.toThrow('Upload failed')
    })

    it('should call progress callback during upload', async () => {
      const mockHttpsCallable = vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: {
            url: 'https://storage.googleapis.com/test-url',
            path: 'agent documents/policies/user123/test-file.pdf'
          }
        }
      })

      const { httpsCallable } = await import('firebase/functions')
      vi.mocked(httpsCallable).mockReturnValue(mockHttpsCallable)

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const onProgress = vi.fn()

      await googleCloudStorageService.uploadDocument({
        file,
        entityType: 'policy',
        entityId: 'user123',
        documentType: 'policy',
        userId: 'user123',
        onProgress
      })

      // Wait for progress callbacks to be called
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(onProgress).toHaveBeenCalled()
    })
  })

  describe('deleteDocument', () => {
    it('should throw error for unimplemented delete functionality', async () => {
      await expect(googleCloudStorageService.deleteDocument('test/path')).rejects.toThrow('Delete functionality not yet implemented')
    })
  })

  describe('listUserDocuments', () => {
    it('should return empty array for unimplemented list functionality', async () => {
      const result = await googleCloudStorageService.listUserDocuments('user123')
      expect(result).toEqual([])
    })
  })

  describe('getFileMetadata', () => {
    it('should return empty object for unimplemented metadata functionality', async () => {
      const result = await googleCloudStorageService.getFileMetadata('test/path')
      expect(result).toEqual({})
    })
  })
})
