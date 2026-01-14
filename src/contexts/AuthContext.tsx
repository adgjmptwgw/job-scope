'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // セッションチェックAPIを呼び出し
      const response = await fetch('/api/auth/session');
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(!!data.user);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ローディング完了後、認証チェック
    if (isLoading) return;

    // 公開ページ
    const publicPaths = ['/login', '/signup', '/'];
    const isPublicPage = publicPaths.includes(pathname);

    // 未ログインで保護されたページにアクセスした場合
    if (!isAuthenticated && !isPublicPage) {
      console.log('[Auth] Redirecting to login from:', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, refreshAuth: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
