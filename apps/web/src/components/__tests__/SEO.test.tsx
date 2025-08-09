import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HelmetProvider } from 'react-helmet-async'
import SEO, { createOrganizationSchema, createWebPageSchema, createSoftwareApplicationSchema } from '../SEO'

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }: { children: React.ReactNode }) => children,
  Helmet: ({ children }: { children: React.ReactNode }) => {
    // Extract and process helmet content for testing
    const processChildren = (children: any) => {
      if (Array.isArray(children)) {
        children.forEach(processChildren)
      } else if (children?.props) {
        const { tagName, ...props } = children.props
        if (tagName === 'title') {
          document.title = children.props.children
        } else if (tagName === 'meta') {
          const meta = document.createElement('meta')
          Object.entries(props).forEach(([key, value]) => {
            meta.setAttribute(key, value as string)
          })
          document.head.appendChild(meta)
        } else if (tagName === 'link') {
          const link = document.createElement('link')
          Object.entries(props).forEach(([key, value]) => {
            link.setAttribute(key, value as string)
          })
          document.head.appendChild(link)
        } else if (tagName === 'script') {
          const script = document.createElement('script')
          Object.entries(props).forEach(([key, value]) => {
            script.setAttribute(key, value as string)
          })
          if (children.props.children) {
            script.textContent = children.props.children
          }
          document.head.appendChild(script)
        }
      }
    }
    
    processChildren(children)
    return null
  }
}))

describe('SEO Component', () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = ''
    document.title = ''
  })

  afterEach(() => {
    // Clean up after each test
    document.head.innerHTML = ''
  })

  it('sets default title when no title is provided', () => {
    render(
      <HelmetProvider>
        <SEO />
      </HelmetProvider>
    )

    expect(document.title).toBe('VintuSure - AI-Powered Insurance Intelligence Platform')
  })

  it('sets custom title with VintuSure suffix', () => {
    render(
      <HelmetProvider>
        <SEO title="Dashboard" />
      </HelmetProvider>
    )

    expect(document.title).toBe('Dashboard | VintuSure')
  })

  it('sets meta description', () => {
    const customDescription = 'Custom description for testing'
    render(
      <HelmetProvider>
        <SEO description={customDescription} />
      </HelmetProvider>
    )

    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toBeTruthy()
    expect(metaDescription?.getAttribute('content')).toBe(customDescription)
  })

  it('sets meta keywords', () => {
    const customKeywords = 'test, keywords, seo'
    render(
      <HelmetProvider>
        <SEO keywords={customKeywords} />
      </HelmetProvider>
    )

    const metaKeywords = document.querySelector('meta[name="keywords"]')
    expect(metaKeywords).toBeTruthy()
    expect(metaKeywords?.getAttribute('content')).toBe(customKeywords)
  })

  it('sets Open Graph meta tags', () => {
    render(
      <HelmetProvider>
        <SEO 
          title="Test Page"
          description="Test description"
          type="article"
          url="/test"
        />
      </HelmetProvider>
    )

    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogType = document.querySelector('meta[property="og:type"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')

    expect(ogTitle?.getAttribute('content')).toBe('Test Page | VintuSure')
    expect(ogDescription?.getAttribute('content')).toBe('Test description')
    expect(ogType?.getAttribute('content')).toBe('article')
    expect(ogUrl?.getAttribute('content')).toBe('https://vintusure.web.app/test')
  })

  it('sets Twitter Card meta tags', () => {
    render(
      <HelmetProvider>
        <SEO 
          title="Test Page"
          description="Test description"
        />
      </HelmetProvider>
    )

    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')

    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
    expect(twitterTitle?.getAttribute('content')).toBe('Test Page | VintuSure')
    expect(twitterDescription?.getAttribute('content')).toBe('Test description')
  })

  it('sets canonical URL when provided', () => {
    render(
      <HelmetProvider>
        <SEO canonicalUrl="https://example.com/canonical" />
      </HelmetProvider>
    )

    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical?.getAttribute('href')).toBe('https://example.com/canonical')
  })

  it('sets robots meta tag based on noIndex and noFollow props', () => {
    const { rerender } = render(
      <HelmetProvider>
        <SEO noIndex={false} noFollow={false} />
      </HelmetProvider>
    )

    let robots = document.querySelector('meta[name="robots"]')
    expect(robots?.getAttribute('content')).toBe('index, follow')

    rerender(
      <HelmetProvider>
        <SEO noIndex={true} noFollow={true} />
      </HelmetProvider>
    )

    robots = document.querySelector('meta[name="robots"]')
    expect(robots?.getAttribute('content')).toBe('noindex, nofollow')
  })

  it('adds structured data when provided', () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Test Organization'
    }

    render(
      <HelmetProvider>
        <SEO structuredData={structuredData} />
      </HelmetProvider>
    )

    const ldJsonScript = document.querySelector('script[type="application/ld+json"]')
    expect(ldJsonScript).toBeTruthy()
    expect(ldJsonScript?.textContent).toBe(JSON.stringify(structuredData))
  })

  it('sets alternate language links', () => {
    const alternateLanguages = [
      { lang: 'es', url: 'https://example.com/es' },
      { lang: 'fr', url: 'https://example.com/fr' }
    ]

    render(
      <HelmetProvider>
        <SEO alternateLanguages={alternateLanguages} />
      </HelmetProvider>
    )

    const esLink = document.querySelector('link[hreflang="es"]')
    const frLink = document.querySelector('link[hreflang="fr"]')

    expect(esLink?.getAttribute('href')).toBe('https://example.com/es')
    expect(frLink?.getAttribute('href')).toBe('https://example.com/fr')
  })

  it('sets theme color for mobile browsers', () => {
    render(
      <HelmetProvider>
        <SEO />
      </HelmetProvider>
    )

    const themeColor = document.querySelector('meta[name="theme-color"]')
    expect(themeColor?.getAttribute('content')).toBe('#8B5CF6')
  })

  it('includes favicon and icon links', () => {
    render(
      <HelmetProvider>
        <SEO />
      </HelmetProvider>
    )

    const favicon = document.querySelector('link[rel="icon"][type="image/x-icon"]')
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]')
    const manifest = document.querySelector('link[rel="manifest"]')

    expect(favicon?.getAttribute('href')).toBe('/vintusure-logo.ico')
    expect(appleIcon?.getAttribute('href')).toBe('/images/apple-touch-icon.png')
    expect(manifest?.getAttribute('href')).toBe('/manifest.json')
  })
})

