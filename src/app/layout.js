import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  metadataBase: new URL('https://megaielts.com'), // Base URL for global SEO
  title: {
    default: "Mega IELTS — The Ultimate Online IELTS Mock Platform",
    template: "%s | Mega IELTS"
  },
  description: "Prepare for your IELTS exam with Mega IELTS. Take full professional online mock tests for Reading, Listening, and Writing. Get instant AI evaluations, detailed analytics, and reach your target band score.",
  applicationName: "Mega IELTS",
  keywords: [
    "IELTS", "IELTS mock", "online IELTS test", "IELTS practice free", 
    "IELTS reading test", "IELTS listening test", "IELTS writing check", "IELTS speaking mock",
    "Mega IELTS", "IELTS preparation online", "IELTS band 8", "IELTS exam simulator",
    "Global IELTS mock", "English proficiency", "Study abroad prep"
  ],
  authors: [{ name: "Mega IELTS Team" }],
  creator: "Mega IELTS",
  publisher: "Mega IELTS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'uz-UZ': '/uz',
      'ru-RU': '/ru',
    },
  },
  openGraph: {
    title: "Mega IELTS — Advanced Online Mock Platform",
    description: "Take professional IELTS mock tests online. Instant results for Reading and Listening, AI evaluation for Writing. Track your progress to Band 9.0.",
    url: 'https://megaielts.com',
    siteName: 'Mega IELTS',
    images: [
      {
        url: 'https://megaielts.com/og-image.jpg', // Public image link for social media previews
        width: 1200,
        height: 630,
        alt: 'Mega IELTS Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mega IELTS — Real Exam Experience Online',
    description: 'Master your IELTS with comprehensive practice tests and AI feedback.',
    creator: '@megaielts',
    images: ['https://megaielts.com/og-image.jpg'],
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
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://megaielts.com/#website',
      url: 'https://megaielts.com',
      name: 'Mega IELTS',
      description: 'The ultimate online IELTS preparation and mock test platform.',
      publisher: {
        '@type': 'Organization',
        name: 'Mega IELTS'
      },
      inLanguage: 'en-US'
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://megaielts.com/#organization',
      name: 'Mega IELTS',
      url: 'https://megaielts.com',
      logo: 'https://megaielts.com/logo.png',
      sameAs: [
        'https://t.me/megaieltsuz', // Telegram manzilingiz (O'zgartirib olishingiz mumkin)
        'https://instagram.com/megaieltsuz' // Instagram manzilingiz (O'zgartirib olishingiz mumkin)
      ],
      description: 'Online platform for IELTS mock tests, preparation, and comprehensive English language assessment.',
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${firaCode.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}