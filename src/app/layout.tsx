import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

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
    <html lang="ja">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-background text-foreground flex min-h-screen`}>
        <Sidebar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
