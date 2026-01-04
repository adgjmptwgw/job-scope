import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * What: ユーザーの検索履歴を取得します。
 * Why: UIに表示するために最新の10件を取得します。
 *      データベースのRLS（行レベルセキュリティ）により、ユーザーは自分の履歴のみを参照できますが、ここでも早期リターンのために認証チェックを行います。
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conditions, summary } = await request.json();

  if (!conditions || !summary) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

  // 2. Cleanup old history (keep top 15)
  // Logic: Get the 16th item's created_at, delete anything older or equal to it (excluding top 15)
  // A simpler approach for "Max 15" without transactions (Supabase REST) is doing a fetch-then-delete
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
