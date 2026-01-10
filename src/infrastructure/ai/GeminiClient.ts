import { 
  IGeminiClient, 
  SearchConditions, 
  CompanyEvaluation
} from './IGeminiClient';

export class GeminiClient implements IGeminiClient {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

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
      
      // JSON部分を抽出 (```json ... ``` の形式に対応)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '{}';
      
      return JSON.parse(jsonText);
    } catch (error: any) {
      if (error.message?.includes('(429)')) {
        console.warn('[Gemini] Rate limit exceeded. Falling back to keyword search.');
      } else {
        console.error('Failed to parse search query:', error);
      }
      // フォールバック: 空の検索条件を返す
      return {};
    }
  }

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
  "keywords": [],  // フリーワード
  "locations": [],  // 勤務地
  "min_salary": null,  // 最低年収
  "max_salary": null,  // 最高年収
  "skills": [],  // スキル
  "employment_type": [],  // "Full-time", "Contract", "Freelance", "Part-time"
  "remote_available": null,  // true/false/null
  "experience_level": [],  // "Junior", "Middle", "Senior", "Lead"
  "company_characteristics": []  // "Startup", "Enterprise", etc.
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
      "category": "Culture",  // Culture, Management, WorkLifeBalance, Growth, Compensation
      "title": "トピックのタイトル",
      "description": "詳細な説明",
      "sentiment": "Positive",  // Positive, Negative, Neutral
      "sources": [
        { "title": "情報源のタイトル", "url": "https://example.com" }
      ]
    }
  ]
}
\`\`\`

**重要な注意事項:**
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
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
                  topP: 0.8, // Common topP
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

          // status check for retryable errors (429, 503, 500)
          // 404 (Not Found) also triggers retry in case model is missing/unavailable specifically
          if ([429, 500, 503, 404].includes(response.status)) {
               console.warn(`[Gemini] Model ${model} failed with status ${response.status}. Retrying with next model...`);
               lastError = response;
               continue;
          }
          
          // Non-retryable error (e.g. 400 Bad Request if params are wrong)
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

    // If all failed, throw or return the last error response
    if (lastError instanceof Response) {
        return lastError;
    }
    throw lastError || new Error('All models failed');
  }
}
