"use client";

import React, { useState } from "react";
import { Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * デモ環境であることを通知するバナーコンポーネント
 */
export const DemoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  // 環境変数がdemoでない場合は何も表示しない
  // NEXT_PUBLIC_DEMO_MODEはクライアントサイドで参照可能
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (!isDemo || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="mb-6"
      >
        <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-900 rounded-xl p-4 flex items-start gap-3 shadow-md">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">現在、デモ用の画面を表示しています</h4>
            <p className="text-sm opacity-90">
              現在はデモ環境です。AI求人検索はサンプルデータで動作しているため、実際の結果とは異なります。
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-yellow-200/50 rounded-full transition-colors text-yellow-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
