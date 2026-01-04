import { SearchHistory } from '../entities/SearchHistory';

export interface ISearchHistoryRepository {
  findByUserId(userId: string, limit?: number): Promise<SearchHistory[]>;
  create(history: Omit<SearchHistory, 'id' | 'created_at'>): Promise<SearchHistory>;
  deleteOldestForUser(userId: string, keepCount: number): Promise<void>;
}
