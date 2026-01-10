"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Building2, MapPin, DollarSign, Star, Sparkles, Ban, Heart, Code, Globe, ChevronDown, X, RotateCcw, Zap, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockJobs, setSelectedJobForDetail, toggleFavorite, isFavorite, TECH_STACK_SUGGESTIONS, LOCATION_SUGGESTIONS } from "@/utils/mockData";
import { createClient } from "@/lib/supabase/client";
import { AISearchLoading } from "@/components/search/AISearchLoading";
import { AISearchInsight } from "@/components/search/AISearchInsight";
import { AIJobCard } from "@/components/search/AIJobCard";

interface SearchHistoryItem {
  id: string;
  summary: string;
  conditions: any;
  created_at: string;
}

/**
 * What: メインの検索画面コンポーネント。
 * Why: 自然文検索、詳細フィルタリング、検索履歴管理のための統合インターフェースを提供します。
 *      ユーザー入力、URLパラメータ、APIレスポンス間の複雑な状態相互作用を管理します。
 */
const SearchScreen: React.FC = () => {
  const [naturalLanguageSearch, setNaturalLanguageSearch] = useState("");
  // ページネーションとソートの状態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [sortBy, setSortBy] = useState("score_desc");
  const [excludeConditions, setExcludeConditions] = useState("");
  const [selectedTechTags, setSelectedTechTags] = useState<string[]>([]);
  const [techInputValue, setTechInputValue] = useState("");
  const [selectedLocationTags, setSelectedLocationTags] = useState<string[]>([]);
  const [locationInputValue, setLocationInputValue] = useState("");
  const [techInputKey, setTechInputKey] = useState(0);
  const [locationInputKey, setLocationInputKey] = useState(0);
  const techInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [minSalary, setMinSalary] = useState(0);
  const [selectedWorkStyles, setSelectedWorkStyles] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // AI検索結果
  const [aiIntent, setAiIntent] = useState<any>(null); // AI解釈結果
  const [aiResults, setAiResults] = useState<any[]>([]); // AI検索結果
  const [aiError, setAiError] = useState<string | null>(null); // AI検索エラー
  
  // 技術提案の状態
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  // 場所提案の状態
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);

  // 検索履歴の状態
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  
  // マウント時に履歴を取得
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session check:", !!session);
        if (session) {
          const res = await fetch('/api/history');
          console.log("History fetch status:", res.status);
          if (res.ok) {
            const data = await res.json();
            console.log("History data:", data);
            setSearchHistory(data);
          }
        } else {
            setSearchHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
    
    // Auth状態の変更を監視
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            fetchHistory();
        } else if (event === 'SIGNED_OUT') {
            setSearchHistory([]);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);
  
  // 履歴保存中かどうかを管理するRef (二重保存防止)
  const isSavingHistory = useRef(false);

  // 再マウント後に入力にフォーカスを当てる
  useEffect(() => {
    if (techInputKey > 0) techInputRef.current?.focus();
  }, [techInputKey]);

  useEffect(() => {
    if (locationInputKey > 0) locationInputRef.current?.focus();
  }, [locationInputKey]);

  // 検索条件変更時にページネーションをリセット
  useEffect(() => {
    setCurrentPage(1);
    // ... ページネーションのリセットロジック
  }, [naturalLanguageSearch, excludeConditions, selectedTechTags, selectedLocationTags, minSalary, selectedWorkStyles]);

  const router = useRouter();

  /**
   * What: 検索実行のコア機能。
   * Why: 「新規検索」（ユーザー入力から）と「履歴復元」（バッジクリックから）の間で一貫性を保つため、検索ロジックを一元化します。
   *      検索実行をイベントハンドラから分離することで、偽のイベントオブジェクトを必要とせずにプログラムで検索をトリガーできます。
   *      `shouldSaveHistory` フラグは、履歴アイテムを復元して再検索した際に、重複した新しい履歴アイテムが作成される無限ループを防ぐために重要です。
   * 
   * @param conditions 実行する検索条件。nullの場合、現在のコンポーネント状態を使用します。
   * @param shouldSaveHistory この検索を履歴データベースに保存するかどうか。新規検索の場合はtrue、履歴復元の場合はfalse。
   */
  const executeSearch = async (conditions: any, shouldSaveHistory: boolean) => {
    if (isSearching) {
      console.log("Search already in progress, skipping.");
      return;
    }

    setIsSearching(true);
    
    // UIの状態も同期させる (履歴からの復元時などに重要)
    if (conditions) {
        setNaturalLanguageSearch(conditions.naturalLanguageSearch || "");
        setExcludeConditions(conditions.excludeConditions || "");
        setSelectedTechTags(conditions.selectedTechTags || []);
        setSelectedLocationTags(conditions.selectedLocationTags || []);
        setMinSalary(conditions.minSalary || 0);
        setSelectedWorkStyles(conditions.selectedWorkStyles || []);
        
        // 外部入力からの実行の場合、入力欄のキーをリセットして再描画を促す
        if (!shouldSaveHistory) {
             setTechInputKey(prev => prev + 1);
             setLocationInputKey(prev => prev + 1);
        }
    }

    // 検索に使用するパラメータ（引数で渡されたものがあればそれを、なければ現在のStateを使用）
    const searchParams = conditions || {
        naturalLanguageSearch,
        excludeConditions,
        selectedTechTags,
        selectedLocationTags,
        minSalary,
        selectedWorkStyles
    };

    try {
      // クエリパラメータの構築
      const params = new URLSearchParams();
      if (searchParams.naturalLanguageSearch) params.append('q', searchParams.naturalLanguageSearch);
      if (searchParams.excludeConditions) params.append('exclude', searchParams.excludeConditions);
      
      (searchParams.selectedLocationTags || []).forEach((loc: string) => params.append('locations', loc));
      (searchParams.selectedTechTags || []).forEach((skill: string) => params.append('skills', skill));
      
      if (searchParams.minSalary > 0) params.append('min_salary', (searchParams.minSalary * 10000).toString());
      
      // 実際のAPIコール
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // レスポンスデータのマッピング
      const mappedResults = data.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company.name,
        companyLogo: job.company.logo_url || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=200&auto=format&fit=crop",
        location: job.location,
        salary: `${(job.salary_min / 10000).toLocaleString()}万円 - ${(job.salary_max / 10000).toLocaleString()}万円`,
        salaryMinInt: job.salary_min / 10000,
        description: "",
        languages: job.skills || [],
        frameworks: [],
        infrastructure: [],
        score: job.ai_matching_score || 0,
        tags: job.company.tags || [],
        sourceUrl: job.source_url,
        workStyles: job.work_styles || [],
        createdAt: job.created_at
      }));

      // 結果のソート
      const sortedResults = [...mappedResults].sort((a: any, b: any) => {
          if (sortBy === "score_desc") return (b.score || 0) - (a.score || 0);
          if (sortBy === "salary_desc") return b.salaryMinInt - a.salaryMinInt;
          return 0;
      });

      setSearchResults(sortedResults);
      setHasSearched(true);

      // 検索履歴を保存
      if (shouldSaveHistory) {
        console.log("Calling saveSearchHistory from executeSearch.");
        saveSearchHistory(
            searchParams.naturalLanguageSearch,
            searchParams.excludeConditions,
            searchParams.selectedTechTags,
            searchParams.selectedLocationTags,
            searchParams.minSalary,
            searchParams.selectedWorkStyles
        ).catch(err => console.error("Background history save failed:", err));
      }

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
      setCurrentPage(1);
    }
  };

  /**
   * What: 検索ボタン/フォーム送信のイベントハンドラ。
   * Why: ユーザーが検索を開始するための主要なエントリポイントとして機能します。
   *      ユーザー主導の検索は常に記録されるべきであるため、常に `shouldSaveHistory: true` を強制します。
   */
  const handleSearch = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // 自然文クエリがあればAI検索を実行
    if (naturalLanguageSearch.trim()) {
      await executeAISearch(naturalLanguageSearch);
      return;
    }
    
    // 詳細条件のみの場合は通常検索
    await executeSearch({
        naturalLanguageSearch,
        excludeConditions,
        selectedTechTags,
        selectedLocationTags,
        minSalary,
        selectedWorkStyles
    }, true);
  };

  /**
   * What: AI検索を実行する関数
   * Why: Chain-of-Thought + Google Grounding + Self-Consistency + Multi-Model の4段階AI処理を呼び出す
   */
  const executeAISearch = async (query: string) => {
    if (isSearching || !query.trim()) return;
    
    setIsSearching(true);
    setAiIntent(null);
    setAiResults([]);
    setAiError(null);
    setHasSearched(false);
    
    try {
      const response = await fetch(`/api/search/cot?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI Search failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAiIntent(data.data.intent);
        setAiResults(data.data.candidates);
      }
      
      setHasSearched(true);
    } catch (error: any) {
      console.error('AI Search error:', error);
      setAiError(error.message === 'Internal Server Error' 
        ? 'AI検索でエラーが発生しました。時間をおいて再度お試しください。' 
        : error.message);
    } finally {
      setIsSearching(false);
    }
  };

  // 最後に保存した条件を保持するRef（同期的な重複チェック用）
  const lastSavedConditionsRef = useRef<any>(null);

  /**
   * What: 検索条件をデータベースに保存します。
   * Why: 将来の使用のためにユーザーのコンテキストを保存します。
   *      堅牢な重複排除ロジックを含みます：
   *      1. 同期的なRefチェック (`lastSavedConditionsRef`): Reactの再レンダリングやダブルクリックによる連打保存を防ぎます。
   *      2. 非同期的なStateチェック (`searchHistory[0]`): 最新の履歴アイテムと完全に同一の検索を保存することを防ぎます。
   * 
   *      また、意味的に同一の検索が正しく重複として識別されるように、
   *      ペイロードの要約（テキストの切り捨て）とデータの正規化（配列のソート）も処理します。
   */
  const saveSearchHistory = async (
    q: string, 
    exclude: string,
    techTags: string[], 
    locationTags: string[], 
    minSalary: number, 
    workStyles: string[]
  ) => {
    if (isSavingHistory.current) {
        console.log("saveSearchHistory: Already saving, skipping duplicate call.");
        return;
    }

    isSavingHistory.current = true;
    console.log("saveSearchHistory START:", { q, exclude, techTags, locationTags, minSalary, workStyles });

    try {
      // 配列のコピーを作成してからソート（元の配列を破壊しないため）
      const sortedTechTags = [...(techTags || [])].sort();
      const sortedLocationTags = [...(locationTags || [])].sort();
      const sortedWorkStyles = [...(workStyles || [])].sort();

      const conditions = {
        naturalLanguageSearch: q,
        excludeConditions: exclude,
        selectedTechTags: techTags,
        selectedLocationTags: locationTags,
        minSalary,
        selectedWorkStyles: workStyles
      };

      // 1. Refを使った同期的な重複チェック
      if (lastSavedConditionsRef.current) {
        const last = lastSavedConditionsRef.current;
        const isSameRef = 
          (last.naturalLanguageSearch || "") === (conditions.naturalLanguageSearch || "") &&
          (last.excludeConditions || "") === (conditions.excludeConditions || "") &&
          last.minSalary === conditions.minSalary &&
          JSON.stringify([...(last.selectedTechTags || [])].sort()) === JSON.stringify(sortedTechTags) &&
          JSON.stringify([...(last.selectedLocationTags || [])].sort()) === JSON.stringify(sortedLocationTags) &&
          JSON.stringify([...(last.selectedWorkStyles || [])].sort()) === JSON.stringify(sortedWorkStyles);
          
        if (isSameRef) {
          console.log("saveSearchHistory: Duplicate search (Ref check), skipping history save");
          return;
        }
      }

      // 2. 既存の履歴との重複チェック
      if (searchHistory.length > 0) {
        const latest = searchHistory[0].conditions;
        if (latest) {
             const isSameState = 
               (latest.naturalLanguageSearch || "") === (conditions.naturalLanguageSearch || "") &&
               (latest.excludeConditions || "") === (conditions.excludeConditions || "") &&
               (latest.minSalary || 0) === (conditions.minSalary || 0) &&
               JSON.stringify([...(latest.selectedTechTags || [])].sort()) === JSON.stringify(sortedTechTags) &&
               JSON.stringify([...(latest.selectedLocationTags || [])].sort()) === JSON.stringify(sortedLocationTags) &&
               JSON.stringify([...(latest.selectedWorkStyles || [])].sort()) === JSON.stringify(sortedWorkStyles);
               
             if (isSameState) {
               console.log("saveSearchHistory: Duplicate search (State check), skipping history save");
               lastSavedConditionsRef.current = conditions;
               return;
             }
        }
      }

      lastSavedConditionsRef.current = conditions;

      // サマリー生成
      const parts = [];
      if (locationTags.length > 0) parts.push(locationTags.join(", "));
      if (minSalary > 0) parts.push(`${minSalary}万円以上`);
      if (techTags.length > 0) parts.push(techTags.join(", "));
      if (workStyles.length > 0) parts.push(workStyles.join(", "));
      
      if (exclude) {
        const truncExclude = exclude.length > 10 ? exclude.slice(0, 10) + "..." : exclude;
        parts.push(`除外: ${truncExclude}`);
      }
      
      if (q) {
        const truncQ = q.length > 15 ? q.slice(0, 15) + "..." : q;
        parts.push(truncQ);
      }
      
      const summary = parts.length > 0 ? parts.join(", ").slice(0, 60) + (parts.join(", ").length > 60 ? "..." : "") : "条件なし";

      console.log("saveSearchHistory: Sending API request...", summary);
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary, conditions }),
      });
      
      if (res.ok) {
        console.log("saveSearchHistory: Success. Refreshing list...");
        const historyRes = await fetch('/api/history');
        if (historyRes.ok) {
          const data = await historyRes.json();
          setSearchHistory(data);
        }
      } else {
          console.error("saveSearchHistory: API Error", res.status);
      }
    } catch (e) {
      console.error("saveSearchHistory: Exception", e);
    } finally {
        isSavingHistory.current = false;
        console.log("saveSearchHistory: END");
    }
  };

  /**
   * What: 履歴アイテムから検索条件を復元します。
   * Why: ユーザーが過去の検索を再現できるようにします。
   *      重要な点として、`shouldSaveHistory: false` で `executeSearch` を呼び出します。
   *      これにより、履歴アイテムをクリックしただけで、リストの先頭に同一の新しい履歴アイテムが作成される「履歴ループ」のバグを防ぎます。
   *      また、実行された検索を反映するようにUIの状態（タグ、入力欄）を再構築します。
   */
  const handleHistorySelect = (history: SearchHistoryItem) => {
    // 履歴データから検索条件をフォームに復元（検索は実行しない）
    if (history.conditions) {
      let restoredMinSalary = 0;
      const salary = history.conditions.minSalary || history.conditions.min_salary;
      const salaryNum = typeof salary === 'number' ? salary : parseInt(salary || '0', 10);
      restoredMinSalary = salaryNum > 10000 ? salaryNum / 10000 : salaryNum;

      // フォームの状態を復元
      setNaturalLanguageSearch(history.conditions.naturalLanguageSearch || history.conditions.keywords?.join(", ") || "");
      setExcludeConditions(history.conditions.excludeConditions || "");
      setSelectedTechTags(history.conditions.selectedTechTags || history.conditions.skills || []);
      setSelectedLocationTags(history.conditions.selectedLocationTags || history.conditions.locations || []);
      setMinSalary(restoredMinSalary);
      setSelectedWorkStyles(history.conditions.selectedWorkStyles || history.conditions.employment_type || []);
      
      // 入力欄を再マウント
      setTechInputKey(prev => prev + 1);
      setLocationInputKey(prev => prev + 1);

      // 詳細フィルターを開く（復元した条件を見せるため）
      if (!isFiltersOpen) {
        setIsFiltersOpen(true);
      }
      
      // 検索は実行しない - ユーザーが検索ボタンを押すまで待つ
    }
  };

  // ソートオプション変更時に再ソート（現在は全結果があるためクライアントサイドのみ）
  useEffect(() => {
    if (searchResults.length > 0) {
      const sorted = [...searchResults].sort((a, b) => {
        if (sortBy === "score_desc") return b.score - a.score;
        if (sortBy === "salary_desc") return b.salaryMinInt - a.salaryMinInt;
        return 0;
      });
      // ループ回避のため実際に順序が変わったか確認（IDによる単純な等価チェック）
      const currentIds = searchResults.map(r => r.id).join(',');
      const newIds = sorted.map(r => r.id).join(',');
      if (currentIds !== newIds) {
        setSearchResults(sorted);
      }
    }
  }, [sortBy]);


  // ページネーション計算
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const paginatedResults = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (job: any) => {
    setSelectedJobForDetail(job);
    router.push(`/jobs/${job.id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    toggleFavorite(jobId);
    // ハートアイコンを更新するために強制再レンダリング
    setSearchResults([...searchResults]);
  };

  const handleClear = () => {
    setNaturalLanguageSearch("");
    setExcludeConditions("");
    setSelectedTechTags([]);
    setTechInputValue("");
    setSelectedLocationTags([]);
    setLocationInputValue("");
    setMinSalary(0);
    setSelectedWorkStyles([]);
    // 入力を強制的に再マウントするためにキーをリセット
    setTechInputKey(prev => prev + 1);
    setLocationInputKey(prev => prev + 1);
  };

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 4.5) return "success";
    if (numScore >= 3.5) return "default";
    return "secondary";
  };

  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTechInputValue(value);

    const currentWord = value.trim().toLowerCase();

    if (currentWord.length > 0) {
      const filtered = TECH_STACK_SUGGESTIONS.filter(item => 
        item.toLowerCase().includes(currentWord) && 
        !selectedTechTags.includes(item)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInputValue(value);

    const currentWord = value.trim().toLowerCase();

    if (currentWord.length > 0) {
      const filtered = LOCATION_SUGGESTIONS.filter((item: { name: string; reading: string }) => 
        (item.name.includes(currentWord) || item.reading.includes(currentWord)) && 
        !isDuplicateLocation(item.name, selectedLocationTags)
      ).map((item: { name: string }) => item.name).slice(0, 5);
      
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(filtered.length > 0);
      setActiveLocationIndex(0);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const normalizeLocation = (loc: string) => {
    return loc.trim().toLowerCase().replace(/[都道府県]$/, "");
  };

  const isDuplicateLocation = (newLoc: string, currentTags: string[]) => {
    const normalizedNew = normalizeLocation(newLoc);
    return currentTags.some(tag => normalizeLocation(tag) === normalizedNew);
  };

  const handleLocationSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showLocationSuggestions && locationSuggestions.length > 0) {
        handleLocationSelect(locationSuggestions[activeLocationIndex]);
      } else if (locationInputValue.trim()) {
        const val = locationInputValue.trim();
        if (!isDuplicateLocation(val, selectedLocationTags)) {
          setSelectedLocationTags([...selectedLocationTags, val]);
        }
        setLocationInputValue("");
        setLocationInputKey(prev => prev + 1);
      }      
    } else if (e.key === "ArrowDown" && showLocationSuggestions) {
      e.preventDefault();
      setActiveLocationIndex(prev => (prev + 1) % locationSuggestions.length);
    } else if (e.key === "ArrowUp" && showLocationSuggestions) {
      e.preventDefault();
      setActiveLocationIndex(prev => (prev - 1 + locationSuggestions.length) % locationSuggestions.length);
    } else if (e.key === "Escape") {
      setShowLocationSuggestions(false);
    } else if (e.key === "Backspace" && locationInputValue === "" && selectedLocationTags.length > 0) {
      setSelectedLocationTags(selectedLocationTags.slice(0, -1));
    }
  };

  const handleLocationSelect = (location: string) => {
    if (!isDuplicateLocation(location, selectedLocationTags)) {
      setSelectedLocationTags([...selectedLocationTags, location]);
    }
    setLocationInputValue("");
    setShowLocationSuggestions(false);
    setLocationInputKey(prev => prev + 1);
  };

  const removeLocationTag = (tagToRemove: string) => {
    setSelectedLocationTags(selectedLocationTags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionSelect = (suggestion: string) => {
    if (!selectedTechTags.includes(suggestion)) {
      setSelectedTechTags([...selectedTechTags, suggestion]);
    }
    // IMEバッファをクリアするために強制再マウント
    setTechInputValue("");
    setShowSuggestions(false);
    setTechInputKey(prev => prev + 1);
  };

  const removeTechTag = (tagToRemove: string) => {
    setSelectedTechTags(selectedTechTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        handleSuggestionSelect(suggestions[activeSuggestionIndex]);
      } else if (techInputValue.trim()) {
        const val = techInputValue.trim();
        if (!selectedTechTags.includes(val)) {
          setSelectedTechTags([...selectedTechTags, val]);
        }
        // 再マウントによる自由入力の堅牢なクリア
        setTechInputValue("");
        setShowSuggestions(false);
        setTechInputKey(prev => prev + 1);
      }
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && techInputValue === "" && selectedTechTags.length > 0) {
      // 入力が空の場合、最後のタグを削除
      removeTechTag(selectedTechTags[selectedTechTags.length - 1]);
    }
  };



  return (
    <div className="w-full space-y-12">
      {/* 検索フォームカード */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl border-border/50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-4 text-2xl">
              <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              求人検索
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 p-10">
            <div className="flex flex-col gap-6">
              {/* 自然言語検索 */}
              <div className="grid gap-3">
                <Label htmlFor="search" className="flex items-center gap-2 text-lg font-bold leading-relaxed tracking-wide text-foreground/90">
                  <Sparkles className="w-5 h-5 text-primary" />
                  自然文検索条件
                </Label>
                <Textarea
                  id="search"
                  rows={4}
                  className="resize-none text-base h-auto min-h-[120px] rounded-xl border-2 px-4 py-3 bg-card/50 leading-relaxed"
                  placeholder="例: リモートワーク可能で、ReactとTypeScriptを使った開発経験が3年以上ある企業の求人"
                  value={naturalLanguageSearch}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNaturalLanguageSearch(e.target.value)}
                />
              </div>

              {/* 詳細フィルター切り替え */}
              <div className="pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="p-0 hover:bg-transparent text-primary flex items-center gap-2 font-bold"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFiltersOpen ? "rotate-180" : ""}`} />
                  {isFiltersOpen ? "詳細条件を隠す" : "詳細条件を表示（言語・年収等）"}
                </Button>
              </div>

              {/* 詳細フィルター内容 */}
              <AnimatePresence>
                {isFiltersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 pb-2">
                      {/* 技術スタックとタグ */}
                      <div className="grid gap-3 relative md:col-span-2">
                        <Label htmlFor="tech" className="flex items-center gap-2 text-base font-bold text-foreground/80">
                          <Code className="w-4 h-4 text-primary" />
                          言語・フレームワーク・インフラ
                        </Label>
                        <div className="min-h-14 w-full flex flex-wrap items-center gap-2 p-3 border-2 rounded-xl bg-card/50 transition-all focus-within:border-primary">
                          {selectedTechTags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="px-3 py-1 flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                            >
                              {tag}
                              <button 
                                onClick={() => removeTechTag(tag)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          <Input
                            key={`tech-${techInputKey}`}
                            id="tech"
                            ref={techInputRef}
                            placeholder={selectedTechTags.length === 0 ? "例: React, Go, AWS, Docker" : ""}
                            value={techInputValue}
                            onChange={handleTechChange}
                            onKeyDown={handleKeyDown}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            autoComplete="off"
                            className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 px-1 h-8 text-base min-w-[120px]"
                          />
                        </div>
                        {/* 提案ドロップダウン */}
                        <AnimatePresence>
                          {showSuggestions && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 z-[100] mt-2 bg-card border-2 border-primary/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
                            >
                              {suggestions.map((item, index) => (
                                <div
                                  key={item}
                                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                                    index === activeSuggestionIndex ? "bg-primary text-white" : "hover:bg-primary/10"
                                  }`}
                                  onClick={() => handleSuggestionSelect(item)}
                                >
                                  <span className="font-medium">{item}</span>
                                  {index === activeSuggestionIndex && <Sparkles className="w-4 h-4" />}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 場所フィルター */}
                      <div className="grid gap-3 relative md:col-span-2">
                        <Label htmlFor="location" className="flex items-center gap-2 text-base font-bold text-foreground/80">
                          <MapPin className="w-4 h-4 text-accent" />
                          勤務地
                        </Label>
                        <div className="min-h-14 w-full flex flex-wrap items-center gap-2 p-3 border-2 rounded-xl bg-card/50 transition-all focus-within:border-primary">
                          {selectedLocationTags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="px-3 py-1 flex items-center gap-1.5 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors"
                            >
                              {tag}
                              <button 
                                onClick={() => removeLocationTag(tag)}
                                className="hover:bg-accent/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          <Input
                            key={`loc-${locationInputKey}`}
                            id="location"
                            ref={locationInputRef}
                            placeholder={selectedLocationTags.length === 0 ? "例: 東京都, 横浜市" : ""}
                            value={locationInputValue}
                            onChange={handleLocationChange}
                            onKeyDown={handleLocationSubmit}
                            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                            autoComplete="off"
                            className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 px-1 h-8 text-base min-w-[120px]"
                          />
                        </div>
                        {/* 場所提案ドロップダウン */}
                        <AnimatePresence>
                          {showLocationSuggestions && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 z-[100] mt-2 bg-card border-2 border-accent/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
                            >
                              {locationSuggestions.map((item, index) => (
                                <div
                                  key={item}
                                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                                    index === activeLocationIndex ? "bg-accent text-white" : "hover:bg-accent/10"
                                  }`}
                                  onClick={() => handleLocationSelect(item)}
                                >
                                  <span className="font-medium">{item}</span>
                                  {index === activeLocationIndex && <Sparkles className="w-4 h-4" />}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 最低年収 */}
                      <div className="grid gap-3">
                        <Label htmlFor="salary" className="flex items-center gap-2 text-base font-bold text-foreground/80">
                          <DollarSign className="w-4 h-4 text-success" />
                          希望年収 (下限)
                        </Label>
                        <div className="flex items-center gap-4">
                          <select
                            id="salary"
                            value={minSalary}
                            onChange={(e) => setMinSalary(Number(e.target.value))}
                            className="flex h-12 w-full rounded-xl border-2 border-input bg-card/50 px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                          >
                            <option value={0}>こだわらない</option>
                            <option value={400}>400万円以上</option>
                            <option value={500}>500万円以上</option>
                            <option value={600}>600万円以上</option>
                            <option value={700}>700万円以上</option>
                            <option value={800}>800万円以上</option>
                            <option value={1000}>1000万円以上</option>
                            <option value={1200}>1200万円以上</option>
                            <option value={1400}>1400万円以上</option>
                          </select>
                        </div>
                      </div>

                      {/* 働き方オプション */}
                      <div className="grid gap-3 md:col-span-2">
                        <Label className="flex items-center gap-2 text-base font-bold text-foreground/80">
                          <Globe className="w-4 h-4 text-accent" />
                          働き方・その他オプション
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {["Remote", "Full Remote", "Flex", "Full Flex"].map((style) => (
                            <Badge
                              key={style}
                              variant={selectedWorkStyles.includes(style) ? "default" : "outline"}
                              className="px-4 py-2 text-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (selectedWorkStyles.includes(style)) {
                                  setSelectedWorkStyles(selectedWorkStyles.filter(s => s !== style));
                                } else {
                                  setSelectedWorkStyles([...selectedWorkStyles, style]);
                                }
                              }}
                            >
                              {style === "Remote" && "リモート"}
                              {style === "Full Remote" && "フルリモート"}
                              {style === "Flex" && "フレックス"}
                              {style === "Full Flex" && "フルフレックス"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 除外条件 */}
              <div className="grid gap-3 pt-2">
                <Label htmlFor="exclude" className="flex items-center gap-2 text-lg font-bold leading-relaxed tracking-wide text-foreground/90">
                  <Ban className="w-5 h-5 text-accent" />
                  除外条件
                </Label>
                <Input
                  id="exclude"
                  placeholder="例: SES企業、残業が多い"
                  value={excludeConditions}
                  onChange={(e) => setExcludeConditions(e.target.value)}
                  className="h-14 border-2 px-4 text-base rounded-xl bg-card/50"
                />
              </div>
            </div>

            {/* セパレーターと検索ボタンエリア */}
            <div className="pt-4 flex flex-col md:flex-row md:justify-end gap-4 border-t border-border/50 mt-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleClear}
                className="w-full md:w-auto text-muted-foreground hover:text-foreground hover:bg-muted/50 h-14 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                条件をクリア
              </Button>
              
              <Button
                onClick={handleSearch}
                variant="gradient"
                size="lg"
                disabled={isSearching}
                className="w-full md:w-auto md:min-w-[240px] h-14 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all rounded-xl mt-4 md:mt-0"
                id="search-main-button"
              >
                {isSearching ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI検索実行
                  </>
                )}
              </Button>
            </div>
            
            {/* 検索履歴リスト (常に表示) */}
            <div className="pt-6">
              <Label className="text-sm font-bold text-muted-foreground mb-3 block">
                <RotateCcw className="w-3 h-3 inline mr-1" />
                最近の検索
              </Label>
              {searchHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item) => (
                    <Badge
                      key={item.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted px-3 py-1.5 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleHistorySelect(item)}
                    >
                      {item.summary}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">
                  検索履歴はありません。検索するとここに表示されます。
                </p>
              )}
            </div>
            
          </CardContent>
        </Card>
      </motion.div>

      {/* AI検索ローディング */}
      <AnimatePresence>
        {isSearching && (
          <AISearchLoading isLoading={isSearching} />
        )}
      </AnimatePresence>

      {/* AI検索結果 */}
      <AnimatePresence mode="wait">
        {(aiResults.length > 0 || aiError) && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* エラー表示 */}
            {aiError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl flex items-center gap-4 shadow-sm backdrop-blur-sm">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI検索を完了できませんでした</h3>
                  <p className="text-sm opacity-90">{aiError}</p>
                </div>
              </div>
            )}
            
            {/* AI解釈結果 (エラー時は非表示) */}
            {aiIntent && !aiError && (
              <AISearchInsight intent={aiIntent} resultCount={aiResults.length} />
            )}

            {/* 結果ヘッダー */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                AI検索結果
                <Badge variant="secondary" className="text-sm">
                  {aiResults.length}件
                </Badge>
              </h2>
            </div>

            {/* AIジョブカード */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiResults.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AIJobCard
                    job={job}
                    onViewDetail={() => {
                      setSelectedJobForDetail(job);
                      router.push(`/jobs/${job.id}`);
                    }}
                    onToggleFavorite={() => {
                      toggleFavorite(job.id);
                      setAiResults([...aiResults]);
                    }}
                    isFavorite={isFavorite(job.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI検索結果0件 - 通常検索結果もない場合のみ表示 */}
        {hasSearched && aiResults.length === 0 && searchResults.length === 0 && !isSearching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="shadow-lg">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block"
                  >
                    <Sparkles className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                  </motion.div>
                  <p className="text-lg text-muted-foreground">
                    AIが条件に合う求人を見つけられませんでした。
                  </p>
                  <p className="text-sm text-muted-foreground">
                    検索条件を変更してお試しください。
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 通常検索結果（詳細条件検索時） */}
      <AnimatePresence mode="wait">
        {searchResults.length > 0 && aiResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                検索結果
                <Badge variant="secondary" className="text-sm">
                  {searchResults.length}件
                </Badge>
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">並び替え:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-card border border-border rounded-lg pl-3 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="score_desc">AIスコア順 (高い順)</option>
                    <option value="salary_desc">年収順 (高い順)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {paginatedResults.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer gradient-border h-full">
                    <CardContent className="p-6 h-full">
                      <div className="flex flex-col h-full justify-between gap-6">
                        <div className="space-y-3">
                          {/* Job Title & Favorite Toggle */}
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors flex-1 line-clamp-2 min-h-[3.5rem]">
                              {job.title}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleToggleFavorite(e, job.id)}
                              className="rounded-full hover:bg-red-50 hover:text-red-500 h-10 w-10 shrink-0 transition-colors"
                            >
                              <Heart 
                                className={`w-5 h-5 ${isFavorite(job.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} 
                              />
                            </Button>
                          </div>

                          {/* Company & Location */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-primary" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-accent" />
                              <span>{job.location}</span>
                            </div>
                          </div>

                          {/* Salary & Score */}
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5 text-sm">
                              <DollarSign className="w-4 h-4 text-success" />
                              <span className="font-medium">{job.salary}</span>
                            </div>
                            <Badge variant={getScoreColor(job.score)} className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {job.score}
                            </Badge>
                          </div>
                        </div>

                        {/* 詳細表示ボタン */}
                        <div className="pt-2">
                          <Button
                            onClick={() => handleViewDetail(job)}
                            variant="outline"
                            className="w-full hover:bg-primary hover:text-white transition-all duration-300"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            詳細を見る
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* ページネーションコントロール */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8 pb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-full w-10 h-10"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" /> {/* Using rotated chevron as makeshift left arrow if ArrowLeft not imported, assuming generic icons */}
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full font-bold transition-all ${
                        currentPage === page ? "scale-110 shadow-lg" : "text-muted-foreground"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-full w-10 h-10"
                >
                  <ChevronDown className="w-5 h-5 -rotate-90" />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {hasSearched && searchResults.length === 0 && aiResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="shadow-lg">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block"
                  >
                    <Search className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                  </motion.div>
                  <p className="text-lg text-muted-foreground">
                    該当する求人が見つかりませんでした。
                  </p>
                  <p className="text-sm text-muted-foreground">
                    検索条件を変更してお試しください。
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchScreen;
