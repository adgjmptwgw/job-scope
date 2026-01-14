"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, CheckCircle, Building2, Sparkles } from "lucide-react";

/**
 * AI検索ローディングコンポーネント
 * 
 * What: AI検索の各ステージの進捗を視覚的に表示するローディングインジケーター
 * Why: AI処理は数秒かかるため、ユーザーに現在の処理状況を伝えて体感待ち時間を減らす
 */

interface AISearchLoadingProps {
  isLoading: boolean;
}

const STAGES = [
  { id: 1, label: "意図を理解中...", icon: Brain, duration: 2500 },
  { id: 2, label: "求人を検索中...", icon: Search, duration: 4000 },
  { id: 3, label: "マッチ度を検証中...", icon: CheckCircle, duration: 4000 },
  { id: 4, label: "企業を評価中...", icon: Building2, duration: 100000 }, // 最後はずっと終わらないように長くする
];

export const AISearchLoading: React.FC<AISearchLoadingProps> = ({ isLoading }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  /**
   * What: ローディング表示開始時に自分自身の位置へスクロールします。
   * Why: ユーザーが検索の進行状況を確実に見逃さないようにします。
   */
  useEffect(() => {
    if (isLoading && containerRef.current) {
      // マウント直後は高さが確定していない可能性があるため、わずかに遅延させる
      setTimeout(() => {
        if (!containerRef.current) return;
        const element = containerRef.current;
        const yOffset = -200; // ヘッダー分などを考慮したオフセット
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 100);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStage(0);
      return;
    }

    // ステージを順番に進める
    let totalDelay = 0;
    const timers: NodeJS.Timeout[] = [];

    STAGES.forEach((stage, index) => {
      // 最後のステージの場合はタイマーを設定しない（ずっとローディング中のまま）
      if (index === STAGES.length - 1) {
        const timer = setTimeout(() => {
          setCurrentStage(index + 1);
        }, totalDelay);
        timers.push(timer);
      } else {
        const timer = setTimeout(() => {
          setCurrentStage(index + 1);
        }, totalDelay);
        timers.push(timer);
        totalDelay += stage.duration;
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 border border-primary/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        <span className="text-lg font-bold text-foreground">AIが分析中...</span>
      </div>

      <div className="space-y-4">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = currentStage === index + 1;
          const isComplete = currentStage > index + 1;
          const isPending = currentStage < index + 1;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: isPending ? 0.3 : 1,
                scale: isActive ? 1.02 : 1,
              }}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                isActive ? "bg-primary/20" : isComplete ? "bg-success/10" : "bg-card/30"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isActive ? "bg-primary text-white" : 
                isComplete ? "bg-success text-white" : 
                "bg-muted text-muted-foreground"
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
              </div>
              <span className={`font-medium ${
                isActive ? "text-primary" : 
                isComplete ? "text-success" : 
                "text-muted-foreground"
              }`}>
                {stage.label}
              </span>
              {isComplete && (
                <CheckCircle className="w-5 h-5 text-success ml-auto" />
              )}
              {isActive && (
                <div className="ml-auto flex space-x-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AISearchLoading;
