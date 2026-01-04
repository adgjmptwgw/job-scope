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

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Dependency Injection
    const supabase = await createClient();
    const repository = new SupabaseJobRepository(supabase);
    const service = new JobService(repository);

    const job = await service.getJob(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error in GET /api/jobs/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
