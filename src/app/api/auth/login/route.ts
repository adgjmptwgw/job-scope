import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Supabase Authでログイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // エラーメッセージを日本語化
      let errorMessage = 'ログインに失敗しました';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'メールアドレスが確認されていません';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'ユーザーが見つかりません';
      }
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'ログインに失敗しました' }, { status: 500 });
    }

    // セッションCookieは自動的に設定される
    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
    });
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
