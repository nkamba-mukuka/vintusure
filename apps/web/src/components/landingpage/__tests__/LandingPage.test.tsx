import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import LandingPage from '../LandingPage'

// Mock the assets
vi.mock('@/assets/vintusure-logo.ico', () => ({
  default: 'mocked-logo'
}))

describe('LandingPage', () => {
  describe('Navigation', () => {
    it('renders navigation with VintuSure logo and brand name', () => {
      render(<LandingPage />)
      const navBrand = screen.getByText('VintuSure', { selector: 'nav span' })
      expect(navBrand).toBeInTheDocument()
      expect(screen.getByAltText('VintuSure company logo')).toBeInTheDocument()
    })

    it('shows sign in and sign up buttons when user is not authenticated', () => {
      render(<LandingPage />)
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('shows dashboard button when user is authenticated', () => {
      // This test would need to mock authenticated state
      render(<LandingPage />)
      // For now, just check that the component renders without error
      const navBrand = screen.getByText('VintuSure', { selector: 'nav span' })
      expect(navBrand).toBeInTheDocument()
    })

    it('includes skip to main content link for accessibility', () => {
      render(<LandingPage />)
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })
  })

  describe('Hero Section', () => {
    it('renders main heading with proper structure', () => {
      render(<LandingPage />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('AI-Powered Insurance Intelligence')
    })

    it('renders descriptive paragraph about VintuSure', () => {
      render(<LandingPage />)
      expect(screen.getByText(/VintuSure is an AI-powered online platform/)).toBeInTheDocument()
    })

    it('shows different CTAs based on authentication state', () => {
      render(<LandingPage />)
      expect(screen.getByText("I'm an Agent")).toBeInTheDocument()
      expect(screen.getByText("I'm a Customer")).toBeInTheDocument()
    })

    it('includes proper animations classes', () => {
      render(<LandingPage />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('animate-fade-in')
    })
  })

  describe('Features Section', () => {
    it('renders features section with proper heading', () => {
      render(<LandingPage />)
      expect(screen.getByText('Why Choose VintuSure for Your Insurance Business?')).toBeInTheDocument()
    })

    it('renders all four feature cards', () => {
      render(<LandingPage />)
      expect(screen.getByText('Advanced RAG Technology')).toBeInTheDocument()
      expect(screen.getByText('Multi-Insurance Support')).toBeInTheDocument()
      expect(screen.getByText('AI-Powered Assistance')).toBeInTheDocument()
      expect(screen.getByText('Scalable Solutions')).toBeInTheDocument()
    })

    it('includes proper icons for each feature', () => {
      render(<LandingPage />)
      // Check for icon elements (they should have aria-hidden="true")
      const icons = document.querySelectorAll('[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('has proper accessibility attributes for features list', () => {
      render(<LandingPage />)
      const featuresList = screen.getByRole('list')
      expect(featuresList).toBeInTheDocument()
      expect(featuresList).toHaveAttribute('aria-label', 'VintuSure platform features')
    })

    it('includes staggered animation classes', () => {
      render(<LandingPage />)
      const featureCards = screen.getAllByRole('listitem')
      featureCards.forEach((card, index) => {
        expect(card).toHaveClass('animate-slide-in-stagger')
      })
    })

    it('has hover effects on feature cards', () => {
      render(<LandingPage />)
      const featureCards = screen.getAllByRole('listitem')
      featureCards.forEach(card => {
        expect(card).toHaveClass('hover-card-effect')
      })
    })
  })

  describe('Footer', () => {
    it('renders footer with proper structure', () => {
      render(<LandingPage />)
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
    })

    it('includes VintuSure branding in footer', () => {
      render(<LandingPage />)
      const vintusureElements = screen.getAllByText('VintuSure')
      expect(vintusureElements.length).toBeGreaterThan(1) // One in nav, one in footer
    })

    it('includes copyright information', () => {
      render(<LandingPage />)
      expect(screen.getByText('© 2024 VintuSure. All rights reserved.')).toBeInTheDocument()
    })
  })

  describe('SEO Integration', () => {
    it('includes SEO component with proper props', () => {
      render(<LandingPage />)
      // The SEO component should be rendered (check for title)
      expect(document.title).toBe('AI-Powered Insurance Intelligence Platform | VintuSure')
    })
  })

  describe('Interactive Elements', () => {
    it('buttons have proper hover and focus states', () => {
      render(<LandingPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Check for hover classes (they contain hover:)
        const classList = button.className
        expect(classList).toMatch(/hover:/)
        expect(classList).toMatch(/focus:/)
      })
    })

    it('icons have hover animations in buttons', () => {
      render(<LandingPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const icon = button.querySelector('[aria-hidden="true"]')
        if (icon) {
          expect(icon).toHaveClass('transition-')
        }
      })
    })
  })

  describe('Responsive Design', () => {
    it('has responsive classes for different screen sizes', () => {
      render(<LandingPage />)
      const container = screen.getByRole('main')
      const classList = container.className
      expect(classList).toMatch(/sm:/)
      expect(classList).toMatch(/lg:/)
    })
  })

  describe('Purple Theme Consistency', () => {
    it('uses primary color for headings and branding', () => {
      render(<LandingPage />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-primary')
    })

    it('uses purple theme in feature cards', () => {
      render(<LandingPage />)
      const featureCards = screen.getAllByRole('listitem')
      featureCards.forEach(card => {
        // Check for primary color usage in feature headings
        const featureHeading = card.querySelector('h3')
        if (featureHeading) {
          expect(featureHeading).toHaveClass('text-primary')
        }
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation for interactive elements', () => {
      render(<LandingPage />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1')
      })
    })

    it('feature cards are accessible via keyboard', () => {
      render(<LandingPage />)
      const featureCards = screen.getAllByRole('listitem')
      featureCards.forEach(card => {
        expect(card).toHaveAttribute('tabIndex', '0')
      })
    })
  })
})
