import { useEffect } from 'react';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  author?: string;
  robots?: string;
  canonical?: string;
  structuredData?: object;
}

const defaultSEO: SEOData = {
  title: 'Trip Vesta - India\'s Leading Freight Lending Platform',
  description: 'Join Trip Vesta, India\'s premier freight lending platform. Connect lenders with verified logistics companies for secure, profitable freight investments. Track live trips, manage investments, and earn competitive returns.',
  keywords: 'freight lending, logistics investment, India transport, supply chain finance, freight funding, trip investment, logistics lending, transport finance, cargo investment, freight financing',
  ogTitle: 'Trip Vesta - India\'s Leading Freight Lending Platform',
  ogDescription: 'Join Trip Vesta, India\'s premier freight lending platform. Connect lenders with verified logistics companies for secure, profitable freight investments.',
  ogImage: '/images/trip-vesta-og-image.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@TripVesta',
  author: 'Trip Vesta Team',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
};

export const useSEO = (seoData?: SEOData) => {
  useEffect(() => {
    const finalSEO = { ...defaultSEO, ...seoData };

    // Update title
    if (finalSEO.title) {
      document.title = finalSEO.title;
    }

    // Update or create meta tags
    updateMetaTag('description', finalSEO.description);
    updateMetaTag('keywords', finalSEO.keywords);
    updateMetaTag('author', finalSEO.author);
    updateMetaTag('robots', finalSEO.robots);

    // Open Graph tags
    updateMetaTag('og:title', finalSEO.ogTitle, 'property');
    updateMetaTag('og:description', finalSEO.ogDescription, 'property');
    updateMetaTag('og:image', finalSEO.ogImage, 'property');
    updateMetaTag('og:url', finalSEO.ogUrl, 'property');
    updateMetaTag('og:type', finalSEO.ogType, 'property');
    updateMetaTag('og:site_name', 'Trip Vesta', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', finalSEO.twitterCard);
    updateMetaTag('twitter:title', finalSEO.twitterTitle || finalSEO.ogTitle);
    updateMetaTag('twitter:description', finalSEO.twitterDescription || finalSEO.ogDescription);
    updateMetaTag('twitter:image', finalSEO.twitterImage || finalSEO.ogImage);
    updateMetaTag('twitter:site', finalSEO.twitterSite);

    // Canonical URL
    if (finalSEO.canonical) {
      updateLinkTag('canonical', finalSEO.canonical);
    }

    // Structured Data
    if (finalSEO.structuredData) {
      updateStructuredData(finalSEO.structuredData);
    }
  }, [seoData]);
};

const updateMetaTag = (name: string, content?: string, attributeName: string = 'name') => {
  if (!content) return;

  let meta = document.querySelector(`meta[${attributeName}="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attributeName, name);
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
};

const updateLinkTag = (rel: string, href: string) => {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
};

const updateStructuredData = (data: object) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// Predefined SEO data for different pages
export const pageSEO = {
  dashboard: {
    title: 'Dashboard - Trip Vesta | Freight Lending Overview',
    description: 'Monitor your freight lending portfolio on Trip Vesta dashboard. View active investments, track returns, and analyze performance metrics across India\'s logistics network.',
    keywords: 'freight dashboard, lending portfolio, investment tracking, logistics analytics, Trip Vesta dashboard',
    ogTitle: 'Trip Vesta Dashboard - Monitor Your Freight Investments',
    ogDescription: 'Track your freight lending portfolio with real-time insights and performance metrics.',
  },

  trips: {
    title: 'Live Trips - Trip Vesta | Active Freight Investments',
    description: 'Browse and invest in live freight trips across India. View real-time trip status, freight charges, routes, and investment opportunities with verified logistics companies.',
    keywords: 'live trips, freight investment, logistics tracking, trip investment, freight lending opportunities',
    ogTitle: 'Live Freight Trips - Investment Opportunities | Trip Vesta',
    ogDescription: 'Discover profitable freight investment opportunities with live trip tracking and verified logistics partners.',
  },

  wallet: {
    title: 'Wallet - Trip Vesta | Manage Your Funds',
    description: 'Manage your Trip Vesta wallet funds. View balance, transaction history, deposits, withdrawals, and fund your freight lending investments securely.',
    keywords: 'wallet management, fund management, investment wallet, freight lending funds, Trip Vesta wallet',
    ogTitle: 'Trip Vesta Wallet - Secure Fund Management',
    ogDescription: 'Securely manage your investment funds with Trip Vesta\'s integrated wallet system.',
  },

  admin: {
    title: 'Admin Panel - Trip Vesta | Lender Management',
    description: 'Trip Vesta admin panel for managing lenders, trip assignments, profit calculations, and platform operations. Comprehensive tools for platform administration.',
    keywords: 'admin panel, lender management, trip assignment, profit calculation, platform administration',
    ogTitle: 'Trip Vesta Admin - Platform Management Tools',
    ogDescription: 'Comprehensive admin tools for managing the Trip Vesta freight lending platform.',
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  },

  settings: {
    title: 'Settings - Trip Vesta | Account Configuration',
    description: 'Configure your Trip Vesta account settings. Update profile information, preferences, security settings, and notification preferences.',
    keywords: 'account settings, profile configuration, security settings, Trip Vesta preferences',
    ogTitle: 'Trip Vesta Settings - Account Configuration',
    ogDescription: 'Customize your Trip Vesta experience with personalized account settings.',
  },
};