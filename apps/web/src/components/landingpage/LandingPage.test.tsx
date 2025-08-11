import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import LandingPage from './LandingPage'

// Mock the assets
vi.mock('@/assets/vintusure-logo.ico', () => ({
  default: 'mocked-logo'
}))

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />)
    expect(screen.getByText('AI-Powered Insurance Intelligence')).toBeInTheDocument()
  })

  it('renders the VintuSure brand name in navigation', () => {
    render(<LandingPage />)
    const navBrand = screen.getByText('VintuSure', { selector: 'nav span' })
    expect(navBrand).toBeInTheDocument()
  })

  it('renders the hero description', () => {
    render(<LandingPage />)
    expect(screen.getByText(/VintuSure is an AI-powered online platform/)).toBeInTheDocument()
  })

  it('renders sign in and sign up buttons for unauthenticated users', () => {
    render(<LandingPage />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('renders the features section', () => {
    render(<LandingPage />)
    expect(screen.getByText('Why Choose VintuSure for Your Insurance Business?')).toBeInTheDocument()
    expect(screen.getByText('Advanced RAG Technology')).toBeInTheDocument()
    expect(screen.getByText('Multi-Insurance Support')).toBeInTheDocument()
    expect(screen.getByText('AI-Powered Assistance')).toBeInTheDocument()
    expect(screen.getByText('Scalable Solutions')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<LandingPage />)
    expect(screen.getByText('© 2024 VintuSure. All rights reserved.')).toBeInTheDocument()
  })

  it('renders the VintuSure logo images', () => {
    render(<LandingPage />)
    const logos = screen.getAllByAltText('VintuSure company logo')
    expect(logos).toHaveLength(2) // One in nav, one in footer
  })
}) 