import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Supabase Authでユーザー登録
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || null,
        },
      },
    });

    if (error) {
      // エラーメッセージを日本語化
      let errorMessage = 'アカウント作成に失敗しました';
      if (error.message.includes('already registered')) {
        errorMessage = 'このメールアドレスはすでに登録されています';
      } else if (error.message.includes('Password')) {
        errorMessage = 'パスワードは6文字以上で入力してください';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = '無効なメールアドレスです';
      }
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'アカウント作成に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
    });
  } catch (error) {
    console.error('Error in POST /api/auth/signup:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
