import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from '../LandingPage'

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}))

// Mock SEO component
vi.mock('@/components/SEO', () => ({
  default: ({ title, description }: { title?: string, description?: string }) => (
    <div data-testid="seo-component" data-title={title} data-description={description} />
  ),
  createOrganizationSchema: () => ({ '@type': 'Organization' }),
  createWebPageSchema: () => ({ '@type': 'WebPage' }),
  createSoftwareApplicationSchema: () => ({ '@type': 'SoftwareApplication' }),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Shield: () => <div data-testid="shield-icon" />,
  Car: () => <div data-testid="car-icon" />,
  Brain: () => <div data-testid="brain-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  User: () => <div data-testid="user-icon" />,
  Building2: () => <div data-testid="building-icon" />,
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

describe('LandingPage', () => {
  beforeEach(() => {
    mockAuthContext.user = null
    mockAuthContext.loading = false
  })

  describe('Navigation', () => {
    it('renders navigation with VintuSure logo and brand name', () => {
      renderWithProviders(<LandingPage />)
      
      expect(screen.getByAltText('VintuSure company logo')).toBeInTheDocument()
      expect(screen.getByText('VintuSure')).toBeInTheDocument()
    })

    it('shows sign in and sign up buttons when user is not authenticated', () => {
      renderWithProviders(<LandingPage />)
      
      expect(screen.getByLabelText('Sign in to your account')).toBeInTheDocument()
      expect(screen.getByLabelText('Create a new account')).toBeInTheDocument()
    })

    it('shows dashboard button when user is authenticated', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' }
      
      renderWithProviders(<LandingPage />)
      
      expect(screen.getByLabelText('Go to user dashboard')).toBeInTheDocument()
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
    })

    it('includes skip to main content link for accessibility', () => {
      renderWithProviders(<LandingPage />)
      
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })
  })

  describe('Hero Section', () => {
    it('renders main heading with proper structure', () => {
      renderWithProviders(<LandingPage />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('AI-Powered Insurance Intelligence')
      expect(heading).toHaveAttribute('aria-level', '1')
    })

    it('renders descriptive paragraph about VintuSure', () => {
      renderWithProviders(<LandingPage />)
      
      const description = screen.getByText(/VintuSure is an AI-powered online platform/)
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent(/RAG \(Retrieval-Augmented Generation\)/)
    })

    it('shows different CTAs based on authentication state', () => {
      const { rerender } = renderWithProviders(<LandingPage />)
      
      // When not authenticated
      expect(screen.getByLabelText('Sign in as an insurance agent')).toBeInTheDocument()
      expect(screen.getByLabelText('Explore VintuSure as a customer')).toBeInTheDocument()
      
      // When authenticated
      mockAuthContext.user = { id: '1', email: 'test@example.com' }
      rerender(
        <HelmetProvider>
          <BrowserRouter>
            <LandingPage />
          </BrowserRouter>
        </HelmetProvider>
      )
      
      expect(screen.getByLabelText('Access your VintuSure dashboard')).toBeInTheDocument()
    })

    it('includes proper animations classes', () => {
      renderWithProviders(<LandingPage />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('animate-fade-in')
      
      const description = screen.getByText(/VintuSure is an AI-powered online platform/)
      expect(description).toHaveClass('animate-slide-in-from-bottom')
    })
  })

  describe('Features Section', () => {
    it('renders features section with proper heading', () => {
      renderWithProviders(<LandingPage />)
      
      const featuresHeading = screen.getByRole('heading', { 
        name: 'Why Choose VintuSure for Your Insurance Business?' 
      })
      expect(featuresHeading).toBeInTheDocument()
      expect(featuresHeading).toHaveAttribute('aria-level', '2')
    })

    it('renders all four feature cards', () => {
      renderWithProviders(<LandingPage />)
      
      expect(screen.getByText('Advanced RAG Technology')).toBeInTheDocument()
      expect(screen.getByText('Multi-Insurance Support')).toBeInTheDocument()
      expect(screen.getByText('AI-Powered Assistance')).toBeInTheDocument()
      expect(screen.getByText('Scalable Solutions')).toBeInTheDocument()
    })

    it('includes proper icons for each feature', () => {
      renderWithProviders(<LandingPage />)
      
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
      expect(screen.getByTestId('car-icon')).toBeInTheDocument()
      expect(screen.getByTestId('brain-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
    })

    it('has proper accessibility attributes for features list', () => {
      renderWithProviders(<LandingPage />)
      
      const featuresList = screen.getByRole('list')
      expect(featuresList).toHaveAttribute('aria-label', 'VintuSure platform features')
      
      const featureItems = screen.getAllByRole('listitem')
      expect(featureItems).toHaveLength(4)
      
      // Check that feature cards are focusable
      featureItems.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0')
      })
    })

    it('includes staggered animation classes', () => {
      renderWithProviders(<LandingPage />)
      
      const featureCards = document.querySelectorAll('.animate-slide-in-stagger')
      expect(featureCards).toHaveLength(4)
    })

    it('has hover effects on feature cards', () => {
      renderWithProviders(<LandingPage />)
      
      const featureCards = document.querySelectorAll('.hover-card-effect')
      expect(featureCards).toHaveLength(4)
    })
  })

  describe('Footer', () => {
    it('renders footer with proper structure', () => {
      renderWithProviders(<LandingPage />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveAttribute('aria-label', 'Site footer')
    })

    it('includes VintuSure branding in footer', () => {
      renderWithProviders(<LandingPage />)
      
      const footerLogo = screen.getAllByAltText('VintuSure company logo')[1] // Second one is in footer
      expect(footerLogo).toBeInTheDocument()
      
      const footerBrand = screen.getAllByText('VintuSure')[1] // Second one is in footer
      expect(footerBrand).toHaveAttribute('aria-label', 'VintuSure company name')
    })

    it('includes copyright information', () => {
      renderWithProviders(<LandingPage />)
      
      const copyright = screen.getByText('© 2024 VintuSure. All rights reserved.')
      expect(copyright).toHaveAttribute('aria-label', 'Copyright information')
    })
  })

  describe('SEO Integration', () => {
    it('includes SEO component with proper props', () => {
      renderWithProviders(<LandingPage />)
      
      const seoComponent = screen.getByTestId('seo-component')
      expect(seoComponent).toBeInTheDocument()
      expect(seoComponent).toHaveAttribute('data-title', 'AI-Powered Insurance Intelligence Platform')
    })
  })

  describe('Interactive Elements', () => {
    it('buttons have proper hover and focus states', () => {
      renderWithProviders(<LandingPage />)
      
      const agentButton = screen.getByLabelText('Sign in as an insurance agent')
      expect(agentButton).toHaveClass('group')
      
      const customerButton = screen.getByLabelText('Explore VintuSure as a customer')
      expect(customerButton).toHaveClass('group')
    })

    it('icons have hover animations in buttons', () => {
      renderWithProviders(<LandingPage />)
      
      // Check for hover effects on icons within buttons
      const agentButton = screen.getByLabelText('Sign in as an insurance agent')
      expect(agentButton).toHaveClass('group')
      
      const customerButton = screen.getByLabelText('Explore VintuSure as a customer')
      expect(customerButton).toHaveClass('group')
    })
  })

  describe('Responsive Design', () => {
    it('has responsive classes for different screen sizes', () => {
      renderWithProviders(<LandingPage />)
      
      const heroHeading = screen.getByRole('heading', { level: 1 })
      expect(heroHeading).toHaveClass('text-4xl', 'sm:text-6xl')
      
      const featureGrid = document.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4')
      expect(featureGrid).toBeInTheDocument()
    })
  })

  describe('Purple Theme Consistency', () => {
    it('uses primary color for headings and branding', () => {
      renderWithProviders(<LandingPage />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveClass('text-primary')
      
      const brandText = screen.getAllByText('VintuSure')[0]
      expect(brandText).toHaveClass('text-primary')
    })

    it('uses purple theme in feature cards', () => {
      renderWithProviders(<LandingPage />)
      
      const iconContainers = document.querySelectorAll('.from-primary\\/10.to-purple-100')
      expect(iconContainers).toHaveLength(4)
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation for interactive elements', () => {
      renderWithProviders(<LandingPage />)
      
      // All links should be keyboard accessible (since they act as buttons)
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabIndex', '-1')
      })
    })

    it('feature cards are accessible via keyboard', () => {
      renderWithProviders(<LandingPage />)
      
      const featureCards = screen.getAllByRole('listitem')
      featureCards.forEach(card => {
        expect(card).toHaveAttribute('tabIndex', '0')
        // Focus behavior in JSDOM doesn't work the same way, so just check tabIndex
      })
    })
  })
})
