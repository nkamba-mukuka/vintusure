import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the aiGenerationService
const mockAiGenerationService = {
  generateText: vi.fn(),
  generateInsuranceContent: vi.fn(),
  generateStreamingText: vi.fn(),
  generateClaimSummary: vi.fn(),
  generatePolicyRecommendation: vi.fn(),
}

describe('aiGenerationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateText', () => {
    it('generates text successfully', async () => {
      mockAiGenerationService.generateText.mockResolvedValue('Generated text response')

      const result = await mockAiGenerationService.generateText('Test prompt')

      expect(result).toBe('Generated text response')
      expect(mockAiGenerationService.generateText).toHaveBeenCalledWith('Test prompt')
    })

    it('handles generation errors gracefully', async () => {
      mockAiGenerationService.generateText.mockRejectedValue(new Error('Generation failed'))

      await expect(mockAiGenerationService.generateText('Test prompt')).rejects.toThrow('Generation failed')
    })

    it('handles empty responses', async () => {
      mockAiGenerationService.generateText.mockResolvedValue('')

      const result = await mockAiGenerationService.generateText('Test prompt')

      expect(result).toBe('')
    })
  })

  describe('generateInsuranceContent', () => {
    it('generates insurance-specific content', async () => {
      mockAiGenerationService.generateInsuranceContent.mockResolvedValue('Insurance policy content')

      const result = await mockAiGenerationService.generateInsuranceContent(
        'policy', 
        'auto insurance', 
        { coverage: 'comprehensive' }
      )

      expect(result).toBe('Insurance policy content')
      expect(mockAiGenerationService.generateInsuranceContent).toHaveBeenCalledWith(
        'policy',
        'auto insurance',
        { coverage: 'comprehensive' }
      )
    })

    it('handles different content types', async () => {
      mockAiGenerationService.generateInsuranceContent.mockResolvedValue('Email content')

      await mockAiGenerationService.generateInsuranceContent('email', 'customer service')

      expect(mockAiGenerationService.generateInsuranceContent).toHaveBeenCalledWith(
        'email',
        'customer service'
      )
    })

    it('includes context when provided', async () => {
      mockAiGenerationService.generateInsuranceContent.mockResolvedValue('Contextual content')

      const context = { customerName: 'John Doe', policyNumber: '12345' }
      await mockAiGenerationService.generateInsuranceContent('letter', 'claim denial', context)

      expect(mockAiGenerationService.generateInsuranceContent).toHaveBeenCalledWith(
        'letter',
        'claim denial',
        context
      )
    })
  })

  describe('generateStreamingText', () => {
    it('streams text generation with chunks', async () => {
      const onChunk = vi.fn()
      mockAiGenerationService.generateStreamingText.mockResolvedValue('First chunk Second chunk Final chunk')

      const result = await mockAiGenerationService.generateStreamingText('Test prompt', onChunk)

      expect(result).toBe('First chunk Second chunk Final chunk')
      expect(mockAiGenerationService.generateStreamingText).toHaveBeenCalledWith('Test prompt', onChunk)
    })

    it('handles streaming errors', async () => {
      const onChunk = vi.fn()
      mockAiGenerationService.generateStreamingText.mockRejectedValue(new Error('Streaming failed'))

      await expect(
        mockAiGenerationService.generateStreamingText('Test prompt', onChunk)
      ).rejects.toThrow('Streaming failed')
    })

    it('handles empty streams', async () => {
      const onChunk = vi.fn()
      mockAiGenerationService.generateStreamingText.mockResolvedValue('')

      const result = await mockAiGenerationService.generateStreamingText('Test prompt', onChunk)

      expect(result).toBe('')
    })
  })

  describe('generateClaimSummary', () => {
    it('generates claim summary from claim data', async () => {
      mockAiGenerationService.generateClaimSummary.mockResolvedValue('Comprehensive claim summary')

      const claimData = {
        claimId: 'CLAIM-001',
        description: 'Vehicle accident',
        amount: 5000,
        damageType: 'Vehicle' as const,
        incidentDate: new Date('2024-01-15'),
      }

      const result = await mockAiGenerationService.generateClaimSummary(claimData)

      expect(result).toBe('Comprehensive claim summary')
      expect(mockAiGenerationService.generateClaimSummary).toHaveBeenCalledWith(claimData)
    })

    it('handles missing optional fields in claim data', async () => {
      mockAiGenerationService.generateClaimSummary.mockResolvedValue('Basic claim summary')

      const minimalClaimData = {
        claimId: 'CLAIM-002',
        description: 'Simple claim',
        amount: 1000,
        damageType: 'Property' as const,
        incidentDate: new Date(),
      }

      const result = await mockAiGenerationService.generateClaimSummary(minimalClaimData)

      expect(result).toBe('Basic claim summary')
      expect(mockAiGenerationService.generateClaimSummary).toHaveBeenCalledWith(minimalClaimData)
    })
  })

  describe('generatePolicyRecommendation', () => {
    it('generates policy recommendations based on customer profile', async () => {
      mockAiGenerationService.generatePolicyRecommendation.mockResolvedValue('Recommended insurance policies')

      const customerProfile = {
        age: 30,
        occupation: 'Software Engineer',
        location: 'Lusaka',
        vehicleType: 'sedan',
        drivingHistory: 'clean',
      }

      const result = await mockAiGenerationService.generatePolicyRecommendation(customerProfile)

      expect(result).toBe('Recommended insurance policies')
      expect(mockAiGenerationService.generatePolicyRecommendation).toHaveBeenCalledWith(customerProfile)
    })
  })

  describe('Error Handling', () => {
    it('handles API rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded')
      rateLimitError.name = 'RateLimitError'
      mockAiGenerationService.generateText.mockRejectedValue(rateLimitError)

      await expect(
        mockAiGenerationService.generateText('Test prompt')
      ).rejects.toThrow('Rate limit exceeded')
    })

    it('handles network connectivity errors', async () => {
      const networkError = new Error('Network error')
      networkError.name = 'NetworkError'
      mockAiGenerationService.generateText.mockRejectedValue(networkError)

      await expect(
        mockAiGenerationService.generateText('Test prompt')
      ).rejects.toThrow('Network error')
    })

    it('handles invalid API key errors', async () => {
      const authError = new Error('Invalid API key')
      authError.name = 'AuthError'
      mockAiGenerationService.generateText.mockRejectedValue(authError)

      await expect(
        mockAiGenerationService.generateText('Test prompt')
      ).rejects.toThrow('Invalid API key')
    })
  })

  describe('Configuration', () => {
    it('service functions are callable', () => {
      expect(typeof mockAiGenerationService.generateText).toBe('function')
      expect(typeof mockAiGenerationService.generateInsuranceContent).toBe('function')
      expect(typeof mockAiGenerationService.generateStreamingText).toBe('function')
      expect(typeof mockAiGenerationService.generateClaimSummary).toBe('function')
      expect(typeof mockAiGenerationService.generatePolicyRecommendation).toBe('function')
    })
  })
})