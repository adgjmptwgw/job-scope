import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * What: ユーザーの検索履歴を取得します。
 * Why: UIに表示するために最新の10件を取得します。
 *      データベースのRLS（行レベルセキュリティ）により、ユーザーは自分の履歴のみを参照できますが、ここでも早期リターンのために認証チェックを行います。
 */
export async function GET() {
  console.log('\n📡 API REQUEST: GET /api/history');
  console.log('⏰ timestamp:', new Date().toISOString());
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('❌ auth_error: user not found');
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  console.log('👤 user_id:', user.id);

  const { data, error } = await supabase
    .from('search_histories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * What: 新しい検索履歴アイテムを保存します。
 * Why: ユーザーの検索意図を永続化します。
 *      テーブルの肥大化と無限リストを防ぐため、厳格な制限（上位10件を保持）を強制します。
 *      「挿入してから古いものを削除する」戦略を実行します：
 *      1. 新しいアイテムを挿入します。
 *      2. （時間順で）上位10件のアイテムIDをクエリします。
 *      3. その上位10件リストに含まれないアイテムを削除します。
 */
export async function POST(request: Request) {
  console.log('\n📡 API REQUEST: POST /api/history');
  console.log('⏰ timestamp:', new Date().toISOString());
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('❌ auth_error: user not found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conditions, summary } = await request.json();
  
  console.log('👤 user_id:', user.id);
  console.log('📝 summary:', summary);
  console.log('🔍 conditions:', JSON.stringify(conditions, null, 2));

  if (!conditions || !summary) {
    console.log('❌ validation_error: missing required fields');
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
  }

  // 1. Insert new history
  const { error: insertError } = await supabase
    .from('search_histories')
    .insert([
      {
        user_id: user.id,
        conditions,
        summary,
      },
    ]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 2. Cleanup old history (keep top 10)
  // Logic: Get the 11th item's created_at, delete anything older or equal to it (excluding top 10)
  // A simpler approach for "Max 10" without transactions (Supabase REST) is doing a fetch-then-delete
  // or a subquery delete if permitted.
  
  // Fetch IDs to keep
  const { data: idsToKeep, error: fetchError } = await supabase
    .from('search_histories')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!fetchError && idsToKeep && idsToKeep.length === 10) {
     const keptIds = idsToKeep.map(item => item.id);
     // Delete everything NOT in keptIds
     await supabase
        .from('search_histories')
        .delete()
        .eq('user_id', user.id)
        .not('id', 'in', `(${keptIds.join(',')})`);
  }

  return NextResponse.json({ success: true });
}
