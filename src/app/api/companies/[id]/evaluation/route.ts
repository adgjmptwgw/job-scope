import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseCompanyRepository } from '@/infrastructure/repositories/SupabaseCompanyRepository';
import { GeminiClient } from '@/infrastructure/ai/GeminiClient';
import { CompanyService } from '@/domain/services/CompanyService';

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, props: Props) {
  const params = await props.params;
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: '企業IDが必要です' }, { status: 400 });
    }

    // Dependency Injection
    const supabase = await createClient();
    const companyRepository = new SupabaseCompanyRepository(supabase);
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    const geminiClient = new GeminiClient(geminiApiKey);
    const companyService = new CompanyService(companyRepository, geminiClient);

    // 企業評価を生成（またはキャッシュから取得）
    const evaluation = await companyService.evaluateCompany(id);

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Error in GET /api/companies/[id]/evaluation:', error);
    
    if (error.message === 'Company not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
