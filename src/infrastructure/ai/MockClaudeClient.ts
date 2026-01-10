import { IClaudeClient, CultureEvaluation } from './IClaudeClient';

/**
 * Claude APIのモック実装
 * 
 * What: 文化・働きやすさ評価をシミュレーションするモッククライアント
 * Why: 実際のClaude APIを呼び出さずに開発・テストを行うため
 */
export class MockClaudeClient implements IClaudeClient {
  
  /**
   * 企業の文化・働きやすさを評価する（モック）
   */
  async evaluateCulture(companyName: string): Promise<CultureEvaluation> {
    console.log(`[MockClaude] 企業文化を評価中: ${companyName}`);
    
    // 思考時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 企業名に基づいてダミーの評価を返す
    return this.generateMockEvaluation(companyName);
  }
  
  /**
   * 複数企業の文化・働きやすさをバッチ評価する（モック）
   */
  async evaluateCultureBatch(companyNames: string[]): Promise<CultureEvaluation[]> {
    console.log(`[MockClaude] ${companyNames.length}社の企業文化をバッチ評価中...`);
    
    // 思考時間をシミュレート（バッチ処理なので1回のみ）
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return companyNames.map(name => this.generateMockEvaluation(name));
  }
  
  /**
   * 企業名に基づいてモック評価を生成
   */
  private generateMockEvaluation(companyName: string): CultureEvaluation {
    // 企業ごとに異なるダミーデータを返す
    const mockData: Record<string, Partial<CultureEvaluation>> = {
      'SmartHR': {
        culture_score: 92,
        work_life_balance: 88,
        growth_opportunity: 85,
        summary: 'フラットな組織文化で、エンジニアの意見が尊重される環境です。',
        highlights: ['リモートワーク推進', 'フレックス制度あり', '心理的安全性が高い'],
        concerns: ['急成長中のため業務量が多い時期あり']
      },
      'Mercari': {
        culture_score: 90,
        work_life_balance: 85,
        growth_opportunity: 95,
        summary: 'グローバルな環境で、多様性を重視した文化です。',
        highlights: ['英語が公用語', '海外拠点との連携', '充実した福利厚生'],
        concerns: ['変化が激しく適応力が求められる']
      },
      'CyberAgent': {
        culture_score: 78,
        work_life_balance: 70,
        growth_opportunity: 88,
        summary: '若手の活躍機会が多く、挑戦的な環境です。',
        highlights: ['若手でも大きな裁量', '新規事業に携われる', '社内イベント活発'],
        concerns: ['長時間労働の傾向', '結果主義が強い']
      }
    };
    
    // 該当企業があればそのデータ、なければデフォルト値を返す
    const data = mockData[companyName] || {
      culture_score: 75,
      work_life_balance: 75,
      growth_opportunity: 75,
      summary: '一般的なIT企業の文化です。',
      highlights: ['安定した環境'],
      concerns: ['特筆すべき点なし']
    };
    
    return {
      companyName,
      culture_score: data.culture_score!,
      work_life_balance: data.work_life_balance!,
      growth_opportunity: data.growth_opportunity!,
      summary: data.summary!,
      highlights: data.highlights!,
      concerns: data.concerns!
    };
  }
}
