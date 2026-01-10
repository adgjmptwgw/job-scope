import { IGeminiClient, SearchConditions, CompanyEvaluation, TechEvaluation } from './IGeminiClient';
import { SearchIntent } from '../../domain/types/SearchIntent';

export class MockGeminiClient implements IGeminiClient {
  async parseSearchQuery(query: string): Promise<SearchConditions> {
    return {
      keywords: [query],
    };
  }

  async parseQueryWithCoT(query: string): Promise<SearchIntent> {
    console.log(`[MockGemini] Parsing query with CoT: "${query}"`);

    // 単純なキーワードベースのシミュレーション
    const isTokyo = query.includes('東京');
    const isReact = query.toLowerCase().includes('react');
    const isRemote = query.includes('リモート');
    const isSalary = query.includes('800万') || query.includes('高収入');

    // 思考時間をシミュレート（遅延）
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      explicit: {
        locations: isTokyo ? ['東京'] : [],
        skills: isReact ? ['React'] : [],
        min_salary: isSalary ? 8000000 : null,
      },
      implicit: {
        role: isReact ? 'Frontend Engineer' : 'Engineer',
        employment_type: ['Full-time', 'Freelance'],
        min_salary: isSalary ? 8000000 : 6000000, // 指定がない場合は市場相場を使用
        company_size: ['Startup', 'Venture'],
        nice_to_have: isRemote ? ['Remote Work'] : [],
      },
      search_intent_summary: `${isTokyo ? '東京の' : ''}${isReact ? 'React' : 'エンジニア'}案件（正社員/フリーランス）${isSalary ? '・年収800万以上' : ''}`
    };
  }

  async searchWithGrounding(query: string): Promise<any[]> {
    console.log(`[MockGemini] Searching with Grounding: "${query}"`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Google検索の遅延をシミュレート

    // 複数のサイトから取得したように見せかけたダミー求人を返す
    return [
      {
        id: 'mock-1',
        title: 'Senior React Engineer',
        company: { name: 'SmartHR' },
        location: '東京都港区',
        salary_min: 8000000,
        salary_max: 12000000,
        source_url: 'https://green-japan.com/job/12345',
        skills: ['React', 'TypeScript', 'Next.js'],
        description: '自社SaaSプロダクトのフロントエンド開発...'
      },
      {
        id: 'mock-2',
        title: 'Frontend Developer (React)',
        company: { name: 'Mercari' },
        location: '東京都 (Remote)',
        salary_min: 9000000,
        salary_max: 15000000,
        source_url: 'https://careers.mercari.com/job/54321',
        skills: ['React', 'Redux', 'GraphQL'],
        description: 'グローバル展開するフリマアプリの開発...'
      },
      {
        id: 'mock-3',
        title: 'Web Engineer',
        company: { name: 'CyberAgent' },
        location: '東京都渋谷区',
        salary_min: 6000000,
        salary_max: 9000000,
        source_url: 'https://www.cyberagent.co.jp/careers/job/987',
        skills: ['React', 'Vue.js', 'AWS'],
        description: 'ABEMA等のメディアサービスの開発...'
      }
    ];
  }

  async evaluateConsistencyBatch(candidates: any[], intent: SearchIntent): Promise<any[]> {
    console.log(`[MockGemini] Evaluating consistency for ${candidates.length} candidates...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // 思考時間をシミュレート

    // モック検証ロジック: 単純なルールに基づいてスコアと理由を追加
    return candidates.map(candidate => {
      let score = 70;
      const reasons: string[] = [];

      // モック用の単純なルールベーススコアリング
      if (candidate.title.toLowerCase().includes('react')) {
        score += 20;
        reasons.push('✅ Reactの経験を活かせるポジションです');
      }
      if (candidate.salary_min >= (intent.implicit.min_salary || 0)) {
        score += 10;
        reasons.push('✅ 希望年収条件を満たしています');
      }
      
      // スコアの上限は100
      score = Math.min(score, 100);

      // "企業評価" のプレースホルダーを追加 (Stage 4 の準備)
      const companyEval = {
        tech_score: 85,
        culture_score: 90,
        summary: "技術力が高く、モダンな開発環境が整っています。"
      };

      return {
        ...candidate,
        confidence: score,
        match_reasons: reasons,
        company_evaluation: companyEval
      };
    });
  }

  /**
   * 複数企業の技術力をバッチ評価する（モック）
   * 
   * What: 企業の技術スタック・エンジニアリング文化を評価
   * Why: Geminiの論理的分析能力を活かして技術面を評価するため
   */
  async evaluateTechBatch(companyNames: string[]): Promise<TechEvaluation[]> {
    console.log(`[MockGemini] ${companyNames.length}社の技術力をバッチ評価中...`);
    
    // 思考時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 企業ごとにダミーの技術評価を返す
    const mockData: Record<string, TechEvaluation> = {
      'SmartHR': {
        companyName: 'SmartHR',
        tech_score: 88,
        tech_stack_modernity: 92,
        engineering_culture: 85,
        summary: 'Ruby on Rails + React/TypeScriptのモダンな技術スタック。OSSへの貢献も活発。',
        strengths: ['技術ブログが充実', 'OSSへの貢献', 'モダンなCI/CD環境']
      },
      'Mercari': {
        companyName: 'Mercari',
        tech_score: 95,
        tech_stack_modernity: 98,
        engineering_culture: 92,
        summary: 'Go + Microservices + Kubernetesの先進的なアーキテクチャ。技術投資に積極的。',
        strengths: ['マイクロサービス', '機械学習基盤', 'グローバル開発体制']
      },
      'CyberAgent': {
        companyName: 'CyberAgent',
        tech_score: 82,
        tech_stack_modernity: 80,
        engineering_culture: 78,
        summary: '大規模サービス運用のノウハウが豊富。新規事業での技術チャレンジ機会あり。',
        strengths: ['大規模トラフィック対応', 'メディア技術', 'アドテク']
      }
    };
    
    return companyNames.map(name => mockData[name] || {
      companyName: name,
      tech_score: 70,
      tech_stack_modernity: 70,
      engineering_culture: 70,
      summary: '一般的なIT企業の技術水準です。',
      strengths: ['安定した技術基盤']
    });
  }

  async evaluateCompany(companyId: string, companyName: string): Promise<CompanyEvaluation> {
     return {
      summary: "技術力が高く、モダンな開発環境が整っています。",
      topics: [],
      generated_at: new Date().toISOString()
    };
  }
}
