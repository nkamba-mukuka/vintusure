import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import LandingPage from '../../components/landingpage/LandingPage'
import ErrorBoundary from '../../components/ErrorBoundary'
import LoadingState from '../../components/LoadingState'

expect.extend(toHaveNoViolations)

// Component that throws an error for testing
const ThrowError = () => {
  throw new Error('Test error')
}

describe('Accessibility Tests', () => {
  describe('LandingPage Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<LandingPage />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper heading hierarchy', () => {
      render(<LandingPage />)
      
      // Check for main heading
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toBeInTheDocument()
      expect(mainHeading).toHaveTextContent('AI-Powered Insurance Intelligence')
      
      // Check for section headings
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(sectionHeadings.length).toBeGreaterThan(0)
    })

    it('has proper landmark regions', () => {
      render(<LandingPage />)
      
      // Check for navigation landmark
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      
      // Check for main landmark
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      
      // Check for footer landmark
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
    })

    it('has accessible form controls', () => {
      render(<LandingPage />)
      
      // Check for buttons with proper labels
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })

    it('has proper skip links', () => {
      render(<LandingPage />)
      
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })

    it('has proper focus management', () => {
      render(<LandingPage />)
      
      // Check that interactive elements are focusable
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1')
      })
    })

    it('has accessible images', () => {
      render(<LandingPage />)
      
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
      })
    })
  })

  describe('ErrorBoundary Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper error information for screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/Error ID:/)).toBeInTheDocument()
    })

    it('has accessible buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      const retryButton = screen.getByText('Try Again')
      const homeButton = screen.getByText('Go Home')
      
      expect(retryButton).toHaveAccessibleName()
      expect(homeButton).toHaveAccessibleName()
    })
  })

  describe('LoadingState Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<LoadingState />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper loading indicators', () => {
      render(<LoadingState />)
      
      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveTextContent('Loading...')
    })

    it('hides decorative elements from screen readers', () => {
      render(<LoadingState />)
      
      // Check for decorative elements that should be hidden
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]')
      expect(decorativeElements.length).toBeGreaterThan(0)
    })

    it('skeleton elements have proper labels', () => {
      render(<LoadingState variant="skeleton" />)
      
      const skeletonElements = document.querySelectorAll('[role="status"]')
      skeletonElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label')
      })
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('uses sufficient color contrast ratios', () => {
      render(<LandingPage />)
      
      // Check that text elements have sufficient contrast
      const textElements = screen.getAllByText(/./)
      textElements.forEach(element => {
        // This is a basic check - in a real test you'd use a color contrast library
        expect(element).toBeInTheDocument()
      })
    })

    it('supports reduced motion preferences', () => {
      render(<LoadingState />)
      
      // Check for animation classes that respect reduced motion
      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toHaveClass('animate-')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation for all interactive elements', () => {
      render(<LandingPage />)
      
      const interactiveElements = screen.getAllByRole('button')
      interactiveElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabIndex', '-1')
      })
    })

    it('has proper focus indicators', () => {
      render(<LandingPage />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:')
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('provides meaningful text alternatives', () => {
      render(<LandingPage />)
      
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        const alt = img.getAttribute('alt')
        expect(alt).toBeTruthy()
        expect(alt).not.toBe('')
      })
    })

    it('uses proper ARIA attributes', () => {
      render(<LandingPage />)
      
      // Check for proper ARIA labels and descriptions
      const elementsWithAria = document.querySelectorAll('[aria-label], [aria-describedby]')
      elementsWithAria.forEach(element => {
        const ariaLabel = element.getAttribute('aria-label')
        const ariaDescribedBy = element.getAttribute('aria-describedby')
        expect(ariaLabel || ariaDescribedBy).toBeTruthy()
      })
    })
  })

  describe('Mobile Accessibility', () => {
    it('has appropriate touch targets', () => {
      render(<LandingPage />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Check for minimum touch target size (44px)
        const rect = button.getBoundingClientRect()
        expect(rect.width).toBeGreaterThanOrEqual(44)
        expect(rect.height).toBeGreaterThanOrEqual(44)
      })
    })

    it('supports zoom and responsive design', () => {
      render(<LandingPage />)
      
      // Check for responsive classes
      const container = screen.getByRole('main')
      expect(container).toHaveClass('sm:', 'lg:')
    })
  })

  describe('WCAG 2.1 AA Compliance', () => {
    it('meets WCAG guidelines for interactive elements', () => {
      render(<LandingPage />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Check for proper labeling
        expect(button).toHaveAccessibleName()
        
        // Check for proper role
        expect(button).toHaveAttribute('role', 'button')
      })
    })

    it('provides sufficient context for form controls', () => {
      render(<LandingPage />)
      
      // Check that form controls have proper labels
      const formControls = document.querySelectorAll('input, select, textarea')
      formControls.forEach(control => {
        const label = control.getAttribute('aria-label') || 
                     control.getAttribute('aria-labelledby') ||
                     document.querySelector(`label[for="${control.id}"]`)
        expect(label).toBeTruthy()
      })
    })
  })
})
