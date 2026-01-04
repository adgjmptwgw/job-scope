import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseJobFavoriteRepository } from '@/infrastructure/repositories/SupabaseJobFavoriteRepository';
import { FavoriteService } from '@/domain/services/FavoriteService';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
