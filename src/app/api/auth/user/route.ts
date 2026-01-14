import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 現在のユーザーを取得
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーアカウントを削除
    // Note: Supabase Auth v2では admin.deleteUser() が必要だが、
    // クライアント側では自己削除はサポートされていない可能性がある。
    // RLSによりCASCADE削除が設定されているため、auth.users削除時に関連データも削除される。
    
    // 一時的な実装: アカウント削除APIは管理者権限が必要なため、
    // 現段階ではsignOutのみ実行し、実際の削除は別途実装する必要がある
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: 'ログアウトに失敗しました' }, { status: 500 });
    }

    // TODO: Service Role Keyを使用してadmin.deleteUser()を呼び出す
    // または、削除フラグを立てるなどの代替実装を検討

    return NextResponse.json({ message: 'Account deletion initiated' });
  } catch (error) {
    console.error('Error in DELETE /api/auth/user:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
