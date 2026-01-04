"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MapPin, 
  DollarSign, 
  Building2, 
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFavoriteJobs, toggleFavorite, setSelectedJobForDetail } from '@/utils/mockData';

export default function Favorites() {
  const router = useRouter();
  const [favoriteJobs, setFavoriteJobs] = useState<any[]>([]);

  useEffect(() => {
    setFavoriteJobs(getFavoriteJobs());
  }, []);

  const handleToggleFavorite = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    toggleFavorite(jobId);
    setFavoriteJobs(getFavoriteJobs());
  };

  const handleViewDetails = (job: any) => {
    setSelectedJobForDetail(job);
    router.push(`/jobs/${job.id}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Badge variant="outline" className="px-4 py-1 text-primary border-primary/30 uppercase tracking-widest text-xs font-bold">
            Saved Jobs
          </Badge>
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            お気に入り求人
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            保存した求人をまとめて確認できます。
          </p>
        </div>
      </div>

      {favoriteJobs.length === 0 ? (
        <Card className="p-16 flex flex-col items-center justify-center border-dashed border-2 bg-muted/30">
          <Bookmark className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-xl text-muted-foreground font-medium">お気に入りの求人はありません</p>
          <Button 
            variant="link" 
            onClick={() => router.push('/search')}
            className="mt-4 text-primary text-lg"
          >
            求人を探しに行く
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {favoriteJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="group relative h-full flex flex-col glass-effect hover:shadow-2xl transition-all duration-500 border-t-4 border-t-primary/20 overflow-hidden cursor-pointer"
                  onClick={() => handleViewDetails(job)}
                >
                  <CardHeader className="p-10 pb-4">
                    <div className="flex justify-between items-start mb-6">
                      <Badge variant="secondary" className="px-3 py-1 font-bold">正社員</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleToggleFavorite(e, job.id)}
                        className="rounded-full hover:bg-red-50 hover:text-red-500 h-12 w-12 transition-colors"
                      >
                        <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors leading-snug">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium pt-2">
                      <Building2 className="w-4 h-4" />
                      {job.company}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-10 pt-2 flex-grow space-y-8">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="w-5 h-5 text-primary/60" />
                        <span className="text-base">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-success font-bold text-lg">
                        <DollarSign className="w-5 h-5" />
                        {job.salary}
                      </div>
                    </div>

                    <Separator className="opacity-50" />

                    <div className="flex items-center justify-between group/btn">
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1 mr-2">Score</span>
                        <div className="flex items-center text-primary font-black text-2xl">
                          {job.score}
                          <span className="text-xs text-muted-foreground ml-0.5">/ 5.0</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        詳細 <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
