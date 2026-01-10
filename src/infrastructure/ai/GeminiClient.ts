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
      console.error('❌ [Stage 1] 意図理解エラー:', error.message);
      throw error; // フォールバックせずにエラーを投げる
    }
  }

  /**
   * Stage 2: Google Search Grounding を使った求人検索
   * 実際のGemini APIをGoogle Search Groundingと共に呼び出す
   */
  async searchWithGrounding(query: string): Promise<any[]> {
    console.log('\n========================================');
    console.log('🔍 [Stage 2] Google Search Grounding');
    console.log('========================================');
    console.log('📝 検索クエリ:', query);
    
    const prompt = `あなたは求人検索のエキスパートです。
以下の条件に合う日本のIT/Web系求人を検索してください。
Google検索を使って、実際に存在する求人情報を見つけてください。

【検索条件】
${query}

【指示】
1. Google検索で求人サイト（Green、Wantedly、Indeed、ビズリーチ等）から求人を探す
2. 見つかった求人情報を構造化して返す
3. 最大5件まで

【出力形式】
必ず以下のJSON形式で出力してください：

\`\`\`json
{
  "jobs": [
    {
      "title": "職種名",
      "company": "企業名",
      "location": "勤務地",
      "salary_min": 年収下限(数値),
      "salary_max": 年収上限(数値),
      "skills": ["必要スキル"],
      "source_url": "求人ページのURL",
      "description": "簡単な説明"
    }
  ]
}
\`\`\`

重要: 実際に検索で見つかった情報のみを返してください。架空の求人は作らないでください。`;

    try {
      console.log('🔄 Gemini API を呼び出し中（求人生成）...');
      
      // 注意: Google Search Groundingは Vertex AI でのみ利用可能
      // ここでは通常のGemini APIを使用して求人情報を生成
      const response = await this.generateContentWithRetry(prompt, 0.3, 4096);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API エラー:', errorText);
        throw new Error(`Gemini API error: ${response.statusText} (${response.status})`);
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      console.log('\n📤 Gemini + Google Search 生テキスト出力:');
      console.log('---');
      console.log(text.substring(0, 1000) + (text.length > 1000 ? '...' : ''));
      console.log('---');
      
      // グラウンディングメタデータをログ
      const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata) {
        console.log('\n🌐 グラウンディング情報:');
        console.log('検索クエリ:', groundingMetadata.webSearchQueries);
        console.log('ソース数:', groundingMetadata.groundingChunks?.length || 0);
      }
      
      // JSON部分を抽出
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '{"jobs":[]}';
      
      const parsed = JSON.parse(jsonText);
      const jobs = parsed.jobs || [];
      
      // IDを付与して返す
      const results = jobs.map((job: any, idx: number) => ({
        id: `grounding-job-${idx + 1}`,
        title: job.title || '不明',
        company: { name: job.company || '不明' },
        location: job.location || '不明',
        salary_min: job.salary_min || 0,
        salary_max: job.salary_max || 0,
        skills: job.skills || [],
        source_url: job.source_url || '',
        description: job.description || ''
      }));
      
      console.log(`\n✅ ${results.length}件の求人を取得`);
      results.forEach((job: any, idx: number) => {
        console.log(`  ${idx + 1}. ${job.title} @ ${job.company.name}`);
      });
      console.log('========================================\n');
      
      return results;
      
    } catch (error: any) {
      console.error('❌ [Stage 2] 求人生成エラー:', error.message);
      throw error; // フォールバックせずにエラーを投げる
    }
  }

  /**
   * Stage 3: Self-Consistency による検証
   * 実際の Gemini API を使用して求人候補を3つの異なるプロンプトで評価し、
   * 多数決により一貫性を検証する。
   */
  async evaluateConsistencyBatch(candidates: any[], intent: SearchIntent): Promise<any[]> {
    console.log('\n========================================');
    console.log('✓ [Stage 3] Self-Consistency 検証');
    console.log('========================================');
    console.log('📊 候補数:', candidates.length);
    console.log('🎯 意図:', intent.search_intent_summary);

    const validatedCandidates: any[] = [];
    
    for (const candidate of candidates) {
      console.log(`\n🔍 求人評価中: ${candidate.title} @ ${candidate.company.name}`);
      
      // 3つの異なるプロンプトで評価（ここも直列にしてより安全に）
      const prompts = [
        this.buildDirectScoringPrompt(candidate, intent),
        this.buildRequirementCheckPrompt(candidate, intent),
        this.buildCriticalReviewPrompt(candidate, intent)
      ];

      try {
        const results = [];
        for (const prompt of prompts) {
          const response = await this.generateContentWithRetry(prompt, 0.3, 1024);
          if (!response.ok) {
            results.push({ score: 0, isMatch: false, reason: 'API Error' });
            continue;
          }

          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          
          // JSON パース
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
          const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '{}';
          const parsed = JSON.parse(jsonText);

          results.push({
            score: parsed.score || 0,
            isMatch: (parsed.score || 0) >= 70,
            reason: parsed.reason || ''
          });
          
          // プロンプト間に2秒待機してレート制限を回避
          await this.sleep(2000);
        }

        // 多数決と平均値の算出
        const matchCount = results.filter(r => r.isMatch).length;
        const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
        const isFinalMatch = matchCount >= 2;
        
        // 理由の統合
        const matchReasons = results
          .filter(r => r.reason)
          .map(r => `✅ ${r.reason}`)
          .slice(0, 3);

        console.log(`  => 結果: ${isFinalMatch ? '一致' : '不一致'} (スコア: ${avgScore}, 一致数: ${matchCount}/3)`);

        validatedCandidates.push({
          ...candidate,
          confidence: Math.round((matchCount / 3) * 100),
          match_score: avgScore,
          is_match: isFinalMatch,
          match_reasons: matchReasons.length > 0 ? matchReasons : ['条件に合致しています']
        });
        
        // 求人間に4秒待機（15RPM制限を確実に守るため）
        await this.sleep(4000);

      } catch (error: any) {
        console.error(`  ❌ 評価エラー (${candidate.title}):`, error.message);
        validatedCandidates.push({
          ...candidate,
          confidence: 0,
          match_score: 0,
          is_match: false,
          match_reasons: ['評価中にエラーが発生しました']
        });
      }
    }

    // マッチしたものだけを返す（またはスコア順にソートして全て返すか検討が必要だが、
    // ここではマッチしたものを優先して返す）
    const results = validatedCandidates
      .filter(c => c.is_match)
      .sort((a, b) => b.match_score - a.match_score);

    console.log(`\n✅ 検証完了: ${results.length}/${candidates.length} 件が適合`);
    console.log('========================================\n');
    
    return results;
  }

  /**
   * パターン1: 直接的スコアリングプロンプト
   */
  private buildDirectScoringPrompt(job: any, intent: SearchIntent): string {
    return `あなたは優秀なITリクルーターです。
以下の求人がユーザーの検索意図にどの程度合致しているか、0-100点で評価してください。

【ユーザーの検索意図】
${intent.search_intent_summary}

【求人情報】
タイトル: ${job.title}
企業: ${job.company.name}
勤務地: ${job.location}
必須スキル: ${job.skills.join(', ')}
給与: ${job.salary_min} - ${job.salary_max}
説明: ${job.description}

【出力形式】
JSON形式のみで出力してください。
{
  "score": 0-100の数値,
  "reason": "合致（または不合致）する主な理由（1文）"
}`;
  }

  /**
   * パターン2: 要件チェックリストプロンプト
   */
  private buildRequirementCheckPrompt(job: any, intent: SearchIntent): string {
    const mustHave = intent.implicit?.must_have || [];
    const explicitSkills = intent.explicit?.skills || [];
    const allRequirements = [...new Set([...mustHave, ...explicitSkills])];

    return `あなたは厳格な採用審査員です。
以下の求人がユーザーの「必須条件」をすべて満たしているか厳しくチェックしてください。

【必須条件】
- スキル/要件: ${allRequirements.join(', ')}
- 勤務地: ${intent.explicit?.locations?.join(', ') || '指定なし'}
- 最低年収: ${intent.explicit?.min_salary || '指定なし'}

【求人情報】
${JSON.stringify(job)}

【指示】
すべての条件を照らし合わせ、総合的な適合スコア（0-100）を算出してください。
必須条件が大幅に欠けている場合は50点以下にしてください。

【出力形式】
JSON形式のみで出力してください。
{
  "score": 0-100の数値,
  "reason": "要件への適合状況に関するコメント（1文）"
}`;
  }

  /**
   * パターン3: 批判的検証プロンプト
   */
  private buildCriticalReviewPrompt(job: any, intent: SearchIntent): string {
    return `あなたは慎重なキャリアコンサルタントです。
この求人をユーザーに勧める上での「リスク」や「ミスマッチ」の可能性をあえて探してください。

【ユーザーの希望】
${intent.search_intent_summary}

【求人情報】
${JSON.stringify(job)}

【指示】
ネガティブな要素（条件が曖昧、スキルが微妙にズレている、年収が希望に届かない等）がないか分析し、
それでもなお勧める価値があるかを判断して0-100点でスコアを付けてください。

【出力形式】
JSON形式のみで出力してください。
{
  "score": 0-100の数値,
  "reason": "分析結果に基づく推薦理由、または注意点（1文）"
}`;
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

  /**
   * リトライ付きでGemini APIを呼び出す
   * 429エラー時は指数バックオフでリトライ
   */
  private async generateContentWithRetry(prompt: string, temperature: number, maxOutputTokens: number): Promise<Response> {
    const models = ['models/gemini-2.0-flash', 'models/gemini-flash-latest'];
    const maxRetries = 2; // 無料枠の1日あたり制限を考慮し、リトライ回数を削減
    let lastError: any = null;

    for (const model of models) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Gemini] Trying model: ${model} (attempt ${attempt + 1}/${maxRetries + 1})`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒タイムアウトに短縮

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

            // 429 Rate Limit: 指数バックオフでリトライ
            if (response.status === 429) {
              const waitTime = Math.pow(2, attempt) * 5000; // 5秒, 10秒... (間隔を広げて回数を減らす)
              console.warn(`⏳ [Gemini] Rate limit (429). ${waitTime/1000}秒後にリトライ...`);
              await this.sleep(waitTime);
              continue; // 同じモデルでリトライ
            }

            // 500, 503: サーバーエラー - 次のモデルへ
            if ([500, 503, 404].includes(response.status)) {
              console.warn(`[Gemini] Model ${model} failed with status ${response.status}. Trying next model...`);
              lastError = response;
              break; // 次のモデルへ
            }
            
            // その他のエラーはそのまま返す
            return response;

          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              console.warn(`[Gemini] Timeout with model ${model}. Trying next model...`);
              lastError = new Error(`Timeout with model ${model}`);
              break; // 次のモデルへ
            } else {
              throw fetchError;
            }
          }

        } catch (error) {
          console.warn(`[Gemini] Network error with model ${model}. Retrying...`, error);
          lastError = error;
        }
      }
    }

    if (lastError instanceof Response) {
      return lastError;
    }
    throw lastError || new Error('All models failed');
  }

  /**
   * 指定ミリ秒待機
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
