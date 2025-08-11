import { render, screen } from '@testing-library/react'
import { LoadingState } from '../LoadingState'

describe('LoadingState Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<LoadingState />)
      
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('renders with custom message', () => {
      render(<LoadingState message="Custom loading message" />)
      
      expect(screen.getByText('Custom loading message')).toBeInTheDocument()
    })

    it('renders with custom size', () => {
      render(<LoadingState size="lg" />)
      
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('renders with different sizes', () => {
      const { rerender } = render(<LoadingState size="sm" />)
      expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')

      rerender(<LoadingState size="md" />)
      expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6')

      rerender(<LoadingState size="lg" />)
      expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')
    })

    it('renders with custom className', () => {
      render(<LoadingState className="custom-loading" />)
      
      const container = screen.getByRole('status').parentElement
      expect(container).toHaveClass('custom-loading')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<LoadingState />)
      
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveAttribute('aria-live', 'polite')
      expect(spinner).toHaveAttribute('aria-label', 'Loading')
    })

    it('supports custom aria-label', () => {
      render(<LoadingState aria-label="Custom loading label" />)
      
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveAttribute('aria-label', 'Custom loading label')
    })

    it('announces loading state to screen readers', () => {
      render(<LoadingState message="Please wait while we load your data" />)
      
      expect(screen.getByText('Please wait while we load your data')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders inline variant', () => {
      render(<LoadingState variant="inline" />)
      
      const container = screen.getByRole('status').parentElement
      expect(container).toHaveClass('inline-flex')
    })

    it('renders fullscreen variant', () => {
      render(<LoadingState variant="fullscreen" />)
      
      const container = screen.getByRole('status').parentElement
      expect(container).toHaveClass('fixed', 'inset-0')
    })

    it('renders overlay variant', () => {
      render(<LoadingState variant="overlay" />)
      
      const container = screen.getByRole('status').parentElement
      expect(container).toHaveClass('absolute', 'inset-0')
    })
  })

  describe('Content', () => {
    it('renders without message when message is empty', () => {
      render(<LoadingState message="" />)
      
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders with children content', () => {
      render(
        <LoadingState>
          <div>Additional content</div>
        </LoadingState>
      )
      
      expect(screen.getByText('Additional content')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies correct spinner animation classes', () => {
      render(<LoadingState />)
      
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('animate-spin')
    })

    it('applies correct color classes', () => {
      render(<LoadingState />)
      
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('text-primary')
    })
  })

  describe('Integration', () => {
    it('works within other components', () => {
      render(
        <div>
          <LoadingState message="Loading component" />
          <div>Other content</div>
        </div>
      )
      
      expect(screen.getByText('Loading component')).toBeInTheDocument()
      expect(screen.getByText('Other content')).toBeInTheDocument()
    })

    it('handles conditional rendering', () => {
      const { rerender } = render(<LoadingState message="Loading" />)
      expect(screen.getByText('Loading')).toBeInTheDocument()

      rerender(<div>Content loaded</div>)
      expect(screen.queryByText('Loading')).not.toBeInTheDocument()
      expect(screen.getByText('Content loaded')).toBeInTheDocument()
    })
  })
})
