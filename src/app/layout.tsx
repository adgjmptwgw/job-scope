import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthLayout from '@/components/AuthLayout';
import '@/lib/suppress-performance-errors';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'JobScope - エンジニア向け求人検索',
  description: 'AIを活用したエンジニア向け求人検索プラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`} suppressHydrationWarning>
        <AuthProvider>
          <AuthLayout>
            {children}
          </AuthLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
