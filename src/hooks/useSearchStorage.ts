/**
 * AI検索結果のsessionStorage管理用カスタムフック
 * 
 * Why: 検索画面で検索結果の保存・復元を簡潔に行うため
 * What: searchStorage.tsのユーティリティをReactフックとしてラップ
 * 
 * 使用例:
 * ```tsx
 * const { restoreOnMount, saveResults, clearResults } = useSearchStorage();
 * 
 * useEffect(() => {
 *   const restored = restoreOnMount();
 *   if (restored.results) {
 *     setAiResults(restored.results);
 *   }
 * }, []);
 * ```
 */

import { useCallback } from 'react';
import {
  saveSearchResults,
  restoreSearchResults,
  clearSearchResults,
  hasStoredResults,
  AISearchResult,
  AISearchIntent,
  RestoredSearchData,
} from '@/utils/searchStorage';

/**
 * 検索結果のsessionStorage管理用カスタムフック
 */
export function useSearchStorage() {
  /**
   * 検索結果を保存
   */
  const saveResults = useCallback(
    (results: AISearchResult[], intent: AISearchIntent) => {
      saveSearchResults(results, intent);
    },
    []
  );

  /**
   * 検索結果を復元（マウント時に呼び出す）
   */
  const restoreOnMount = useCallback((): RestoredSearchData => {
    return restoreSearchResults();
  }, []);

  /**
   * 検索結果をクリア
   */
  const clearResults = useCallback(() => {
    clearSearchResults();
  }, []);

  /**
   * 保存された結果があるかチェック
   */
  const hasResults = useCallback((): boolean => {
    return hasStoredResults();
  }, []);

  return {
    saveResults,
    restoreOnMount,
    clearResults,
    hasResults,
  };
}
