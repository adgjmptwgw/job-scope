import { IJobRepository } from '../repositories/IJobRepository';
import { ISearchHistoryRepository } from '../repositories/ISearchHistoryRepository';
import { IGeminiClient, SearchConditions } from '../../infrastructure/ai/IGeminiClient';
import { IClaudeClient } from '../../infrastructure/ai/IClaudeClient';
import { Job } from '../entities/Job';

/**
 * 検索サービス
 * 
 * What: AI検索の全ステージを統括するサービス
 * Why: Stage 1〜4の処理を一貫して管理し、フロントエンドにシンプルなAPIを提供するため
 */
export class SearchService {
  constructor(
    private jobRepository: IJobRepository,
    private searchHistoryRepository: ISearchHistoryRepository,
    private geminiClient: IGeminiClient,
    private claudeClient?: IClaudeClient // Phase 4用（オプショナル）
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

  // Phase 1 CoT Search (Mock / Preview)
  async searchJobsWithCoT(
    query: string,
    userId?: string
  ): Promise<{ intent: any; candidates: Job[] }> {
    // Stage 1: 意図理解 (CoT)
    const intent = await this.geminiClient.parseQueryWithCoT(query);
    
    // Sage 2: 候補生成 (Mock / Grounding)
    
    // 意図をモックのグラウンディング用クエリ文字列に変換
    // 実際の実装では、AIが意図からこのクエリ文字列を生成します
    const groundingQuery = `"${intent.explicit.skills?.join('" "') || ''}" 求人 ${intent.explicit.locations?.join(' ') || ''} site:green-japan.com OR site:indeed.com`;
    
    console.log(`[SearchService] Generated Grounding Query: ${groundingQuery}`);
    
    const mockCandidates = await this.geminiClient.searchWithGrounding(groundingQuery);

    // 必要であればモックの候補をJobエンティティ形式にマッピング（現在はJSONレスポンス用に`any`型で十分一致している）
    // 実際のアプリでは、ここでパースと正規化を行います。

    // Stage 3: 検証 (Self-Consistency) & スコアリング
    const validatedCandidates = await this.geminiClient.evaluateConsistencyBatch(mockCandidates, intent);
    
    // Stage 4: 企業評価 (Multi-Model Ensemble)
    // Gemini（技術力）とClaude（文化）を並列で評価
    const companyNames = [...new Set(validatedCandidates.map((c: any) => c.company?.name).filter(Boolean))];
    
    let techEvaluations: any[] = [];
    let cultureEvaluations: any[] = [];
    
    // 並列処理でGeminiとClaudeを同時に呼び出し
    const [techResults, cultureResults] = await Promise.all([
      this.geminiClient.evaluateTechBatch(companyNames),
      this.claudeClient ? this.claudeClient.evaluateCultureBatch(companyNames) : Promise.resolve([])
    ]);
    
    techEvaluations = techResults;
    cultureEvaluations = cultureResults;
    
    // 評価結果を候補データにマージ
    const enrichedCandidates = validatedCandidates.map((candidate: any) => {
      const companyName = candidate.company?.name;
      const techEval = techEvaluations.find(e => e.companyName === companyName);
      const cultureEval = cultureEvaluations.find(e => e.companyName === companyName);
      
      return {
        ...candidate,
        company_evaluation: {
          // Gemini評価（技術力）
          tech: techEval || null,
          // Claude評価（文化・働きやすさ）
          culture: cultureEval || null,
          // 総合スコア（両方の平均）
          overall_score: techEval && cultureEval 
            ? Math.round((techEval.tech_score + cultureEval.culture_score) / 2)
            : techEval?.tech_score || cultureEval?.culture_score || 0
        }
      };
    });
    
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
