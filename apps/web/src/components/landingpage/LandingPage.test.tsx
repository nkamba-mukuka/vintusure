import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import LandingPage from './LandingPage'

// Mock the assets
vi.mock('@/assets/vinture.jpeg', () => ({
  default: 'mocked-vinture-image'
}))
vi.mock('@/assets/vintusure-logo.ico', () => ({
  default: 'mocked-logo'
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('LandingPage', () => {
  it('renders the main heading', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Drive with Confidence')).toBeInTheDocument()
  })

  it('renders the VintuSure brand name in navigation', () => {
    renderWithProviders(<LandingPage />)
    const navBrand = screen.getByText('VintuSure', { selector: 'nav span' })
    expect(navBrand).toBeInTheDocument()
  })

  it('renders the hero description', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText(/Comprehensive insurance solutions for vintage and classic cars/)).toBeInTheDocument()
  })

  it('renders sign in and sign up buttons for unauthenticated users', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('renders the features section', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Why Choose VintuSure?')).toBeInTheDocument()
    expect(screen.getByText('Comprehensive Coverage')).toBeInTheDocument()
    expect(screen.getByText('Vintage Expertise')).toBeInTheDocument()
    expect(screen.getByText('Expert Support')).toBeInTheDocument()
    expect(screen.getByText('Competitive Rates')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('© 2024 VintuSure. All rights reserved.')).toBeInTheDocument()
  })

  it('renders the VintuSure logo images', () => {
    renderWithProviders(<LandingPage />)
    const logos = screen.getAllByAltText('VintuSure Logo')
    expect(logos).toHaveLength(2) // One in nav, one in footer
  })
}) 