describe('SEO Schema Functions', () => {
  describe('createOrganizationSchema', () => {
    it('creates valid organization schema', () => {
      const schema = createOrganizationSchema()

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Organization')
      expect(schema.name).toBe('VintuSure')
      expect(schema.url).toBe('https://vintusure.web.app')
      expect(schema.description).toContain('AI-powered insurance')
    })

    it('includes contact and address information', () => {
      const schema = createOrganizationSchema()

      expect(schema.address).toBeDefined()
      expect(schema.address.addressCountry).toBe('ZM')
      expect(schema.contactPoint).toBeDefined()
      expect(schema.contactPoint.contactType).toBe('customer service')
    })
  })

  describe('createWebPageSchema', () => {
    it('creates valid webpage schema', () => {
      const schema = createWebPageSchema('Test Page', 'Test description', '/test')

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('WebPage')
      expect(schema.name).toBe('Test Page')
      expect(schema.description).toBe('Test description')
      expect(schema.url).toBe('/test')
    })

    it('includes website and publisher information', () => {
      const schema = createWebPageSchema('Test', 'Test', '/test')

      expect(schema.isPartOf).toBeDefined()
      expect(schema.isPartOf['@type']).toBe('WebSite')
      expect(schema.publisher).toBeDefined()
      expect(schema.publisher.name).toBe('VintuSure')
    })
  })

  describe('createSoftwareApplicationSchema', () => {
    it('creates valid software application schema', () => {
      const schema = createSoftwareApplicationSchema()

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('SoftwareApplication')
      expect(schema.name).toBe('VintuSure')
      expect(schema.applicationCategory).toBe('BusinessApplication')
    })

    it('includes feature list and provider information', () => {
      const schema = createSoftwareApplicationSchema()

      expect(schema.featureList).toBeDefined()
      expect(Array.isArray(schema.featureList)).toBe(true)
      expect(schema.featureList).toContain('AI-powered document processing')
      expect(schema.provider).toBeDefined()
      expect(schema.provider.name).toBe('VintuSure')
    })

    it('includes offer information', () => {
      const schema = createSoftwareApplicationSchema()

      expect(schema.offers).toBeDefined()
      expect(schema.offers['@type']).toBe('Offer')
      expect(schema.offers.category).toBe('SaaS')
    })
  })
})
