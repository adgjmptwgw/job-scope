"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Heart, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  Code,
  Users,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * AI拡張ジョブカードコンポーネント
 * 
 * What: AI検索結果を表示するリッチなカード
 * Why: マッチ理由と企業評価を含むことで、ユーザーの意思決定を支援する
 */

interface CompanyTechEval {
  companyName: string;
  tech_score: number;
  tech_stack_modernity: number;
  engineering_culture: number;
  summary: string;
  strengths: string[];
}

interface CompanyCultureEval {
  companyName: string;
  culture_score: number;
  work_life_balance: number;
  growth_opportunity: number;
  summary: string;
  highlights: string[];
  concerns: string[];
}

interface CompanyEvaluation {
  tech: CompanyTechEval | null;
  culture: CompanyCultureEval | null;
  overall_score: number;
}

interface AIJobCardProps {
  job: {
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
    company_evaluation: CompanyEvaluation;
  };
  onViewDetail?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export const AIJobCard: React.FC<AIJobCardProps> = ({ 
  job, 
  onViewDetail, 
  onToggleFavorite,
  isFavorite = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // スコアに応じた色を取得
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    return "text-muted-foreground";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-success/10 border-success/30";
    if (score >= 70) return "bg-primary/10 border-primary/30";
    return "bg-muted/50 border-muted";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-border/50">
        {/* ヘッダー部分 */}
        <div className="p-6 space-y-4">
          {/* タイトルとスコア */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-2">
                {job.title}
              </h3>
              <p className="text-foreground/70 font-medium">{job.company.name}</p>
            </div>
            
            {/* マッチ度スコア */}
            <div className={`flex flex-col items-center p-3 rounded-xl border ${getScoreBg(job.confidence)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(job.confidence)}`}>
                {job.confidence}
              </span>
              <span className="text-xs text-muted-foreground">マッチ度</span>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {(job.salary_min / 10000).toLocaleString()}万円 - {(job.salary_max / 10000).toLocaleString()}万円
            </span>
          </div>

          {/* スキルタグ */}
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 5).map(skill => (
              <Badge key={skill} variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                {skill}
              </Badge>
            ))}
          </div>

          {/* マッチ理由 */}
          {job.match_reasons && job.match_reasons.length > 0 && (
            <div className="bg-success/5 rounded-xl p-4 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-success" />
                <span className="text-sm font-bold text-success">おすすめ理由</span>
              </div>
              <ul className="space-y-1">
                {job.match_reasons.map((reason, idx) => (
                  <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {reason.replace(/^[✅✓]\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 企業評価サマリー（折りたたみ） */}
          {job.company_evaluation && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                企業評価を{isExpanded ? "隠す" : "表示"}
              </button>
              
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* 総合スコア */}
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(job.company_evaluation.overall_score)}`}>
                        {job.company_evaluation.overall_score}
                      </div>
                      <div className="text-xs text-muted-foreground">総合スコア</div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      {/* 技術力 */}
                      {job.company_evaluation.tech && (
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-primary" />
                          <div>
                            <div className="text-sm font-medium">技術力</div>
                            <div className="text-lg font-bold text-primary">
                              {job.company_evaluation.tech.tech_score}
                            </div>
                          </div>
                        </div>
                      )}
                      {/* 文化 */}
                      {job.company_evaluation.culture && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-accent" />
                          <div>
                            <div className="text-sm font-medium">企業文化</div>
                            <div className="text-lg font-bold text-accent">
                              {job.company_evaluation.culture.culture_score}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 技術評価詳細 */}
                  {job.company_evaluation.tech && (
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="w-4 h-4 text-primary" />
                        <span className="font-bold text-primary">技術力評価 (Gemini)</span>
                      </div>
                      <p className="text-sm text-foreground/80 mb-2">
                        {job.company_evaluation.tech.summary}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.company_evaluation.tech.strengths.map((s, i) => (
                          <Badge key={i} variant="outline" className="bg-primary/10 text-primary text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 文化評価詳細 */}
                  {job.company_evaluation.culture && (
                    <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="font-bold text-accent">企業文化評価 (Claude)</span>
                      </div>
                      <p className="text-sm text-foreground/80 mb-2">
                        {job.company_evaluation.culture.summary}
                      </p>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {job.company_evaluation.culture.highlights.map((h, i) => (
                            <Badge key={i} variant="outline" className="bg-success/10 text-success text-xs">
                              ✓ {h}
                            </Badge>
                          ))}
                        </div>
                        {job.company_evaluation.culture.concerns.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.company_evaluation.culture.concerns.map((c, i) => (
                              <Badge key={i} variant="outline" className="bg-warning/10 text-warning text-xs">
                                ⚠ {c}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className={isFavorite ? "text-red-500" : "text-muted-foreground"}
          >
            <Heart className={`w-4 h-4 mr-1 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "保存済み" : "保存"}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(job.source_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              求人サイト
            </Button>
            <Button
              size="sm"
              onClick={onViewDetail}
            >
              詳細を見る
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AIJobCard;
