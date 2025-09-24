// Structured Data (JSON-LD) utilities for SEO

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Trip Vesta",
  "alternateName": "TripVesta",
  "description": "India's leading freight lending platform connecting lenders with verified logistics companies for secure freight investments.",
  "url": "https://tripvesta.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://tripvesta.com/images/logo.png",
    "width": 200,
    "height": 60
  },
  "sameAs": [
    "https://www.linkedin.com/company/tripvesta",
    "https://twitter.com/TripVesta"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Mumbai",
    "addressRegion": "Maharashtra",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXXXXXXXXX",
    "contactType": "customer service",
    "availableLanguage": ["English", "Hindi"]
  },
  "foundingDate": "2024",
  "industry": "Financial Services",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "50-100"
  }
});

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Trip Vesta",
  "url": "https://tripvesta.com",
  "description": "India's premier freight lending platform for secure logistics investments",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://tripvesta.com/trips?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Trip Vesta"
  }
});

export const generateWebApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Trip Vesta Platform",
  "description": "Freight lending and logistics investment platform",
  "url": "https://tripvesta.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "description": "Free platform access for verified lenders"
  },
  "featureList": [
    "Live trip tracking",
    "Freight investment management",
    "Portfolio analytics",
    "Secure fund management",
    "Real-time notifications"
  ]
});

export const generateServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Freight Lending Services",
  "description": "Professional freight lending and logistics investment services connecting lenders with verified transport companies across India",
  "provider": {
    "@type": "Organization",
    "name": "Trip Vesta"
  },
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "serviceType": "Financial Services",
  "category": "Investment Services",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Freight Investment Opportunities",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Short-term Freight Investment",
          "description": "3-7 day freight trip investments"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Long-haul Freight Investment",
          "description": "7-15 day long-distance freight investments"
        }
      }
    ]
  }
});

export const generateBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});

export const generateTripSchema = (trip: any) => ({
  "@context": "https://schema.org",
  "@type": "Trip",
  "name": `Trip ${trip.tripNumber}`,
  "description": `Freight trip from ${trip.pickup?.city} to ${trip.delivery?.city}`,
  "itinerary": [
    {
      "@type": "Place",
      "name": trip.pickup?.city,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": trip.pickup?.city,
        "addressRegion": trip.pickup?.state,
        "postalCode": trip.pickup?.pin?.toString(),
        "addressCountry": "IN"
      }
    },
    {
      "@type": "Place",
      "name": trip.delivery?.city,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": trip.delivery?.city,
        "addressRegion": trip.delivery?.state,
        "postalCode": trip.delivery?.pin?.toString(),
        "addressCountry": "IN"
      }
    }
  ],
  "offers": {
    "@type": "Offer",
    "price": trip.freightCharges?.toString(),
    "priceCurrency": "INR",
    "description": "Freight investment opportunity"
  },
  "provider": {
    "@type": "Organization",
    "name": trip.sender?.company || "Logistics Company"
  }
});

export const generateFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Trip Vesta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trip Vesta is India's leading freight lending platform that connects lenders with verified logistics companies for secure freight investments. Lenders can invest in freight trips and earn returns based on successful trip completion."
      }
    },
    {
      "@type": "Question",
      "name": "How does freight lending work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Freight lending involves providing funds to logistics companies for their freight operations. Lenders invest in specific trips and earn returns based on the freight charges and successful trip completion. All trips are tracked in real-time for transparency."
      }
    },
    {
      "@type": "Question",
      "name": "Is Trip Vesta safe for investments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Trip Vesta works only with verified logistics companies and provides real-time trip tracking, transparent reporting, and secure fund management. All investments are backed by freight contracts and monitored throughout the trip duration."
      }
    },
    {
      "@type": "Question",
      "name": "What is the minimum investment amount?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The minimum investment amount varies by trip and freight charges. Most trips start from ₹10,000 minimum investment. You can view specific investment amounts for each available trip on the platform."
      }
    },
    {
      "@type": "Question",
      "name": "How long do freight investments take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Freight investment durations typically range from 3-15 days depending on the trip distance and route. Short-haul trips complete in 3-7 days while long-haul interstate trips may take 7-15 days."
      }
    }
  ]
});

export const generateDashboardSchema = (stats: any) => ({
  "@context": "https://schema.org",
  "@type": "Dashboard",
  "name": "Trip Vesta Lender Dashboard",
  "description": "Comprehensive freight lending portfolio dashboard",
  "about": {
    "@type": "Thing",
    "name": "Freight Investment Portfolio"
  },
  "mainEntity": {
    "@type": "DataFeed",
    "name": "Investment Metrics",
    "dataFeedElement": [
      {
        "@type": "DataFeedItem",
        "name": "Total Lenders",
        "value": stats?.totalLenders || "28"
      },
      {
        "@type": "DataFeedItem",
        "name": "Active Trips",
        "value": stats?.activeTrips || "23"
      },
      {
        "@type": "DataFeedItem",
        "name": "Total Lender Profit",
        "value": stats?.totalProfit || "₹18,456,230"
      }
    ]
  }
});