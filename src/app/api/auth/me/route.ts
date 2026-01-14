import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 現在のユーザー情報を取得
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || null,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error('Error in GET /api/auth/me:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
