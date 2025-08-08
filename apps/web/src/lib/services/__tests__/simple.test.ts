import { describe, it, expect } from 'vitest'

describe('Simple Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })

  it('should validate file validation logic', () => {
    const validateFile = (file: { size: number; name: string }) => {
      const MAX_SIZE = 10 * 1024 * 1024 // 10MB
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt']
      
      if (file.size > MAX_SIZE) {
        return { isValid: false, error: 'File too large' }
      }
      
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(`.${extension}`)) {
        return { isValid: false, error: 'Invalid file type' }
      }
      
      return { isValid: true, error: undefined }
    }

    // Test valid file
    const validFile = { size: 1024 * 1024, name: 'test.pdf' }
    expect(validateFile(validFile).isValid).toBe(true)

    // Test file too large
    const largeFile = { size: 11 * 1024 * 1024, name: 'test.pdf' }
    expect(validateFile(largeFile).isValid).toBe(false)
    expect(validateFile(largeFile).error).toBe('File too large')

    // Test invalid file type
    const invalidFile = { size: 1024 * 1024, name: 'test.exe' }
    expect(validateFile(invalidFile).isValid).toBe(false)
    expect(validateFile(invalidFile).error).toBe('Invalid file type')
  })
})
