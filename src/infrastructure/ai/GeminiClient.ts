import { 
  IGeminiClient, 
  SearchConditions, 
  CompanyEvaluation,
  EvaluationTopic 
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
      const response = await fetch(
        `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
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
              temperature: 0.1,
              topP: 0.8,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      // JSON部分を抽出 (```json ... ``` の形式に対応)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '{}';
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse search query:', error);
      // フォールバック: 空の検索条件を返す
      return {};
    }
  }

  async evaluateCompany(companyId: string, companyName: string): Promise<CompanyEvaluation> {
    const prompt = this.buildCompanyEvaluationPrompt(companyName);
    
    try {
      const response = await fetch(
        `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
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
              temperature: 0.3,
              topP: 0.9,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
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
    } catch (error) {
      console.error('Failed to evaluate company:', error);
      return {
        summary: '企業評価の生成に失敗しました。',
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
}
