import { SearchIntent } from '../../domain/types/SearchIntent';
import { JobWithCompanyEvaluation, ConcernScore } from './IGeminiClient';

/**
 * Gemini APIのモックレスポンス生成ユーティリティ
 * 
 * Why: NODE_ENV=demo時に本物のGemini APIを呼ばずにモックデータを返すため
 * What: 各ステージ（意図理解、求人生成、評価）のモックデータ生成関数を提供
 */

/**
 * Stage 1のモック: 検索意図の理解
 */
export async function getMockSearchIntent(query: string): Promise<SearchIntent> {
  // UI確認のため、意図的に遅延させる (2.5秒)
  console.error('⏳ [DEMO MODE] Stage 1 遅延中 (2.5s)...');
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  console.error('🎭 [DEMO MODE] モック検索意図を生成中...');
  
  // クエリから簡易的にキーワード抽出
  const lowerQuery = query.toLowerCase();
  
  // 勤務地の抽出
  const locations: string[] = [];
  if (lowerQuery.includes('東京')) locations.push('東京都');
  if (lowerQuery.includes('大阪')) locations.push('大阪府');
  if (lowerQuery.includes('京都')) locations.push('京都府');
  if (lowerQuery.includes('福岡')) locations.push('福岡県');
  if (locations.length === 0) locations.push('東京都'); // デフォルト
  
  // スキルの抽出
  const skills: string[] = [];
  if (lowerQuery.includes('react')) skills.push('React');
  if (lowerQuery.includes('typescript')) skills.push('TypeScript');
  if (lowerQuery.includes('node')) skills.push('Node.js');
  if (lowerQuery.includes('go')) skills.push('Go');
  if (lowerQuery.includes('python')) skills.push('Python');
  if (skills.length === 0) skills.push('TypeScript', 'React'); // デフォルト
  
  // 年収の抽出（簡易的な数値マッチング）
  let minSalary: number | null = null;
  const salaryMatch = query.match(/(\d+)万円/);
  if (salaryMatch) {
    minSalary = parseInt(salaryMatch[1]) * 10000;
  } else {
    minSalary = 6000000; // デフォルト600万円
  }
  
  return {
    explicit: {
      locations,
      skills,
      min_salary: minSalary
    },
    implicit: {
      role: 'フロントエンドエンジニア',
      employment_type: ['正社員'],
      min_salary: null,
      company_size: [],
      nice_to_have: ['残業少なめ', 'リモートワーク'],
      must_have: ['ワークライフバランス']
    },
    exclude: [],
    search_intent_summary: `${locations.join('または')}で、${skills.join('、')}を使用し、年収${minSalary ? (minSalary / 10000) + '万円' : '600万円'}以上の求人を探しています。`
  };
}

/**
 * Stage 2のモック: 求人候補の生成
 */
import { mockJobs as staticMockJobs } from '../../utils/mockData';

// ... (中略)

export async function getMockJobs(intent: SearchIntent): Promise<any[]> {
  // UI確認のため、意図的に遅延させる (4秒)
  console.error('⏳ [DEMO MODE] Stage 2 遅延中 (4s)...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  console.error('🎭 [DEMO MODE] モック求人を生成中...');
  
  const minSalary = intent.explicit?.min_salary || 6000000;
  
  // mockData.ts のデータを使用する
  // 年収フィルタリング
  const filtered = staticMockJobs.filter(job => {
    // salaryMinIntプロパティがあればそれを使う、なければsalary文字列からパース
    const jobMinSalary = (job as any).salaryMinInt 
      ? (job as any).salaryMinInt * 10000 
      : parseInt(job.salary.replace(/[^0-9]/g, '')) * 10000; // 簡易パース
      
    // 検索条件の年収より高いものを残すが、デモなので緩くする（-100万）
    return jobMinSalary >= (minSalary - 1000000);
  });
  
  // 意図に含まれるキーワードでソート（簡易的）
  // 実際はGeminiがやるが、モックなので単純に
  
  // そのまま返す（IDもmockDataと一致させる）
  return filtered.slice(0, 10).map(job => ({
    ...job,
    // APIレスポンスに必要な変換があればここで行う
    salary_min: (job as any).salaryMinInt * 10000,
    salary_max: (job as any).salaryMinInt * 10000 + 4000000, // 仮
    company: { name: job.company }, // APIの形式に合わせる
    skills: (job as any).languages 
      ? [...(job as any).languages, ...(job as any).frameworks] 
      : [],
    source_url: 'https://example.com/job/' + job.id
  }));
}

export async function getMockEvaluations(
  jobs: any[],
  intent: SearchIntent
): Promise<JobWithCompanyEvaluation[]> {
  // UI確認のため、意図的に遅延させる (4秒)
  console.error('⏳ [DEMO MODE] Stage 3+4 遅延中 (4s)...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  console.error('🎭 [DEMO MODE] モック評価を生成中...');
  
  const concerns = intent.implicit?.must_have || ['ワークライフバランス', '技術力'];
  
  return jobs.map((job, idx) => {
    // ランダムなスコア生成（3.0 - 4.8の範囲）
    const jobMatchScore = (3.0 + Math.random() * 1.8).toFixed(1);
    const overallScore = (3.0 + Math.random() * 1.8).toFixed(1);
    
    // スコアを数値化
    const jobScoreNum = parseFloat(jobMatchScore);
    const overallScoreNum = parseFloat(overallScore);
    
    // 企業評価の関心事項スコア
    const concernScores: Record<string, ConcernScore> = {};
    const comments = [
      "社員の口コミによると、ワークライフバランスは非常に調整しやすい環境です。",
      "技術的な挑戦を推奨する文化があり、エンジニアの定着率が高いです。",
      "評価制度が明確で、成果に応じた昇給が期待できるとの声が多いです。",
      "リモートワーク環境が整備されており、地方在住者も活躍しています。",
      "若手の育成に力を入れており、メンター制度が充実しています。",
      "プロジェクトの進行管理がしっかりしており、無理な残業は少ない傾向です。",
      "福利厚生が手厚く、特に子育て支援に関する満足度が高いです。",
      "経営陣との距離が近く、意見が通りやすいフラットな組織です。"
    ];
    
    concerns.forEach((concern, i) => {
      // 関心事項ごとのスコアも5点満点基準に (3.0 - 5.0)
      const cScore = (3.0 + Math.random() * 2.0).toFixed(1);
      
      // ランダムかつユニークなコメントを選択
      const commentIndex = (idx + i) % comments.length;
      
      concernScores[concern] = {
        concern,
        score: parseFloat(cScore) * 20, // 念のため100点満点換算値も考慮（必要に応じて）
        // 型定義上、5点満点ならここで調整
        
        summary: comments[commentIndex], // 具体的なコメント
        sources: [`https://example.com/reviews/${idx + 1}`]
      };
    });
    
    // 信頼度（85% - 99%）
    const confidence = 85 + Math.floor(Math.random() * 15);
    
    // 最終スコア (5点満点)
    const finalScore = ((jobScoreNum + overallScoreNum) / 2).toFixed(1);
    
    return {
      ...job,
      job_match_score: jobScoreNum,
      company_evaluation: {
        concerns: concernScores,
        overall_score: overallScoreNum
      },
      overall_score: parseFloat(finalScore),
      confidence
    };
  });
}
