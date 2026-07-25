import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Sarafu',
  description: 'Financial visibility for Kenyan businesses that have no books.',
  icons: { icon: '/sarafu-mark.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ background: '#FFFFFF' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
