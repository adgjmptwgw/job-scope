import { NextRequest, NextResponse } from 'next/server';
import { SupabaseJobRepository } from '@/infrastructure/repositories/SupabaseJobRepository';
import { SupabaseSearchHistoryRepository } from '@/infrastructure/repositories/SupabaseSearchHistoryRepository';
import { GeminiClient } from '@/infrastructure/ai/GeminiClient';
import { SearchService } from '@/domain/services/SearchService';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    console.log('\n🔴🔴🔴 API REQUEST RECEIVED: /api/search/cot 🔴🔴🔴');
    console.log('⏰ timestamp:', new Date().toISOString());
    console.log('📏 query_length:', query?.length || 0);
    console.log('\n📝 integrated_query:');
    console.log('────────────────────────────────────────');
    console.log(query);
    console.log('────────────────────────────────────────\n');
    
    if (!query) {
      return NextResponse.json({ error: 'クエリパラメータ "q" が必要です' }, { status: 400 });
    }

    console.log('🚀 ===== AI求人検索開始 =====');
    console.log('⏰ start_time:', new Date().toISOString());
    console.log('================================\n');

    // 依存性注入
    const supabase = await createClient();
    const jobRepository = new SupabaseJobRepository(supabase);
    const historyRepository = new SupabaseSearchHistoryRepository(supabase);
    
    // Stage 1-4 はすべてGemini APIを使用
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const geminiClient = new GeminiClient(apiKey);
    
    const searchService = new SearchService(
      jobRepository, 
      historyRepository, 
      geminiClient
    );

    const result = await searchService.searchJobsWithCoT(query);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('CoT Search Error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
