// 自然文検索条件の型定義
export interface SearchConditions {
  keywords?: string[];
  locations?: string[];
  min_salary?: number | null;
  max_salary?: number | null;
  skills?: string[];
  employment_type?: string[];
  remote_available?: boolean | null;
  experience_level?: string[];
  company_characteristics?: string[];
}

import { SearchIntent } from '../../domain/types/SearchIntent';

// Stage 3+4: 統合検証（Self-Consistency + 企業評価）の結果
export interface IntegratedEvaluationResult {
  job_match_score: number;           // 求人マッチ度（0-100）
  company_concerns: Record<string, { // 企業の関心事項評価
    score: number;                   // スコア（0-100）
    summary: string;                 // 評価要約
  }>;
  overall_score: number;             // 総合スコア（0-100）
  recommend: boolean;                // 推薦するか（true/false）
}

// Stage 3+4統合後の求人データ
export interface JobWithCompanyEvaluation {
  [key: string]: any;                // 元の求人情報
  job_match_score: number;           // 求人マッチ度
  company_evaluation: {              // 企業評価
    concerns: Record<string, ConcernScore>;
    overall_score: number;
  };
  overall_score: number;             // 総合スコア
  confidence: number;                // 信頼度（67 or 100）
}


// Gemini APIのインターフェース
export interface IGeminiClient {
  parseSearchQuery(query: string): Promise<SearchConditions>;
  parseQueryWithCoT(query: string): Promise<SearchIntent>;
  /**
   * Stage 2: AI求人候補生成
   * 
   * What: 自然文の検索クエリに基づいて、条件にマッチする求人候補リストを生成する
   * Why: 以前はGoogle Search Groundingを使用していたが、コストと柔軟性の問題から
   *      Geminiの生成能力を直接利用する方式に変更した。
   *      これにより、ユーザーの細かいニュアンス（「できればリモート」等）を柔軟に反映できる。
   */
  searchWithGrounding(query: string): Promise<any[]>;
  
  // Stage 3+4: 統合検証（Self-Consistency + 企業評価）
  /**
   * Stage 3+4: 統合検証（Self-Consistency + 企業評価）
   * 
   * What: 生成された求人候補に対して、求人内容の適合度と企業の評判を同時に評価する
   * Why: AIが生成した求人が本当にユーザーの意図に合っているか（ハルシネーションでないか）を検証するため。
   *      同じプロンプトで複数回評価し、多数決をとることで信頼性を担保する（Self-Consistency）。
   */
  evaluateJobsWithCompanies(
    candidates: any[],
    intent: SearchIntent
  ): Promise<JobWithCompanyEvaluation[]>;
  
  // 旧メソッド（削除予定）
  evaluateConsistencyBatch(candidates: any[], intent: SearchIntent): Promise<any[]>; // 検証済みの候補リスト（スコア付き）を返す
  evaluateCompaniesForUserConcerns(companyNames: string[], intent: SearchIntent): Promise<UserConcernEvaluation[]>; // ユーザー関心事項に基づく企業評価
  evaluateCompany(companyId: string, companyName: string): Promise<CompanyEvaluation>;
}

/**
 * ユーザー関心事項に基づく企業評価の結果
 */
export interface UserConcernEvaluation {
  companyName: string;
  concerns: Record<string, ConcernScore>; // 各関心事項のスコア
  overall_score: number; // 総合スコア (0-100)
}

export interface ConcernScore {
  concern: string; // 関心事項名（例: "残業時間"）
  score: number; // 0-100
  summary: string; // 評価の要約
  sources?: string[]; // 参照元URL（あれば）
}

/**
 * 技術力評価の結果（削除予定 - 後方互換性のため残す）
 */
export interface TechEvaluation {
  companyName: string;
  tech_score: number; // 0-100
  tech_stack_modernity: number; // 0-100
  engineering_culture: number; // 0-100
  summary: string;
  strengths: string[]; // 技術的な強み
}

// 企業評価の型定義
export interface CompanyEvaluation {
  summary: string;
  topics: EvaluationTopic[];
  generated_at: string;
}

export interface EvaluationTopic {
  category: 'Culture' | 'Management' | 'WorkLifeBalance' | 'Growth' | 'Compensation';
  title: string;
  description: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sources: SourceReference[];
}

export interface SourceReference {
  title: string;
  url: string;
}
