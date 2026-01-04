export interface SearchHistory {
  id: string;
  user_id: string;
  conditions: Record<string, any>; // 構造化された検索条件
  summary: string; // 人間可読な要約
  created_at: string;
}
