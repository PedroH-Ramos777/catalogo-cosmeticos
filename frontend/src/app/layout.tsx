import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Catálogo Express | Perfumaria & Cosméticos',
  description: 'Catálogo exclusivo de perfumaria e cosméticos com pedidos rápidos e organizados via WhatsApp.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Catálogo Express',
  },
};

export const viewport: Viewport = {
  themeColor: '#090514',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full bg-[#090514] text-neutral-100 antialiased selection:bg-purple-500 selection:text-white">
      <body className="min-h-full flex flex-col bg-[#090514] text-neutral-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
