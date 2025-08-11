import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import SEO, { createOrganizationSchema, createWebPageSchema, createSoftwareApplicationSchema } from '../SEO'

describe('SEO Component', () => {
  describe('Basic Meta Tags', () => {
    it('sets default title when no title is provided', () => {
      render(<SEO />)
      expect(document.title).toBe('VintuSure - AI-Powered Insurance Intelligence Platform')
    })

    it('sets custom title with VintuSure suffix', () => {
      render(<SEO title="Dashboard" />)
      expect(document.title).toBe('Dashboard | VintuSure')
    })

    it('sets meta description', () => {
      const customDescription = 'Custom description for testing'
      render(<SEO description={customDescription} />)
      
      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription).toBeTruthy()
      expect(metaDescription?.getAttribute('content')).toBe(customDescription)
    })

    it('sets meta keywords', () => {
      const customKeywords = 'test, keywords, seo'
      render(<SEO keywords={customKeywords} />)
      
      const metaKeywords = document.querySelector('meta[name="keywords"]')
      expect(metaKeywords).toBeTruthy()
      expect(metaKeywords?.getAttribute('content')).toBe(customKeywords)
    })
  })

  describe('Open Graph Meta Tags', () => {
    it('sets Open Graph meta tags', () => {
      render(
        <SEO
          title="Test Page"
          description="Test description"
          type="article"
          url="/test-page"
        />
      )

      const ogTitle = document.querySelector('meta[property="og:title"]')
      const ogDescription = document.querySelector('meta[property="og:description"]')
      const ogType = document.querySelector('meta[property="og:type"]')
      const ogUrl = document.querySelector('meta[property="og:url"]')

      expect(ogTitle?.getAttribute('content')).toBe('Test Page | VintuSure')
      expect(ogDescription?.getAttribute('content')).toBe('Test description')
      expect(ogType?.getAttribute('content')).toBe('article')
      expect(ogUrl?.getAttribute('content')).toBe('https://vintusure.web.app/test-page')
    })
  })

  describe('Twitter Card Meta Tags', () => {
    it('sets Twitter Card meta tags', () => {
      render(
        <SEO
          title="Test Page"
          description="Test description"
        />
      )

      const twitterCard = document.querySelector('meta[name="twitter:card"]')
      const twitterTitle = document.querySelector('meta[name="twitter:title"]')
      const twitterDescription = document.querySelector('meta[name="twitter:description"]')

      expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
      expect(twitterTitle?.getAttribute('content')).toBe('Test Page | VintuSure')
      expect(twitterDescription?.getAttribute('content')).toBe('Test description')
    })
  })

  describe('Canonical URL', () => {
    it('sets canonical URL when provided', () => {
      render(<SEO canonicalUrl="https://example.com/canonical" />)
      
      const canonical = document.querySelector('link[rel="canonical"]')
      expect(canonical?.getAttribute('href')).toBe('https://example.com/canonical')
    })
  })

  describe('Robots Meta Tag', () => {
    it('sets robots meta tag based on noIndex and noFollow props', () => {
      const { rerender } = render(<SEO />)
      
      let robots = document.querySelector('meta[name="robots"]')
      expect(robots?.getAttribute('content')).toBe('index, follow')

      rerender(<SEO noIndex noFollow />)
      
      robots = document.querySelector('meta[name="robots"]')
      expect(robots?.getAttribute('content')).toBe('noindex, nofollow')
    })
  })

  describe('Structured Data', () => {
    it('adds structured data when provided', () => {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Organization'
      }

      render(<SEO structuredData={structuredData} />)
      
      const ldJsonScript = document.querySelector('script[type="application/ld+json"]')
      expect(ldJsonScript).toBeTruthy()
      expect(ldJsonScript?.textContent).toBe(JSON.stringify(structuredData))
    })
  })

  describe('Language Alternates', () => {
    it('sets alternate language links', () => {
      const alternateLanguages = [
        { lang: 'es', url: 'https://example.com/es' },
        { lang: 'fr', url: 'https://example.com/fr' }
      ]

      render(<SEO alternateLanguages={alternateLanguages} />)
      
      const esLink = document.querySelector('link[hreflang="es"]')
      const frLink = document.querySelector('link[hreflang="fr"]')

      expect(esLink?.getAttribute('href')).toBe('https://example.com/es')
      expect(frLink?.getAttribute('href')).toBe('https://example.com/fr')
    })
  })

  describe('Theme Color', () => {
    it('sets theme color for mobile browsers', () => {
      render(<SEO />)
      
      const themeColor = document.querySelector('meta[name="theme-color"]')
      expect(themeColor?.getAttribute('content')).toBe('#8B5CF6')
    })
  })

  describe('Favicon and Icons', () => {
    it('includes favicon and icon links', () => {
      render(<SEO />)
      
      const favicon = document.querySelector('link[rel="icon"][type="image/x-icon"]')
      const appleIcon = document.querySelector('link[rel="apple-touch-icon"]')
      const manifest = document.querySelector('link[rel="manifest"]')

      expect(favicon?.getAttribute('href')).toBe('/images/vintusure-icon.ico')
      expect(appleIcon?.getAttribute('href')).toBe('/images/apple-touch-icon.png')
      expect(manifest?.getAttribute('href')).toBe('/manifest.json')
    })
  })
})

