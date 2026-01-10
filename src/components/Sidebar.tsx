"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Search, 
  Heart,
  LogOut,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter(); // ルーターを初期化
  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/search', label: '求人検索', icon: Search },
    { path: '/favorites', label: 'お気に入り', icon: Heart },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      } else {
        console.error('Logout failed');
        // フォールバック
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/50 z-40"
    >
      {/* サイドバーヘッダー / ロゴ */}
      <div className="p-6 h-20 flex items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg shadow-glow group-hover:scale-110 transition-transform duration-300">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            JobScope
          </span>
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={isActive(item.path) ? "secondary" : "ghost"}
            className={`w-full justify-start h-12 text-base font-medium transition-all duration-300 ${
              isActive(item.path) 
                ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Link href={item.path} className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>

      {/* サイドバーフッター */}
      <div className="p-4 border-t border-border/50 space-y-2">
        {/* ユーザープロフィールリンク */}
        <Button asChild variant="ghost" className="w-full justify-start h-12 text-foreground hover:bg-accent/50 mb-2">
          <Link href="/settings" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               U
             </div>
             <div className="flex flex-col items-start leading-none gap-1">
               <span className="font-semibold text-sm">User</span>
               <span className="text-xs text-muted-foreground">View Profile</span>
             </div>
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5 mr-3" />
              ログアウト
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <LogOut className="w-5 h-5 text-red-500" />
                ログアウトしますか？
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                ログアウトすると、現在のセッションが終了します。もう一度利用するには再ログインが必要です。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="border-border/50 hover:bg-accent">キャンセル</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white border-0"
              >
                ログアウト
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
