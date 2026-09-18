import React from 'react';
import { personalInfo, bookData, venturesData } from '@/data/portfolioData';

export default function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://mrmalek.com/#person',
        name: personalInfo.name,
        alternateName: personalInfo.brandName,
        jobTitle: 'Technical Product Leader',
        telephone: personalInfo.phone,
        email: personalInfo.email,
        url: 'https://mrmalek.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Ottawa',
          addressRegion: 'Ontario',
          addressCountry: 'CA',
        },
        alumniOf: 'University Program',
        knowsAbout: [
          'Technical Product Management',
          'Digital Product Delivery',
          'Agile & Scrum',
          'SaaS & E-commerce Platforms',
          'Systems Integration',
          'AI Product Exploration',
        ],
        hasOccupation: {
          '@type': 'Occupation',
          name: 'Technical Product Leader',
          occupationLocation: {
            '@type': 'City',
            name: 'Ottawa',
          },
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://mrmalek.com/#website',
        url: 'https://mrmalek.com',
        name: 'Malek Hussein | Technical Product Leader & Digital Builder',
        description:
          'Portfolio of Malek Hussein — Technical Product Leader based in Ottawa, Canada. Building digital products across SaaS, e-commerce, fintech, and enterprise platforms.',
        publisher: {
          '@id': 'https://mrmalek.com/#person',
        },
      },
      {
        '@type': 'Book',
        '@id': 'https://mrmalek.com/#book',
        name: bookData.title,
        headline: bookData.subtitle,
        author: {
          '@id': 'https://mrmalek.com/#person',
        },
        description: bookData.description,
        genre: 'Non-Fiction, Self-Improvement, Systems Engineering, High Performance',
      },
      ...venturesData.map((venture) => ({
        '@type': 'Organization',
        '@id': `https://mrmalek.com/#${venture.id}`,
        name: venture.name,
        url: venture.url,
        founder: {
          '@id': 'https://mrmalek.com/#person',
        },
        description: venture.description,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
