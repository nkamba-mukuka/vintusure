import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const defaultSEO = {
  title: 'VintuSure - AI-Powered Insurance Intelligence Platform',
  description: 'VintuSure is an AI-powered platform that provides advanced RAG (Retrieval-Augmented Generation) services to insurance companies, enhancing knowledge management and customer support capabilities.',
  keywords: 'AI insurance, insurance technology, RAG, artificial intelligence, customer support, knowledge management, insurance platform, insurtech, Zambia insurance',
  image: '/images/vintusure-logo-192.png',
  url: 'https://vintusure.web.app',
};

// Fallback SEO component that uses vanilla DOM manipulation
export default function SEOFallback({
  title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  image = defaultSEO.image,
  url,
  type = 'website',
  structuredData,
}: SEOProps) {
  useEffect(() => {
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

    // Update document title
    document.title = fullTitle;

    // Helper function to update meta tag
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1, shrink-to-fit=no');

    // Update Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImage, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:site_name', 'VintuSure', true);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImage);

    // Add structured data if provided
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      
      scriptTag.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // We don't remove meta tags on cleanup to avoid flickering
      // but in a real app, you might want to implement cleanup
    };
  }, [title, description, keywords, image, url, type, structuredData]);

  return null; // This component doesn't render anything
}
