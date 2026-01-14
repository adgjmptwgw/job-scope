"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText, 
  Star, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  Briefcase,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { mockJobs, selectedJobForDetail, setSelectedJobForDetail, toggleFavorite, isFavorite } from '@/utils/mockData';

export default function JobDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [job, setJob] = useState<any>(selectedJobForDetail);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // スムーズな遷移のために読み込みをシミュレート
    setLoading(true);
    const timer = setTimeout(() => {
      // 直接ページが読み込まれた場合に求人を見つけるロジック
      if (!job || job.id !== id) {
        const foundJob = mockJobs.find(mj => mj.id === id);
        if (foundJob) {
          setJob(foundJob);
          setSelectedJobForDetail(foundJob);
        } else {
          // モックに見つからない場合、検索にリダイレクト
          router.push('/search');
        }
      }
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id, job, router]);

  const handleToggleFavorite = () => {
    if (job) {
      toggleFavorite(job.id);
      // 強制的に再レンダリング（シャローコピー）
      setJob({ ...job });
    }
  };

  if (loading || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Briefcase className="w-12 h-12 text-primary relative z-10" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-muted-foreground font-medium"
        >
          求人情報を読み込み中...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ナビゲーションとヘッダーアクション */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/search')}
          className="group hover:bg-transparent hover:text-primary transition-colors pl-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          検索結果に戻る
        </Button>
      </div>

      {/* メイン求人カード */}
      <Card className="shadow-xl border-t-4 border-t-primary overflow-hidden">
        <div className="absolute top-0 right-0 p-6 pointer-events-none">
          <div className="w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
        </div>

        <CardHeader className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit mb-3 px-4 py-1.5 text-base">
                正社員
              </Badge>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight py-1">
                  {job.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className="rounded-full hover:bg-red-50 hover:text-red-500 h-14 w-14 shrink-0 transition-colors"
                >
                  <Heart 
                    className={`w-8 h-8 ${isFavorite(job.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} 
                  />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground text-lg">
                    {typeof job.company === 'string' ? job.company : job.company?.name || '企業名不明'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-base">{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  <span className="text-success font-bold text-lg">{job.salary}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 pt-2">
              {/* 求人サイトへのリンク */}
              {job.sourceUrl && (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    求人サイトで見る
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardHeader>

        <Separator className="my-2" />

        <CardContent className="space-y-16 p-12 md:p-16">
          {/* 仕事内容セクション */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-4 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              仕事内容
            </h3>
            <p className="leading-loose text-base text-muted-foreground bg-secondary/30 p-10 rounded-2xl border border-border/50 shadow-sm">
              {job.description}
            </p>
          </div>

          <Separator className="my-16 opacity-30" />

          {/* 応募要件セクション */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-4 mb-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              応募要件
            </h3>
            <p className="leading-loose text-base text-muted-foreground pl-8 border-l-[6px] border-primary/30 py-4">
              {job.requirements}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 分析グリッド */}
      <div className="grid md:grid-cols-2 gap-12">
        {/* 企業評価カード */}
        <Card className="glass-effect overflow-hidden border-t-4 border-t-accent shadow-lg">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-accent/10 p-3 rounded-xl">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              企業実態評価
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <div className="space-y-6">
              {job.evaluationItems && job.evaluationItems.map((item: any, idx: number) => (
                <div key={idx} className="p-4 bg-accent/5 rounded-xl border border-accent/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <h4 className="font-bold text-lg text-foreground/90">{item.category}</h4>
                    </div>
                    {item.score && (
                      <div className="flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-bold text-accent">{item.score.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  {item.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex flex-col gap-1 pl-4">
                    {item.links.map((link: string, lIdx: number) => (
                      <a 
                        key={lIdx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2 text-xs"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        口コミを見る
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              {(!job.evaluationItems || job.evaluationItems.length === 0) && (
                <p className="text-muted-foreground text-center py-8">
                  この企業の評価データはまだありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI分析カード */}
        <Card className="border-t-4 border-t-primary bg-gradient-to-br from-card to-primary/5 shadow-lg">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              AI評価分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 p-10 pt-4">
            <div className="flex flex-col xl:flex-row items-center gap-8">
              <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 min-w-[160px]">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">スコア</span>
                  <div className="flex items-center gap-1 text-5xl font-black text-primary tracking-tight">
                    {job.score}
                    <span className="text-sm text-muted-foreground font-medium self-end mb-1">/5.0</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4 text-center xl:text-left">
                <div className="flex items-center justify-center xl:justify-start gap-1">
                   <Star className="w-6 h-6 fill-primary text-primary" />
                   <Star className="w-6 h-6 fill-primary text-primary" />
                   <Star className="w-6 h-6 fill-primary text-primary" />
                   <Star className="w-6 h-6 fill-primary text-primary" />
                   <Star className="w-6 h-6 text-muted" />
                </div>
                <p className="text-base font-medium text-muted-foreground leading-relaxed">
                  市場価値と条件のバランスが非常に良い求人です
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                評価理由
              </p>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                <p className="text-base text-foreground/90 leading-loose">
                  {job.aiReason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
