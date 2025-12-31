import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n';
import Navigation from '@/components/Navigation';
import Loader from '@/components/Loader';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://smartfarming.example.com'),
  title: {
    default: 'AGRO - AI-Powered Agricultural Guidance',
    template: '%s | AGRO',
  },
  description: 'AI-powered agricultural guidance platform for modern farmers. Get real-time insights, disease detection, irrigation optimization, and more.',
  keywords: ['smart farming', 'agriculture', 'AI assistant', 'crop management', 'precision farming', 'sustainable agriculture'],
  authors: [{ name: 'Smart Farming Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://smartfarming.example.com',
    siteName: 'AGRO',
    title: 'AGRO - AI-Powered Agricultural Guidance',
    description: 'Get real-time farming insights, disease detection, and optimization tools',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AGRO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGRO',
    description: 'AI-powered agricultural guidance platform',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AGRO',
  description: 'AI-powered agricultural guidance platform',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  provider: {
    '@type': 'Organization',
    name: 'Smart Farming Team',
    url: 'https://smartfarming.example.com',
  },
};



import ChatWidgetWithLocale from '@/components/ChatWidgetWithLocale';
import { AuthProvider } from '@/contexts/AuthContext';

function ClientProviders({ children }: { children: React.ReactNode; }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <Loader />
        {children}
        <ChatWidgetWithLocale />
      </AuthProvider>
    </I18nProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Skip to main content
        </a>
        <ClientProviders>
          <Navigation />
          <main id="main-content">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
