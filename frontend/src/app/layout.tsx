import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/providers/ClientProviders';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Lakshmi Dental Care — Clinic Management",
  description: "Enterprise Dental Clinic Dashboard & AI Diagnostic System",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#FAF6FB]" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans h-full antialiased text-slate-800 bg-[#FAF6FB]`} suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
