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

// Gemini APIのインターフェース
export interface IGeminiClient {
  parseSearchQuery(query: string): Promise<SearchConditions>;
  parseQueryWithCoT(query: string): Promise<SearchIntent>;
  searchWithGrounding(query: string): Promise<any[]>; // 検索結果（求人リスト）を返す
  evaluateConsistencyBatch(candidates: any[], intent: SearchIntent): Promise<any[]>; // 検証済みの候補リスト（スコア付き）を返す
  evaluateTechBatch(companyNames: string[]): Promise<TechEvaluation[]>; // 技術力評価のバッチ処理
  evaluateCompany(companyId: string, companyName: string): Promise<CompanyEvaluation>;
}

/**
 * 技術力評価の結果
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
