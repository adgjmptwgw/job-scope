"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * What: Supabaseを介してユーザー認証を処理します。
   * Why: 認証フローのクライアントサイドのエントリーポイントです。
   *      SSRサポート（HttpOnly Cookie）のためにCookie設定を適切に管理するため、
   *      直接クライアントサイドのSupabase呼び出しを行うのではなく、バックエンドルート（`/api/auth/login`）を使用します。
   */
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // セッション更新を待つため少し待機
        setTimeout(() => {
           router.push('/search');
           router.refresh(); 
        }, 500);
      } else {
        const errorData = await res.json();
        setError(`ログイン失敗: ${errorData.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('ログイン中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)] py-12">
      {/* アニメーション背景要素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] relative z-10 mx-auto"
      >
        <Card className="shadow-2xl border-border/50 overflow-hidden backdrop-blur-xl bg-card/80">
          {/* グラデーション付きカードヘッダー */}
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer" />
          
          <CardHeader className="space-y-6 pb-8 pt-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto bg-gradient-to-br from-primary to-accent p-5 rounded-2xl shadow-glow"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">ログイン</CardTitle>
              <p className="text-muted-foreground">
                JobScopeへようこそ
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium text-center"
              >
                {error}
              </motion.div>
            )}
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-10">
            {/* メールアドレスフィールド */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-3"
            >
              <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium">
                <User className="w-4 h-4 text-primary" />
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 bg-background/50 border-2 border-input focus:border-primary px-4 text-base transition-all rounded-xl"
              />
            </motion.div>

            {/* パスワードフィールド */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="grid gap-3"
            >
              <Label htmlFor="password" className="flex items-center gap-2 text-base font-medium">
                <Lock className="w-4 h-4 text-primary" />
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 bg-background/50 border-2 border-input focus:border-primary px-4 text-base transition-all rounded-xl"
              />
            </motion.div>

            {/* ログインボタン */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <Button
                onClick={handleLogin}
                variant="gradient"
                size="lg"
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>
            </motion.div>

            {/* デモ用ボタン */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center pt-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail('test@example.com');
                  setPassword('password123');
                }}
                className="group relative overflow-hidden border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 text-xs text-muted-foreground transition-all rounded-lg px-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary animate-pulse" />
                  <span>デモ用アカウントで入力</span>
                </div>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
