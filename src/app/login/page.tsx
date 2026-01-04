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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (username === 'user' && password === 'password') {
      alert('ログイン成功！');
      router.push('/search');
    } else {
      alert('ユーザー名またはパスワードが間違っています。');
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
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-10">
            {/* ユーザー名フィールド */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-3"
            >
              <Label htmlFor="username" className="flex items-center gap-2 text-base font-medium">
                <User className="w-4 h-4 text-primary" />
                ユーザー名
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="ユーザー名を入力"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
              >
                ログイン
              </Button>
            </motion.div>

            {/* ヘルパーテキスト */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-sm text-muted-foreground pt-2"
            >
              デモ用: user / password
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
