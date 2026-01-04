import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseJobFavoriteRepository } from '@/infrastructure/repositories/SupabaseJobFavoriteRepository';
import { FavoriteService } from '@/domain/services/FavoriteService';

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, props: Props) {
  const params = await props.params;
  try {
    const { id: jobId } = params;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // 認証チェック
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Dependency Injection
    const favoriteRepository = new SupabaseJobFavoriteRepository(supabase);
    const favoriteService = new FavoriteService(favoriteRepository);

    await favoriteService.addFavorite(user.id, jobId);

    return NextResponse.json({ message: 'Added to favorites' });
  } catch (error: any) {
    console.error('Error in POST /api/jobs/[id]/favorite:', error);
    
    if (error.message === 'Already in favorites') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: Props) {
  const params = await props.params;
  try {
    const { id: jobId } = params;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // 認証チェック
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Dependency Injection
    const favoriteRepository = new SupabaseJobFavoriteRepository(supabase);
    const favoriteService = new FavoriteService(favoriteRepository);

    await favoriteService.removeFavorite(user.id, jobId);

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error in DELETE /api/jobs/[id]/favorite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
