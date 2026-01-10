import { 
  IGeminiClient, 
  SearchConditions, 
  CompanyEvaluation,
  TechEvaluation
} from './IGeminiClient';
import { SearchIntent } from '../../domain/types/SearchIntent';

/**
 * Gemini API クライアント
 * Stage 1 は実際のAPIを使用、Stage 2-4 はモック実装
 */
export class GeminiClient implements IGeminiClient {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 既存の検索クエリパース（旧実装）
   */
  async parseSearchQuery(query: string): Promise<SearchConditions> {
    const prompt = this.buildSearchQueryPrompt(query);
    console.log('[Gemini] parseSearchQuery called with:', query);
    
    try {
      if (!this.apiKey) {
        console.error('[Gemini] API Key is missing!');
        return {};
      }

      console.log('[Gemini] Sending request to Google API...');
      const response = await this.generateContentWithRetry(prompt, 0.1, 1024);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API Error Detail: ${errorText}`);
        throw new Error(`Gemini API error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '{}';
      
      return JSON.parse(jsonText);
    } catch (error: any) {
      if (error.message?.includes('(429)')) {
        console.warn('[Gemini] Rate limit exceeded. Falling back to keyword search.');
      } else {
        console.error('Failed to parse search query:', error);
      }
      return {};
    }
  }

  /**
   * Stage 1: Chain-of-Thought を使った意図理解
   * 実際のGemini APIを呼び出してユーザーの検索意図を解析する
   */
  async parseQueryWithCoT(query: string): Promise<SearchIntent> {
    console.log('\n========================================');
    console.log('🧠 [Stage 1] Chain-of-Thought 意図理解');
    console.log('========================================');
    console.log('📝 入力クエリ:', query);
    
    const prompt = this.buildCoTPrompt(query);
    
    try {
      console.log('🔄 Gemini API を呼び出し中...');
      const response = await this.generateContentWithRetry(prompt, 0.2, 2048);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API エラー:', errorText);
        throw new Error(`Gemini API error: ${response.statusText} (${response.status})`);
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      console.log('\n📤 Gemini 生テキスト出力:');
      console.log('---');
      console.log(text);
      console.log('---');
      
      // JSON部分を抽出
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '{}';
      
      const parsed = JSON.parse(jsonText);
      
      console.log('\n✅ パース結果:');
      console.log(JSON.stringify(parsed, null, 2));
      console.log('========================================\n');
      
      return {
        explicit: parsed.explicit || {
          locations: [],
          skills: [],
          min_salary: null
        },
        implicit: parsed.implicit || {
          role: undefined,
          employment_type: [],
          min_salary: null,
          company_size: [],
          nice_to_have: [],
          must_have: []
        },
        search_intent_summary: parsed.search_intent_summary || `「${query}」の検索結果`
      };
    } catch (error: any) {
      console.error('❌ [Stage 1] エラー発生:', error.message);
      return {
        explicit: {
          locations: [],
          skills: [],
          min_salary: null
        },
        implicit: {
          role: undefined,
          employment_type: [],
          min_salary: null,
          company_size: [],
          nice_to_have: []
        },
        search_intent_summary: `「${query}」の検索結果`
      };
    }
  }

  /**
   * Stage 2: Google Search Grounding を使った検索（モック実装）
   */
  async searchWithGrounding(query: string): Promise<any[]> {
    console.log('\n========================================');
    console.log('🔍 [Stage 2] Google Search Grounding (モック)');
    console.log('========================================');
    console.log('📝 検索クエリ:', query);
    console.log('⚠️ モックデータを使用中...');
    
    const mockResults = [
      {
        id: 'job-001',
        title: 'Senior React Engineer',
        company: { name: 'SmartHR' },
        location: '東京都渋谷区',
        salary_min: 8000000,
        salary_max: 12000000,
        skills: ['React', 'TypeScript', 'Next.js'],
        source_url: 'https://example.com/job/001',
        description: 'SmartHRでのフロントエンド開発'
      },
      {
        id: 'job-002',
        title: 'Frontend Developer (React)',
        company: { name: 'Mercari' },
        location: '東京都 (Remote)',
        salary_min: 9000000,
        salary_max: 15000000,
        skills: ['React', 'GraphQL'],
        source_url: 'https://example.com/job/002',
        description: 'メルカリでのWeb開発'
      },
      {
        id: 'job-003',
        title: 'Web Engineer',
        company: { name: 'CyberAgent' },
        location: '東京都渋谷区',
        salary_min: 7000000,
        salary_max: 11000000,
        skills: ['React', 'Vue.js', 'TypeScript'],
        source_url: 'https://example.com/job/003',
        description: 'サイバーエージェントでのメディア開発'
      }
    ];
    
    console.log(`✅ ${mockResults.length}件の求人を取得`);
    console.log('========================================\n');
    
    return mockResults;
  }

