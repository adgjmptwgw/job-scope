"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Building2, MapPin, DollarSign, Star, Sparkles, Ban, Heart, Code, Globe, ChevronDown, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockJobs, setSelectedJobForDetail, toggleFavorite, isFavorite, TECH_STACK_SUGGESTIONS, LOCATION_SUGGESTIONS } from "@/utils/mockData";

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
  
  // 技術提案の状態
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  // 場所提案の状態
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  
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

  const handleSearch = () => {
    setIsSearching(true);
    
    // UX向上のため検索遅延をシミュレート
    setTimeout(() => {
      const q = naturalLanguageSearch.trim().toLowerCase();
      const exclude = excludeConditions
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      
      const results = mockJobs.filter((job) => {
        const hay = (
          job.title +
          " " +
          job.company +
          " " +
          job.description +
          " " +
          (job.languages?.join(" ") || "") +
          " " +
          (job.frameworks?.join(" ") || "") +
          " " +
          (job.infrastructure?.join(" ") || "")
        ).toLowerCase();

        // 自然言語検索
        if (q && !hay.includes(q)) return false;

        // 除外条件
        for (const ex of exclude) {
          if (hay.includes(ex)) return false;
        }

        // 技術スタックタグフィルター
        if (selectedTechTags.length > 0) {
          for (const tag of selectedTechTags) {
            if (!hay.includes(tag.toLowerCase())) return false;
          }
        }

        // 最低年収フィルター
        if (minSalary > 0 && job.salaryMinInt < minSalary) return false;

        // 働き方フィルター
        if (selectedWorkStyles.length > 0) {
          const jobWorkStyles = job.workStyles || [];
          const hasMatch = selectedWorkStyles.some(style => jobWorkStyles.includes(style));
          if (!hasMatch) return false;
        }

        // 複数場所フィルター
        if (selectedLocationTags.length > 0) {
          const jobLoc = job.location.toLowerCase();
          const matchesAnyLocation = selectedLocationTags.some(loc => jobLoc.includes(loc.toLowerCase()));
          if (!matchesAnyLocation) return false;
        }

        return true;
      });

      // 結果のソート
      const sortedResults = [...results].sort((a, b) => {
        if (sortBy === "score_desc") return b.score - a.score;
        if (sortBy === "salary_desc") return b.salaryMinInt - a.salaryMinInt;
        return 0; // デフォルト
      });
      
      setSearchResults(sortedResults);
      setHasSearched(true);
      setIsSearching(false);
      setCurrentPage(1); // 検索時に1ページ目にリセット
    }, 800);
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
                  AI検索条件
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
              >
                {isSearching ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Search className="w-5 h-5" />
                    </motion.div>
                    検索中...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    検索実行
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {searchResults.length > 0 && (
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

        {hasSearched && searchResults.length === 0 && (
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