describe('SEO Schema Functions', () => {
  it('creates organization schema', () => {
    const schema = createOrganizationSchema()
    expect(schema['@type']).toBe('Organization')
    expect(schema.name).toBe('VintuSure')
  })

  it('creates web page schema', () => {
    const schema = createWebPageSchema('Test Page', 'Test Description', 'https://example.com/test')
    expect(schema['@type']).toBe('WebPage')
    expect(schema.name).toBe('Test Page')
    expect(schema.description).toBe('Test Description')
    expect(schema.url).toBe('https://example.com/test')
  })

  it('creates software application schema', () => {
    const schema = createSoftwareApplicationSchema()
    expect(schema['@type']).toBe('SoftwareApplication')
    expect(schema.name).toBe('VintuSure')
    expect(schema.applicationCategory).toBe('BusinessApplication')
  })

  it('includes proper schema context', () => {
    const orgSchema = createOrganizationSchema()
    const webSchema = createWebPageSchema('Test', 'Test', 'https://test.com')
    const appSchema = createSoftwareApplicationSchema()

    expect(orgSchema['@context']).toBe('https://schema.org')
    expect(webSchema['@context']).toBe('https://schema.org')
    expect(appSchema['@context']).toBe('https://schema.org')
  })

  it('includes proper URLs in schemas', () => {
    const orgSchema = createOrganizationSchema()
    const webSchema = createWebPageSchema('Test', 'Test', 'https://test.com')
    const appSchema = createSoftwareApplicationSchema()

    expect(orgSchema.url).toBe('https://vintusure.web.app')
    expect(webSchema.url).toBe('https://test.com')
    expect(appSchema.url).toBe('https://vintusure.web.app')
  })

  it('includes proper descriptions in schemas', () => {
    const orgSchema = createOrganizationSchema()
    const webSchema = createWebPageSchema('Test', 'Test Description', 'https://test.com')
    const appSchema = createSoftwareApplicationSchema()

    expect(orgSchema.description).toContain('AI-powered')
    expect(webSchema.description).toBe('Test Description')
    expect(appSchema.description).toContain('AI-powered')
  })

  it('includes proper feature lists in software application schema', () => {
    const appSchema = createSoftwareApplicationSchema()
    expect(Array.isArray(appSchema.featureList)).toBe(true)
    expect(appSchema.featureList).toContain('AI-powered document processing')
    expect(appSchema.featureList).toContain('Retrieval-Augmented Generation (RAG)')
  })
})
