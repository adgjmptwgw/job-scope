/**
 * AI検索結果のsessionStorage管理ユーティリティ
 * 
 * Why: 詳細画面から検索画面に戻った際に、検索結果を保持するため
 * What: sessionStorageへの保存・復元・クリアを型安全に行う
 * 
 * 使用方法:
 * - 保存: saveSearchResults(results, intent)
 * - 復元: const { results, intent } = restoreSearchResults()
 * - クリア: clearSearchResults()
 */

// sessionStorageのキー定数
const STORAGE_KEYS = {
  RESULTS: 'aiSearchResults',
  INTENT: 'aiSearchIntent',
  HAS_SEARCHED: 'hasSearched',
  TIMESTAMP: 'aiSearchTimestamp',
} as const;

// 結果の有効期限（ミリ秒）: 30分
const RESULTS_TTL = 30 * 60 * 1000;

/**
 * AI検索結果の型定義
 */
export interface AISearchResult {
  id: string;
  title: string;
  company: { name: string };
  location: string;
  salary_min: number;
  salary_max: number;
  source_url: string;
  skills: string[];
  description: string;
  confidence: number;
  match_reasons: string[];
  company_evaluation: {
    overall_score: number;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * AI検索意図の型定義
 */
export interface AISearchIntent {
  explicit?: {
    locations?: string[];
    skills?: string[];
    min_salary?: number | null;
  };
  implicit?: {
    role?: string;
    employment_type?: string[];
    nice_to_have?: string[];
    must_have?: string[];
  };
  search_intent_summary?: string;
  [key: string]: any;
}

/**
 * 復元結果の型定義
 */
export interface RestoredSearchData {
  results: AISearchResult[] | null;
  intent: AISearchIntent | null;
  hasSearched: boolean;
}

/**
 * 検索結果をsessionStorageに保存
 * 
 * @param results - AI検索結果の配列
 * @param intent - AI検索意図
 */
export function saveSearchResults(
  results: AISearchResult[],
  intent: AISearchIntent
): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    sessionStorage.setItem(STORAGE_KEYS.INTENT, JSON.stringify(intent));
    sessionStorage.setItem(STORAGE_KEYS.HAS_SEARCHED, 'true');
    sessionStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error('[SearchStorage] 保存に失敗しました:', error);
  }
}

/**
 * 検索結果をsessionStorageから復元
 * 
 * @returns 復元されたデータ、または空の状態
 */
export function restoreSearchResults(): RestoredSearchData {
  try {
    const resultsJson = sessionStorage.getItem(STORAGE_KEYS.RESULTS);
    const intentJson = sessionStorage.getItem(STORAGE_KEYS.INTENT);
    const hasSearched = sessionStorage.getItem(STORAGE_KEYS.HAS_SEARCHED) === 'true';
    const timestamp = sessionStorage.getItem(STORAGE_KEYS.TIMESTAMP);
    
    // 有効期限チェック
    if (timestamp) {
      const savedTime = parseInt(timestamp, 10);
      if (Date.now() - savedTime > RESULTS_TTL) {
        console.log('[SearchStorage] 結果が期限切れです。クリアします。');
        clearSearchResults();
        return { results: null, intent: null, hasSearched: false };
      }
    }
    
    if (!resultsJson || !hasSearched) {
      return { results: null, intent: null, hasSearched: false };
    }
    
    const results = JSON.parse(resultsJson) as AISearchResult[];
    const intent = intentJson ? JSON.parse(intentJson) as AISearchIntent : null;
    
    return { results, intent, hasSearched };
  } catch (error) {
    console.error('[SearchStorage] 復元に失敗しました:', error);
    return { results: null, intent: null, hasSearched: false };
  }
}

/**
 * 検索結果をクリア
 */
export function clearSearchResults(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.RESULTS);
    sessionStorage.removeItem(STORAGE_KEYS.INTENT);
    sessionStorage.removeItem(STORAGE_KEYS.HAS_SEARCHED);
    sessionStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
  } catch (error) {
    console.error('[SearchStorage] クリアに失敗しました:', error);
  }
}

/**
 * 検索結果が存在するかチェック
 */
export function hasStoredResults(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.HAS_SEARCHED) === 'true';
  } catch {
    return false;
  }
}
