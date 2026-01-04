import { IJobRepository } from '../repositories/IJobRepository';
import { ISearchHistoryRepository } from '../repositories/ISearchHistoryRepository';
import { IGeminiClient, SearchConditions } from '../../infrastructure/ai/IGeminiClient';
import { Job } from '../entities/Job';

export class SearchService {
  constructor(
    private jobRepository: IJobRepository,
    private searchHistoryRepository: ISearchHistoryRepository,
    private geminiClient: IGeminiClient
  ) {}

  async searchJobs(
    query?: string,
    userId?: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<{ jobs: Job[]; total: number }> {
    let conditions: SearchConditions = {};

    // 自然文クエリがあればAIで解析
    if (query) {
      conditions = await this.geminiClient.parseSearchQuery(query);
    }

    // データベースから実際に検索
    const result = await this.jobRepository.search(conditions, offset, limit);
    
    // 検索履歴を保存（ユーザーがログインしている場合のみ）
    if (userId && query) {
      await this.saveSearchHistory(userId, conditions, query);
    }

    return result;
  }

  private async saveSearchHistory(
    userId: string,
    conditions: SearchConditions,
    query: string
  ): Promise<void> {
    try {
      // サマリーを生成
      const summary = this.generateSummary(conditions, query);
      
      // 検索履歴を保存
      await this.searchHistoryRepository.create({
        user_id: userId,
        conditions,
        summary,
      });

      // 古い履歴を削除（最大10件まで）
      await this.searchHistoryRepository.deleteOldestForUser(userId, 10);
    } catch (error) {
      // 履歴保存の失敗は検索結果に影響させない
      console.error('Failed to save search history:', error);
    }
  }

  private generateSummary(conditions: SearchConditions, query: string): string {
    const parts: string[] = [];

    if (conditions.locations && conditions.locations.length > 0) {
      parts.push(conditions.locations.join(', '));
    }
    if (conditions.min_salary) {
      parts.push(`>${conditions.min_salary / 10000}万`);
    }
    if (conditions.skills && conditions.skills.length > 0) {
      parts.push(conditions.skills.join(', '));
    }

    return parts.length > 0 ? parts.join(', ') : query;
  }
}
