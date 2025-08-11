import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonicalUrl?: string;
  alternateLanguages?: Array<{ lang: string; url: string }>;
  structuredData?: object;
}

const defaultSEO = {
  title: 'VintuSure - AI-Powered Insurance Intelligence Platform',
  description: 'VintuSure is an AI-powered platform that provides advanced RAG (Retrieval-Augmented Generation) services to insurance companies, enhancing knowledge management and customer support capabilities.',
  keywords: 'AI insurance, insurance technology, RAG, artificial intelligence, customer support, knowledge management, insurance platform, insurtech, Zambia insurance',
  image: '/images/vintusure-logo-192.png',
  url: 'https://vintusure.web.app',
  type: 'website' as const,
  author: 'VintuSure Team',
};

export default function SEO({
  title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  image = defaultSEO.image,
  url,
  type = 'website',
  author = defaultSEO.author,
  publishedTime,
  modifiedTime,
  noIndex = false,
  noFollow = false,
  canonicalUrl,
  alternateLanguages = [],
  structuredData,
}: SEOProps) {
  // Build the full title
  const fullTitle = title 
    ? `${title} | VintuSure` 
    : defaultSEO.title;

  // Build the full URL
  const fullUrl = url 
    ? `${defaultSEO.url}${url}` 
    : defaultSEO.url;

  // Build the full image URL
  const fullImage = image?.startsWith('http') 
    ? image 
    : `${defaultSEO.url}${image}`;

  // Robots meta content
  const robots = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Language Alternates */}
      {alternateLanguages.map(({ lang, url: altUrl }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={altUrl} />
      ))}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="VintuSure" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@VintuSure" />
      <meta name="twitter:creator" content="@VintuSure" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional Meta Tags for Better SEO */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      <meta name="application-name" content="VintuSure" />
      <meta name="apple-mobile-web-app-title" content="VintuSure" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/images/vintusure-icon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/images/vintusure-logo-192.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
}

// Predefined structured data schemas
export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VintuSure",
  "description": "AI-powered insurance intelligence platform providing advanced RAG services to insurance companies",
  "url": "https://vintusure.web.app",
  "logo": "https://vintusure.web.app/images/vintusure-logo.png",
  "foundingDate": "2024",
  "industry": "Insurance Technology",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ZM",
    "addressLocality": "Lusaka"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+260-XXX-XXXX",
    "contactType": "customer service",
    "email": "support@vintusure.com"
  },
  "sameAs": [
    "https://www.linkedin.com/company/vintusure",
    "https://twitter.com/vintusure"
  ]
});

export const createWebPageSchema = (pageTitle: string, pageDescription: string, pageUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": pageTitle,
  "description": pageDescription,
  "url": pageUrl,
  "isPartOf": {
    "@type": "WebSite",
    "name": "VintuSure",
    "url": "https://vintusure.web.app"
  },
  "publisher": {
    "@type": "Organization",
    "name": "VintuSure",
    "logo": {
      "@type": "ImageObject",
      "url": "https://vintusure.web.app/images/vintusure-logo-192.png"
    }
  }
});

export const createSoftwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "VintuSure",
  "description": "AI-powered insurance intelligence platform with advanced RAG capabilities",
  "url": "https://vintusure.web.app",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "category": "SaaS",
    "priceRange": "Contact for pricing"
  },
  "provider": {
    "@type": "Organization",
    "name": "VintuSure"
  },
  "featureList": [
    "AI-powered document processing",
    "Retrieval-Augmented Generation (RAG)",
    "Insurance knowledge management",
    "Customer support automation",
    "Multi-insurance support"
  ]
});
