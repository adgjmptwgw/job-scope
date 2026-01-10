import { NextRequest, NextResponse } from 'next/server';
import { SupabaseJobRepository } from '@/infrastructure/repositories/SupabaseJobRepository';
import { SupabaseSearchHistoryRepository } from '@/infrastructure/repositories/SupabaseSearchHistoryRepository';
import { GeminiClient } from '@/infrastructure/ai/GeminiClient';
import { MockClaudeClient } from '@/infrastructure/ai/MockClaudeClient';
import { SearchService } from '@/domain/services/SearchService';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    console.log('\n🚀 ===== AI求人検索開始 =====');
    console.log('📝 検索クエリ:', query);
    console.log('⏰ 開始時刻:', new Date().toISOString());
    console.log('================================\n');

    // 依存性注入
    const supabase = await createClient();
    const jobRepository = new SupabaseJobRepository(supabase);
    const historyRepository = new SupabaseSearchHistoryRepository(supabase);
    
    // Stage 1 は実際のGemini API、Stage 2-4 はモック
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const geminiClient = new GeminiClient(apiKey);
    const mockClaudeClient = new MockClaudeClient(); // Claude Mock（文化評価）
    
    const searchService = new SearchService(
      jobRepository, 
      historyRepository, 
      geminiClient,
      mockClaudeClient // Phase 4: Claude追加
    );

    const result = await searchService.searchJobsWithCoT(query);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('CoT Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
