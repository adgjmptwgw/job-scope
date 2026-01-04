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

// Gemini APIのインターフェース
export interface IGeminiClient {
  parseSearchQuery(query: string): Promise<SearchConditions>;
  evaluateCompany(companyId: string, companyName: string): Promise<CompanyEvaluation>;
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
