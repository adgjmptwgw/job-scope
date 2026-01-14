'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import { ReactNode } from 'react';
import { DemoBanner } from './DemoBanner';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  
  // 公開ページ（サイドバーを表示しない）
  const publicPages = ['/login', '/signup', '/'];
  const isPublicPage = publicPages.includes(pathname);
  
  // ローディング中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // 公開ページまたは未認証の場合はサイドバーなし
  if (isPublicPage || !isAuthenticated) {
    return (
      <main className="w-full min-h-screen">
        {children}
      </main>
    );
  }
  
  // 認証済みの場合はサイドバー付きレイアウト
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-12 overflow-y-auto">
        <DemoBanner />
        {children}
      </main>
    </div>
  );
}
