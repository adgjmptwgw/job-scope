/**
 * Claude API クライアントのインターフェース
 * 
 * What: Claude APIとの通信を抽象化するインターフェース
 * Why: Geminiとは異なる特性（文章表現・文化理解）を活かした評価を行うため
 */
export interface IClaudeClient {
  /**
   * 企業の文化・働きやすさを評価する
   * @param companyName 企業名
   * @returns 文化評価結果
   */
  evaluateCulture(companyName: string): Promise<CultureEvaluation>;
  
  /**
   * 複数企業の文化・働きやすさをバッチ評価する
   * @param companyNames 企業名の配列
   * @returns 文化評価結果の配列
   */
  evaluateCultureBatch(companyNames: string[]): Promise<CultureEvaluation[]>;
}

/**
 * 文化評価の結果
 */
export interface CultureEvaluation {
  companyName: string;
  culture_score: number; // 0-100
  work_life_balance: number; // 0-100
  growth_opportunity: number; // 0-100
  summary: string;
  highlights: string[]; // ポジティブな点
  concerns: string[]; // 懸念点
}
