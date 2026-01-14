import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseJobFavoriteRepository } from '@/infrastructure/repositories/SupabaseJobFavoriteRepository';
import { FavoriteService } from '@/domain/services/FavoriteService';

export async function GET(request: NextRequest) {
  try {
    console.log('\n📡 API REQUEST: GET /api/favorites');
    console.log('⏰ timestamp:', new Date().toISOString());
    
    // 認証チェック
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ auth_error:', authError?.message || 'user not found');
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    console.log('👤 user_id:', user.id);

    // Dependency Injection
    const favoriteRepository = new SupabaseJobFavoriteRepository(supabase);
    const favoriteService = new FavoriteService(favoriteRepository);

    const favorites = await favoriteService.getFavorites(user.id);

    return NextResponse.json({
      total: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error('Error in GET /api/favorites:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
