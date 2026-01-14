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
    
    console.log('\n📡 API REQUEST: POST /api/jobs/[id]/favorite');
    console.log('⏰ timestamp:', new Date().toISOString());
    console.log('📝 job_id:', jobId);

    if (!jobId) {
      console.log('❌ validation_error: job_id is required');
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

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

    await favoriteService.addFavorite(user.id, jobId);

    return NextResponse.json({ message: 'Added to favorites' });
  } catch (error: any) {
    console.error('Error in POST /api/jobs/[id]/favorite:', error);
    
    if (error.message === 'Already in favorites') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: Props) {
  const params = await props.params;
  try {
    const { id: jobId } = params;
    
    console.log('\n📡 API REQUEST: DELETE /api/jobs/[id]/favorite');
    console.log('⏰ timestamp:', new Date().toISOString());
    console.log('📝 job_id:', jobId);

    if (!jobId) {
      console.log('❌ validation_error: id is required');
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

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

    await favoriteService.removeFavorite(user.id, jobId);

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error in DELETE /api/jobs/[id]/favorite:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
