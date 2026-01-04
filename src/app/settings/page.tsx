"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Lock,
  LogOut,
  Trash2,
  Camera,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountSettings() {
  const [displayName, setDisplayName] = useState("テストユーザー");
  const [email, setEmail] = useState("user@example.com");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // モックアバターURL
  const [avatarUrl, setAvatarUrl] = useState("https://github.com/shadcn.png");

  const handleSave = () => {
    setIsSaving(true);
    // API呼び出しをシミュレート
    setTimeout(() => {
      setIsSaving(false);
      alert("設定を保存しました（デモ）");
      if (newEmail) setEmail(newEmail);
      setNewEmail("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) {
      alert("アカウント削除処理を実行しました（デモ）");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">アカウント設定</h1>
        <p className="text-muted-foreground">
          プロフィール、連絡先情報、セキュリティ設定を管理します。
        </p>
      </div>

      <div className="grid gap-8">
        {/* プロフィールセクション */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              プロフィール
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-muted">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <Button variant="outline" size="sm">画像を変更</Button>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="displayName">表示名</Label>
                  <Input 
                    id="displayName" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">アプリ内で表示される名前です。</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アカウント情報セクション */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              メールアドレス
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 max-w-md">
              <div className="grid gap-2">
                <Label>現在のメールアドレス</Label>
                <Input value={email} disabled className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newEmail">新しいメールアドレス</Label>
                <Input 
                  id="newEmail" 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="new@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* セキュリティセクション */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              セキュリティ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">現在のパスワード</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">新しいパスワード</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              {/* 要件により2FAを削除 */}
            </div>

          </CardContent>
        </Card>

        {/* アクション */}
        <div className="flex justify-end gap-4">
          <Button 
            onClick={handleSave} 
            size="lg" 
            className="w-full md:w-auto min-w-[150px]"
            disabled={isSaving}
          >
            {isSaving ? "保存中..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                変更を保存
              </>
            )}
          </Button>
        </div>

        {/* 危険地帯 */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-xl text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              危険な操作
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">アカウントの削除</p>
              <p className="text-sm text-muted-foreground">
                アカウントと全てのデータを完全に削除します。この操作は元に戻せません。
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <LogOut className="w-4 h-4 mr-2" />
              アカウント削除
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
