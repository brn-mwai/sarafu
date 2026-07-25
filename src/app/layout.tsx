import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sarafu',
  description: 'Financial visibility for Kenyan businesses that have no books.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
