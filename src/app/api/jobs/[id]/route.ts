import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseJobRepository } from '@/infrastructure/repositories/SupabaseJobRepository';
import { JobService } from '@/domain/services/JobService';

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  props: Props
) {
  const params = await props.params;
  try {
    const { id } = params;
    
    console.log('\n📡 API REQUEST: GET /api/jobs/[id]');
    console.log('⏰ timestamp:', new Date().toISOString());
    console.log('📝 job_id:', id);

    if (!id) {
      console.log('❌ validation_error: id is required');
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    // Dependency Injection
    const supabase = await createClient();
    const repository = new SupabaseJobRepository(supabase);
    const service = new JobService(repository);

    const job = await service.getJob(id);

    if (!job) {
      return NextResponse.json({ error: '求人が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error in GET /api/jobs/[id]:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
