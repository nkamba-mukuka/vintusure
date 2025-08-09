import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useState } from 'react'
import ErrorBoundary, { withErrorBoundary, useErrorHandler } from '../ErrorBoundary'

// Mock console.error to avoid cluttering test output
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalError
})

// Test component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Component works</div>
}

// Component that can be triggered to throw
const ConditionalThrow = () => {
  const [shouldThrow, setShouldThrow] = useState(false)
  
  if (shouldThrow) {
    throw new Error('Conditional test error')
  }
  
  return (
    <button onClick={() => setShouldThrow(true)}>
      Trigger Error
    </button>
  )
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument()
  })

  it('displays error information', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/Oops! Something went wrong/)).toBeInTheDocument()
  })

  it('shows retry button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    
    const retryButton = screen.getByText(/try again/i)
    expect(retryButton).toBeInTheDocument()
  })

  it('shows go home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const homeButton = screen.getByText('Go Home')
    expect(homeButton).toBeInTheDocument()
  })

  it('can toggle error details visibility', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Check for details element
    const details = screen.getByText(/error details/i)
    expect(details).toBeInTheDocument()
  })

  it('calls custom error handler when provided', () => {
    const mockErrorHandler = vi.fn()
    
    render(
      <ErrorBoundary onError={mockErrorHandler}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(mockErrorHandler).toHaveBeenCalled()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
  })

  it('resets on props change when resetOnPropsChange is true', () => {
    const { rerender } = render(
      <ErrorBoundary resetOnPropsChange={true} resetKeys={['key1']}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    
    // Change the reset key
    rerender(
      <ErrorBoundary resetOnPropsChange={true} resetKeys={['key2']}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    // Should reset and show content
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
  })

  describe('withErrorBoundary HOC', () => {
    it('wraps component with error boundary', () => {
      const TestComponent = () => <div>HOC Test</div>
      const WrappedComponent = withErrorBoundary(TestComponent)
      
      render(<WrappedComponent />)
      
      expect(screen.getByText('HOC Test')).toBeInTheDocument()
    })

    it('handles errors in wrapped component', () => {
      const WrappedComponent = withErrorBoundary(ThrowError)
      
      render(<WrappedComponent shouldThrow={true} />)
      
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    })
  })

  describe('useErrorHandler hook', () => {
    it('provides error handler function', () => {
      const TestComponent = () => {
        const handleError = useErrorHandler()
        expect(typeof handleError).toBe('function')
        return <div>Hook component</div>
      }
      
      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Hook component')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      // Check for accessible elements
      expect(screen.getByText('Try Again')).toHaveAttribute('type', 'button')
      expect(screen.getByText('Go Home')).toHaveAttribute('type', 'button')
    })

    it('provides proper error information for screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      // Should have descriptive text for screen readers
      expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument()
    })
  })
})
