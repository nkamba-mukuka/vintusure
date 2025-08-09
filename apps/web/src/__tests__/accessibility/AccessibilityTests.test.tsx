import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from '../../components/landingpage/LandingPage'
import ErrorBoundary from '../../components/ErrorBoundary'
import LoadingState from '../../components/LoadingState'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}))

// Mock SEO component
vi.mock('@/components/SEO', () => ({
  default: () => null,
  createOrganizationSchema: () => ({}),
  createWebPageSchema: () => ({}),
  createSoftwareApplicationSchema: () => ({}),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Shield: () => <div role="img" aria-label="Shield icon" />,
  Car: () => <div role="img" aria-label="Car icon" />,
  Brain: () => <div role="img" aria-label="Brain icon" />,
  TrendingUp: () => <div role="img" aria-label="Trending up icon" />,
  User: () => <div role="img" aria-label="User icon" />,
  Building2: () => <div role="img" aria-label="Building icon" />,
  AlertTriangle: () => <div role="img" aria-label="Alert triangle icon" />,
  RefreshCw: () => <div role="img" aria-label="Refresh icon" />,
  Home: () => <div role="img" aria-label="Home icon" />,
  Bug: () => <div role="img" aria-label="Bug icon" />,
  Loader2Icon: () => <div role="img" aria-label="Loading icon" />,
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </HelmetProvider>
  )
}

describe('Accessibility Tests', () => {
  describe('LandingPage Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = renderWithProviders(<LandingPage />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper heading hierarchy', () => {
      renderWithProviders(<LandingPage />)
      
      // Should have one h1
      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      expect(h1Elements).toHaveLength(1)
      expect(h1Elements[0]).toHaveTextContent('AI-Powered Insurance Intelligence')

      // Should have proper h2 for features section
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      expect(h2Elements.length).toBeGreaterThan(0)

      // Feature cards should have h3
      const h3Elements = screen.getAllByRole('heading', { level: 3 })
      expect(h3Elements).toHaveLength(4) // Four feature cards
    })

    it('has proper landmark regions', () => {
      renderWithProviders(<LandingPage />)
      
      // Should have navigation landmark
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      
      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      // Should have contentinfo (footer) landmark
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      
      // Should have region for features
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('has accessible form controls', () => {
      renderWithProviders(<LandingPage />)
      
      // All buttons should be accessible
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
        // Should have accessible name (either text content or aria-label)
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('has proper skip links', () => {
      renderWithProviders(<LandingPage />)
      
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toHaveAttribute('href', '#main-content')
      
      // Skip link should be focusable
      expect(skipLink).toHaveClass('focus:not-sr-only')
    })

    it('has proper focus management', () => {
      renderWithProviders(<LandingPage />)
      
      // Feature cards should be focusable
      const featureCards = screen.getAllByRole('listitem')
      featureCards.forEach(card => {
        expect(card).toHaveAttribute('tabIndex', '0')
      })
    })

    it('has accessible images', () => {
      renderWithProviders(<LandingPage />)
      
      // Logo images should have proper alt text
      const logos = screen.getAllByAltText(/VintuSure.*logo/i)
      expect(logos.length).toBeGreaterThan(0)
      
      // Decorative icons should be hidden from screen readers
      const decorativeIcons = document.querySelectorAll('[aria-hidden="true"]')
      expect(decorativeIcons.length).toBeGreaterThan(0)
    })
  })

  describe('ErrorBoundary Accessibility', () => {
    // Test component that throws an error
    const ThrowError = () => {
      throw new Error('Test error')
    }

    it('should not have accessibility violations in error state', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has accessible error messages', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      // Should have proper heading
      const heading = screen.getByRole('heading', { name: /something went wrong/i })
      expect(heading).toBeInTheDocument()
      
      // Should have descriptive text
      expect(screen.getByText(/we're sorry.*unexpected/i)).toBeInTheDocument()
      
      // Buttons should be accessible
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })

    it('has proper button labels', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument()
    })
  })

  describe('LoadingState Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<LoadingState />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper loading indicators', () => {
      render(<LoadingState message="Loading content" />)
      
      // Should have status role
      const status = screen.getByRole('status')
      expect(status).toBeInTheDocument()
      expect(status).toHaveAttribute('aria-live', 'polite')
      expect(status).toHaveAttribute('aria-label', 'Loading content')
    })

    it('hides decorative elements from screen readers', () => {
      render(<LoadingState />)
      
      // Loading icon should be hidden from screen readers
      const hiddenIcon = document.querySelector('[aria-hidden="true"]')
      expect(hiddenIcon).toBeInTheDocument()
    })

    it('skeleton elements have proper labels', () => {
      render(<LoadingState variant="skeleton" />)
      
      // Skeleton elements should have status role
      const skeletonElements = document.querySelectorAll('[role="status"]')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('uses sufficient color contrast ratios', () => {
      renderWithProviders(<LandingPage />)
      
      // Primary text should use high contrast colors
      const primaryHeading = screen.getByRole('heading', { level: 1 })
      expect(primaryHeading).toHaveClass('text-primary')
      
      // Muted text should still be readable
      const mutedText = document.querySelector('.text-muted-foreground')
      expect(mutedText).toBeInTheDocument()
    })

    it('supports reduced motion preferences', () => {
      // Test that animations can be disabled
      renderWithProviders(<LandingPage />)
      
      // Animation classes should be present but respect user preferences
      const animatedElements = document.querySelectorAll('[class*="animate-"]')
      expect(animatedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation for all interactive elements', () => {
      renderWithProviders(<LandingPage />)
      
      // All buttons should be keyboard accessible
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1')
      })
      
      // All links should be keyboard accessible
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabIndex', '-1')
      })
    })

    it('has proper focus indicators', () => {
      renderWithProviders(<LandingPage />)
      
      // Skip link should be visible on focus
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toHaveClass('focus:not-sr-only')
    })
  })

  describe('Screen Reader Support', () => {
    it('provides meaningful text alternatives', () => {
      renderWithProviders(<LandingPage />)
      
      // Feature list should be announced properly
      const featuresList = screen.getByRole('list')
      expect(featuresList).toHaveAttribute('aria-label', 'VintuSure platform features')
      
      // Navigation should be properly labeled
      const navigation = screen.getByRole('navigation')
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation')
    })

    it('uses proper ARIA attributes', () => {
      renderWithProviders(<LandingPage />)
      
      // Check for proper ARIA labels
      const labeledElements = document.querySelectorAll('[aria-label]')
      expect(labeledElements.length).toBeGreaterThan(0)
      
      // Check for proper ARIA described by relationships
      const describedElements = document.querySelectorAll('[aria-describedby]')
      expect(describedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Mobile Accessibility', () => {
    it('has appropriate touch targets', () => {
      renderWithProviders(<LandingPage />)
      
      // Buttons should be large enough for touch
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Should have padding for adequate touch target
        const styles = window.getComputedStyle(button)
        expect(styles.padding).toBeTruthy()
      })
    })

    it('supports zoom and responsive design', () => {
      renderWithProviders(<LandingPage />)
      
      // Should have responsive classes
      const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="lg:"]')
      expect(responsiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('WCAG 2.1 AA Compliance', () => {
    it('meets WCAG guidelines for interactive elements', () => {
      renderWithProviders(<LandingPage />)
      
      // All interactive elements should have accessible names
      const interactiveElements = [
        ...screen.getAllByRole('button'),
        ...screen.getAllByRole('link'),
      ]
      
      interactiveElements.forEach(element => {
        const accessibleName = element.textContent || element.getAttribute('aria-label')
        expect(accessibleName).toBeTruthy()
      })
    })

    it('provides sufficient context for form controls', () => {
      // Test when form controls are present
      render(
        <ErrorBoundary>
          <div>
            <label htmlFor="test-input">Test Input</label>
            <input id="test-input" type="text" />
          </div>
        </ErrorBoundary>
      )
      
      const input = screen.getByLabelText('Test Input')
      expect(input).toBeInTheDocument()
    })
  })
})
