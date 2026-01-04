import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseJobRepository } from '@/infrastructure/repositories/SupabaseJobRepository';
import { SupabaseSearchHistoryRepository } from '@/infrastructure/repositories/SupabaseSearchHistoryRepository';
import { GeminiClient } from '@/infrastructure/ai/GeminiClient';
import { SearchService } from '@/domain/services/SearchService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const locations = searchParams.getAll('locations');
    const skills = searchParams.getAll('skills');
    const minSalary = searchParams.get('min_salary');
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 認証チェック（オプション）
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Dependency Injection
    const jobRepository = new SupabaseJobRepository(supabase);
    const searchHistoryRepository = new SupabaseSearchHistoryRepository(supabase);
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    
    console.log('[API] Jobs Search Request:', { 
      query, 
      hasApiKey: !!geminiApiKey,
      apiKeyLength: geminiApiKey.length 
    });

    const geminiClient = new GeminiClient(geminiApiKey);
    const searchService = new SearchService(
      jobRepository,
      searchHistoryRepository,
      geminiClient
    );

    // 検索実行
    const result = await searchService.searchJobs(query, userId, offset, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
