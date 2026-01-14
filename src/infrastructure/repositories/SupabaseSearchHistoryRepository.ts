import { SupabaseClient } from '@supabase/supabase-js';
import { ISearchHistoryRepository } from '../../domain/repositories/ISearchHistoryRepository';
import { SearchHistory } from '../../domain/entities/SearchHistory';

export class SupabaseSearchHistoryRepository implements ISearchHistoryRepository {
  constructor(private client: SupabaseClient) {}

  async findByUserId(userId: string, limit: number = 10): Promise<SearchHistory[]> {
    const { data, error } = await this.client
      .from('search_histories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      conditions: item.conditions,
      summary: item.summary,
      created_at: item.created_at,
    }));
  }

  async create(history: Omit<SearchHistory, 'id' | 'created_at'>): Promise<SearchHistory> {
    const { data, error } = await this.client
      .from('search_histories')
      .insert({
        user_id: history.user_id,
        conditions: history.conditions,
        summary: history.summary,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('検索履歴の保存に失敗しました');
    }

    return {
      id: data.id,
      user_id: data.user_id,
      conditions: data.conditions,
      summary: data.summary,
      created_at: data.created_at,
    };
  }

  async deleteOldestForUser(userId: string, keepCount: number): Promise<void> {
    // ユーザーの履歴件数を確認
    const { count } = await this.client
      .from('search_histories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (!count || count <= keepCount) {
      return; // 削除不要
    }

    // 古い履歴を削除 (keepCount件を超える分)
    const { data: oldHistories } = await this.client
      .from('search_histories')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(count - keepCount);

    if (oldHistories && oldHistories.length > 0) {
      const idsToDelete = oldHistories.map(h => h.id);
      await this.client
        .from('search_histories')
        .delete()
        .in('id', idsToDelete);
    }
  }
}