  /**
   * Stage 3: Self-Consistency による検証（モック実装）
   */
  async evaluateConsistencyBatch(candidates: any[], intent: SearchIntent): Promise<any[]> {
    console.log('\n========================================');
    console.log('✓ [Stage 3] Self-Consistency 検証 (モック)');
    console.log('========================================');
    console.log('📊 候補数:', candidates.length);
    console.log('🎯 意図:', intent.search_intent_summary);
    
    const validated = candidates.map((c, idx) => ({
      ...c,
      confidence: 100 - idx * 10,
      match_reasons: [
        `✅ ${c.skills?.[0] || 'スキル'}の経験を活かせるポジションです`,
        '✅ 希望年収の条件を満たしています'
      ]
    }));
    
    console.log('✅ 検証完了');
    console.log('========================================\n');
    
    return validated;
  }

  /**
   * Stage 4: 技術力評価バッチ（モック実装）
   */
  async evaluateTechBatch(companyNames: string[]): Promise<TechEvaluation[]> {
    console.log('\n========================================');
    console.log('💻 [Stage 4a] 技術力評価 (モック)');
    console.log('========================================');
    console.log('🏢 対象企業:', companyNames.join(', '));
    
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
        tech_score: 92,
        tech_stack_modernity: 95,
        engineering_culture: 90,
        summary: 'マイクロサービス + Go/Kubernetesの先進的なアーキテクチャ。',
        strengths: ['カンファレンス登壇多数', 'グローバル開発', 'SRE文化']
      },
      'CyberAgent': {
        companyName: 'CyberAgent',
        tech_score: 78,
        tech_stack_modernity: 80,
        engineering_culture: 75,
        summary: '多様な技術スタックでチームにより異なる。メディア系はReact/Next.js。',
        strengths: ['内製ツールの開発', '大規模トラフィック経験', '新規事業の機会']
      }
    };
    
    const results = companyNames.map(name => mockData[name] || {
      companyName: name,
      tech_score: 70,
      tech_stack_modernity: 70,
      engineering_culture: 70,
      summary: '評価データなし',
      strengths: []
    });
    
    console.log('✅ 技術評価完了');
    console.log('========================================\n');
    
    return results;
  }

  /**
   * 企業評価（既存実装）
   */
  async evaluateCompany(companyId: string, companyName: string): Promise<CompanyEvaluation> {
    const prompt = this.buildCompanyEvaluationPrompt(companyName);
    
    try {
      const response = await this.generateContentWithRetry(prompt, 0.3, 2048);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API Error Detail: ${errorText}`);
        throw new Error(`Gemini API error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '{}';
      
      const parsed = JSON.parse(jsonText);
      
      return {
        summary: parsed.summary || '情報が不足しています。',
        topics: parsed.topics || [],
        generated_at: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.message?.includes('(429)')) {
        console.warn('[Gemini] Rate limit exceeded. Cannot evaluate company at this time.');
      } else {
        console.error('Failed to evaluate company:', error);
      }
      return {
        summary: '現在、アクセス集中により企業評価を生成できません。',
        topics: [],
        generated_at: new Date().toISOString(),
      };
    }
  }

  // ========== プライベートメソッド ==========

  /**
   * Chain-of-Thought プロンプトを構築
   */
  private buildCoTPrompt(query: string): string {
    return `あなたは優秀なITキャリアアドバイザーです。
ユーザーの求人検索クエリを深く分析し、明示的な条件と暗黙的な希望の両方を抽出してください。

【ユーザー入力】
${query}

【分析タスク】
1. まず、ユーザーが明示的に述べている条件を抽出してください
2. 次に、文脈から推測できる暗黙の希望を推論してください
3. 最後に、検索意図を1文で要約してください

【出力形式】
必ず以下のJSON形式で出力してください。説明文は不要です。

\`\`\`json
{
  "explicit": {
    "locations": ["勤務地の配列"],
    "skills": ["スキルの配列"],
    "min_salary": 8000000
  },
  "implicit": {
    "role": "推測される職種",
    "employment_type": ["正社員など"],
    "min_salary": null,
    "company_size": ["Startup", "Enterprise", "SME"],
    "nice_to_have": ["あれば嬉しい条件"],
    "must_have": ["必須条件"]
  },
  "search_intent_summary": "ユーザーの検索意図を1文で要約"
}
\`\`\`

重要: 推測できない項目はnullまたは空配列にしてください。架空のデータを作らないでください。`;
  }

  private buildSearchQueryPrompt(query: string): string {
    return `あなたは優秀なIT専門の採用担当者兼データアナリストです。
ユーザーの曖昧な要望から、具体的な検索条件を推論・抽出することが求められます。

以下のユーザー入力を解析し、JSON形式で検索条件を出力してください。
推論できない項目は null または空配列としてください。嘘のデータを生成してはいけません。

【ユーザー入力】
${query}

【出力スキーマ】
\`\`\`json
{
  "keywords": [],
  "locations": [],
  "min_salary": null,
  "max_salary": null,
  "skills": [],
  "employment_type": [],
  "remote_available": null,
  "experience_level": [],
  "company_characteristics": []
}
\`\`\`

出力は上記のJSON形式のみとし、説明文は不要です。`;
  }

  private buildCompanyEvaluationPrompt(companyName: string): string {
    return `あなたは企業評価の専門家です。
以下の企業について、客観的な評価を行ってください。

企業名: ${companyName}

以下のJSON形式で出力してください：

\`\`\`json
{
  "summary": "企業の総合的な評価（1〜2文）",
  "topics": [
    {
      "category": "Culture",
      "title": "トピックのタイトル",
      "description": "詳細な説明",
      "sentiment": "Positive",
      "sources": [
        { "title": "情報源のタイトル", "url": "https://example.com" }
      ]
    }
  ]
}
\`\`\`

重要な注意事項:
1. 必ず根拠となる情報源（sources）を含めること
2. 推測や架空の情報は含めないこと
3. 各トピックはPositive/Negative/Neutralを明確にすること

出力は上記のJSON形式のみとし、説明文は不要です。`;
  }

  private async generateContentWithRetry(prompt: string, temperature: number, maxOutputTokens: number): Promise<Response> {
    const models = ['models/gemini-2.0-flash', 'models/gemini-flash-latest'];
    let lastError: any = null;

    for (const model of models) {
      try {
        console.log(`[Gemini] Trying model: ${model}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(
            `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }],
                generationConfig: {
                  temperature,
                  topP: 0.8,
                  maxOutputTokens,
                },
              }),
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
             return response;
          }

          if ([429, 500, 503, 404].includes(response.status)) {
               console.warn(`[Gemini] Model ${model} failed with status ${response.status}. Retrying with next model...`);
               lastError = response;
               continue;
          }
          
          return response;

        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
             console.warn(`[Gemini] Timeout with model ${model}. Retrying...`);
             lastError = new Error(`Timeout with model ${model}`);
          } else {
             throw fetchError;
          }
        }

      } catch (error) {
        console.warn(`[Gemini] Network error with model ${model}. Retrying...`, error);
        lastError = error;
      }
    }

    if (lastError instanceof Response) {
        return lastError;
    }
    throw lastError || new Error('All models failed');
  }
}
