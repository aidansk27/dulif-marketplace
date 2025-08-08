import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://dulif.com'),
  title: 'Dulif — UC Berkeley Student Marketplace',
  description: 'Buy, sell, and trade within the UC Berkeley community. Verified @berkeley.edu users only.',
  applicationName: 'Dulif',
  themeColor: '#003262',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/transdulif.svg', type: 'image/svg+xml' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Dulif — UC Berkeley Student Marketplace',
    description: 'Buy, sell, and trade within the UC Berkeley community. Verified @berkeley.edu users only.',
    siteName: 'Dulif',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dulif — UC Berkeley Student Marketplace',
    description: 'Buy, sell, and trade within the UC Berkeley community. Verified @berkeley.edu users only.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Dulif",
              "url": "https://dulif.com",
              "logo": "https://dulif.com/transdulif.svg"
            })
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
