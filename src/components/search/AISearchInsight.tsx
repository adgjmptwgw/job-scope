"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Code, Briefcase, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * AI検索インサイトコンポーネント
 * 
 * What: AIが解釈した検索意図を表示するカード
 * Why: ユーザーにAIの思考過程を見せることで、検索結果への信頼感を高める
 */

interface SearchIntent {
  explicit: {
    locations?: string[];
    skills?: string[];
    min_salary?: number | null;
  };
  implicit: {
    role?: string;
    employment_type?: string[];
    min_salary?: number;
    company_size?: string[];
    nice_to_have?: string[];
  };
  search_intent_summary: string;
}

interface AISearchInsightProps {
  intent: SearchIntent;
  resultCount: number;
}

export const AISearchInsight: React.FC<AISearchInsightProps> = ({ intent, resultCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-6 border border-primary/20"
    >
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">AI解釈結果</h3>
            <p className="text-foreground/80">{intent.search_intent_summary}</p>
          </div>

          {/* 明示的条件 */}
          <div className="flex flex-wrap gap-2">
            {intent.explicit.locations?.map(loc => (
              <Badge key={loc} variant="outline" className="bg-accent/10 border-accent/30 text-accent">
                <MapPin className="w-3 h-3 mr-1" />
                {loc}
              </Badge>
            ))}
            {intent.explicit.skills?.map(skill => (
              <Badge key={skill} variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                <Code className="w-3 h-3 mr-1" />
                {skill}
              </Badge>
            ))}
            {intent.explicit.min_salary && (
              <Badge variant="outline" className="bg-success/10 border-success/30 text-success">
                年収 {intent.explicit.min_salary / 10000}万円〜
              </Badge>
            )}
          </div>

          {/* 暗黙的条件 */}
          {(intent.implicit.role || intent.implicit.company_size?.length) && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">AIが推測した条件:</p>
              <div className="flex flex-wrap gap-2">
                {intent.implicit.role && (
                  <Badge variant="secondary" className="bg-muted/50">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {intent.implicit.role}
                  </Badge>
                )}
                {intent.implicit.company_size?.map(size => (
                  <Badge key={size} variant="secondary" className="bg-muted/50">
                    <Building2 className="w-3 h-3 mr-1" />
                    {size}
                  </Badge>
                ))}
                {intent.implicit.min_salary && !intent.explicit.min_salary && (
                  <Badge variant="secondary" className="bg-muted/50">
                    推定年収 {intent.implicit.min_salary / 10000}万円〜
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 結果件数 */}
          <div className="pt-2 text-sm text-muted-foreground">
            {resultCount}件の求人が見つかりました
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AISearchInsight;
