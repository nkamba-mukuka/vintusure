import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingState, { Skeleton, SkeletonCard, SkeletonTable } from '../LoadingState'

describe('LoadingState', () => {
  describe('default spinner variant', () => {
    it('renders loading spinner with default message', () => {
      render(<LoadingState />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument()
    })

    it('renders with custom message', () => {
      render(<LoadingState message="Custom loading message" />)
      
      expect(screen.getByText('Custom loading message')).toBeInTheDocument()
      expect(screen.getByLabelText('Custom loading message')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<LoadingState className="custom-class" />)
      
      const container = screen.getByLabelText('Loading...').closest('div')
      expect(container).toHaveClass('custom-class')
    })

    it('renders different sizes correctly', () => {
      const { rerender } = render(<LoadingState size="sm" />)
      expect(screen.getByLabelText('Loading...').closest('div')).toHaveClass('min-h-[100px]')
      
      rerender(<LoadingState size="md" />)
      expect(screen.getByLabelText('Loading...').closest('div')).toHaveClass('min-h-[200px]')
      
      rerender(<LoadingState size="lg" />)
      expect(screen.getByLabelText('Loading...').closest('div')).toHaveClass('min-h-[300px]')
    })
  })

  describe('skeleton variant', () => {
    it('renders skeleton card when variant is skeleton', () => {
      render(<LoadingState variant="skeleton" />)
      
      // Should render SkeletonCard instead of spinner
      const skeletonElements = document.querySelectorAll('.shimmer')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })
  })

  describe('pulse variant', () => {
    it('renders pulse animation when variant is pulse', () => {
      render(<LoadingState variant="pulse" message="Pulsing..." />)
      
      expect(screen.getByText('Pulsing...')).toBeInTheDocument()
      const pulseElement = document.querySelector('.pulse-primary')
      expect(pulseElement).toBeInTheDocument()
    })

    it('respects size prop for pulse variant', () => {
      const { rerender } = render(<LoadingState variant="pulse" size="sm" />)
      const pulseElement = document.querySelector('.pulse-primary')
      expect(pulseElement).toHaveClass('h-4', 'w-4')
      
      rerender(<LoadingState variant="pulse" size="lg" />)
      const largePulseElement = document.querySelector('.pulse-primary')
      expect(largePulseElement).toHaveClass('h-12', 'w-12')
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes for screen readers', () => {
      render(<LoadingState message="Loading content" />)
      
      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveAttribute('aria-live', 'polite')
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading content')
    })

    it('has aria-hidden for decorative elements', () => {
      render(<LoadingState />)
      
      const iconElement = document.querySelector('svg[aria-hidden="true"]')
      expect(iconElement).toBeInTheDocument()
    })
  })
})

describe('Skeleton', () => {
  it('renders skeleton placeholder with proper attributes', () => {
    render(<Skeleton />)
    
    const skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('role', 'status')
  })

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" />)
    
    const skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toHaveClass('custom-skeleton')
    expect(skeleton).toHaveClass('shimmer')
  })

  it('has shimmer animation class', () => {
    render(<Skeleton />)
    
    const skeleton = screen.getByLabelText('Loading content')
    expect(skeleton).toHaveClass('shimmer')
  })
})

describe('SkeletonCard', () => {
  it('renders card skeleton structure', () => {
    render(<SkeletonCard />)
    
    // Should render multiple skeleton elements
    const skeletonElements = document.querySelectorAll('.shimmer')
    expect(skeletonElements.length).toBeGreaterThan(3) // Multiple skeleton lines + buttons
  })

  it('has fade-in animation', () => {
    render(<SkeletonCard />)
    
    const cardContainer = document.querySelector('.animate-fade-in')
    expect(cardContainer).toBeInTheDocument()
  })

  it('renders proper structure with different sized skeletons', () => {
    render(<SkeletonCard />)
    
    // Check for different skeleton sizes
    expect(document.querySelector('.h-4.w-2\\/3')).toBeInTheDocument()
    expect(document.querySelector('.h-4.w-full')).toBeInTheDocument()
    expect(document.querySelector('.h-4.w-1\\/2')).toBeInTheDocument()
  })
})

describe('SkeletonTable', () => {
  it('renders table skeleton structure', () => {
    render(<SkeletonTable />)
    
    // Should render header and multiple rows
    const skeletonElements = document.querySelectorAll('.shimmer')
    expect(skeletonElements.length).toBeGreaterThan(10) // Header + 5 rows with multiple elements each
  })

  it('has proper table structure', () => {
    render(<SkeletonTable />)
    
    // Check for table-like structure
    expect(document.querySelector('.border-b')).toBeInTheDocument() // Header border
    expect(document.querySelector('.space-y-3')).toBeInTheDocument() // Row spacing
  })

  it('renders 5 skeleton rows by default', () => {
    render(<SkeletonTable />)
    
    // Count the number of row containers
    const rows = document.querySelectorAll('.flex.items-center.space-x-4')
    expect(rows).toHaveLength(5)
  })

  it('includes avatar placeholders in rows', () => {
    render(<SkeletonTable />)
    
    // Check for circular avatar placeholders
    const avatars = document.querySelectorAll('.rounded-full')
    expect(avatars.length).toBeGreaterThan(0)
  })
})

describe('Loading State Integration', () => {
  it('works with different variants seamlessly', () => {
    const { rerender } = render(<LoadingState variant="spinner" />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    rerender(<LoadingState variant="skeleton" />)
    expect(document.querySelectorAll('.shimmer').length).toBeGreaterThan(0)
    
    rerender(<LoadingState variant="pulse" />)
    expect(document.querySelector('.pulse-primary')).toBeInTheDocument()
  })

  it('maintains accessibility across all variants', () => {
    const { rerender } = render(<LoadingState variant="spinner" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    
    rerender(<LoadingState variant="pulse" />)
    // Pulse variant should still be accessible
    expect(document.querySelector('[role="status"]')).toBeInTheDocument()
  })
})
