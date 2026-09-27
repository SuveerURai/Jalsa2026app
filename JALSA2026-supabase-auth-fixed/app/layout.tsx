import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'JALSA 2026 — Official Registration & Digital QR Ticketing Portal',
  description: 'Register for JALSA 2026, the ultimate annual college cultural festival and Dandiya night. Secure your ticket online with instant QR generation.',
  keywords: ['JALSA 2026', 'College Fest', 'Dandiya Night', 'Ticket Registration', 'College Cultural Event'],
  openGraph: {
    title: 'JALSA 2026 — Official Registration & Digital QR Ticketing Portal',
    description: 'Register for JALSA 2026. Secure your ticket online for ₹200.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-dark-bg text-zinc-100 antialiased min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
