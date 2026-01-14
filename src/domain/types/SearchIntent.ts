export interface SearchIntent {
  explicit: {
    locations?: string[];
    skills?: string[];
    min_salary?: number | null;
    [key: string]: any;
  };
  implicit: {
    role?: string;
    employment_type?: string[];
    min_salary?: number | null;
    company_size?: string[];
    nice_to_have?: string[];
    must_have?: string[];
    [key: string]: any;
  };
  exclude?: string[];  // 除外条件
  search_intent_summary: string;
}
