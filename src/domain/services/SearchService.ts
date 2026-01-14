import { IJobRepository } from '../repositories/IJobRepository';
import { ISearchHistoryRepository } from '../repositories/ISearchHistoryRepository';
import { IGeminiClient, SearchConditions } from '../../infrastructure/ai/IGeminiClient';
import { Job } from '../entities/Job';

/**
 * 検索サービス
 * 
 * What: AI検索の全ステージ（意図理解から企業評価まで）を統括し、検索結果を提供するサービス
 * Why: 各ステージ（Stage 1〜4）の複雑な連携ロジックをこのサービスに隠蔽し、
 *      フロントエンドに対してはシンプルなAPIで検索機能を提供するため。
 *      また、クエリ解析と実際の検索処理を分離することで、テスト容易性を高める意図がある。
 */
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

  // Phase 1 CoT Search
  /**
   * AIオーケストレーション検索を実行する (CoT + Grounding + Verification)
   * 
   * What: 自然文クエリを受け取り、AIによる意図理解(Stage 1)、候補生成(Stage 2)、
   *       および検証(Stage 3+4)を経て、高精度な求人検索結果を返す。
   * Why: 単なるキーワードマッチではなく、ユーザーの潜在的な意図（年収、働き方、企業文化など）を
   *      汲み取った「提案型」の検索を実現するため。
   *      Self-Consistency（Stage 3）により、AIのハルシネーションを低減させる狙いもある。
   */
  async searchJobsWithCoT(
    query: string,
    userId?: string
  ): Promise<{ intent: any; candidates: any[] }> {
    // Stage 1: 意図理解 (CoT)
    const intent = await this.geminiClient.parseQueryWithCoT(query);
    
    // Stage 2: AI求人候補生成
    // 検索意図全体を自然文に変換してGeminiに渡す
    const queryParts: string[] = [];
    
    // 明示的条件
    if (intent.explicit.locations && intent.explicit.locations.length > 0) {
      queryParts.push(`勤務地は${intent.explicit.locations.join('または')}`);
    }
    if (intent.explicit.skills && intent.explicit.skills.length > 0) {
      queryParts.push(`${intent.explicit.skills.join('、')}を使用する`);
    }
    if (intent.explicit.min_salary) {
      queryParts.push(`年収${Math.floor(intent.explicit.min_salary / 10000)}万円以上`);
    }
    
    // 暗黙的条件
    if (intent.implicit.role) {
      queryParts.push(`職種は${intent.implicit.role}`);
    }
    if (intent.implicit.employment_type && intent.implicit.employment_type.length > 0) {
      queryParts.push(`雇用形態は${intent.implicit.employment_type.join('または')}`);
    }
    if (intent.implicit.company_size && intent.implicit.company_size.length > 0) {
      queryParts.push(`企業規模は${intent.implicit.company_size.join('または')}`);
    }
    if (intent.implicit.must_have && intent.implicit.must_have.length > 0) {
      queryParts.push(intent.implicit.must_have.join('、'));
    }
    if (intent.implicit.nice_to_have && intent.implicit.nice_to_have.length > 0) {
      queryParts.push(`できれば${intent.implicit.nice_to_have.join('、')}`);
    }
    
    // 除外条件
    if (intent.exclude && intent.exclude.length > 0) {
      queryParts.push(`ただし${intent.exclude.join('、')}は除外`);
    }
    
    const searchQuery = queryParts.length > 0 
      ? queryParts.join('、') + 'という条件で求人を探しています'
      : '求人を探しています';
    
    console.log(`[SearchService] Generated Search Query: ${searchQuery}`);
    
    const mockCandidates = await this.geminiClient.searchWithGrounding(searchQuery);

    // Stage 3+4: 統合検証（Self-Consistency + 企業評価）
    const enrichedCandidates = await this.geminiClient.evaluateJobsWithCompanies(mockCandidates, intent);
    
    // 信頼度（confidence）順にソート
    enrichedCandidates.sort((a: any, b: any) => b.confidence - a.confidence);

    return {
      intent,
      candidates: enrichedCandidates
    };
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
