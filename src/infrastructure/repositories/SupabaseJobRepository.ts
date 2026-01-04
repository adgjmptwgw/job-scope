import { SupabaseClient } from '@supabase/supabase-js';
import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { Job } from '../../domain/entities/Job';

export class SupabaseJobRepository implements IJobRepository {
  constructor(private client: SupabaseClient) {}

  async findById(id: string): Promise<Job | null> {
    const { data, error } = await this.client
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          tags,
          domain
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    // Map Supabase response to Domain Entity
    // Note: Assuming 'work_styles' is part of skills or tags in simplified schema, 
    // or should be added to DB if not present. 
    // For now, mapping from JSONB or handling defaults.
    
    return {
      id: data.id,
      title: data.title,
      source_url: data.source_url,
      location: data.location,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      skills: Array.isArray(data.skills) ? data.skills : [],
      work_styles: [], // Placeholder as it's not in DB schema explicitly yet, or part of tags
      company: {
        id: data.companies.id,
        name: data.companies.name,
        logo_url: data.companies.logo_url,
        tags: Array.isArray(data.companies.tags) ? data.companies.tags : [],
      },
      crawled_at: data.crawled_at,
      created_at: data.created_at || data.crawled_at, // Use crawled_at if created_at fallback
      is_active: data.is_active,
    };
  }

  async search(
    conditions: any,
    offset: number = 0,
    limit: number = 20
  ): Promise<{ jobs: Job[]; total: number }> {
    // ベースクエリ: 有効な求人のみ、30日以内にクロールされたもの
    let query = this.client
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          tags,
          domain
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .gte('crawled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // フィルタ適用
    if (conditions.locations && conditions.locations.length > 0) {
      // OR条件で複数の勤務地検索
      const locationConditions = conditions.locations
        .map((loc: string) => `location.ilike.%${loc}%`)
        .join(',');
      query = query.or(locationConditions);
    }

    if (conditions.min_salary) {
      query = query.gte('salary_min', conditions.min_salary);
    }

    if (conditions.max_salary) {
      query = query.lte('salary_max', conditions.max_salary);
    }

    if (conditions.skills && conditions.skills.length > 0) {
      // JSONB配列に対するcontains検索
      query = query.contains('skills', conditions.skills);
    }

    // ソート: 新しいものから
    query = query.order('crawled_at', { ascending: false });

    // ページネーション
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Search query error:', error);
      return { jobs: [], total: 0 };
    }

    if (!data) {
      return { jobs: [], total: 0 };
    }

    const jobs = data.map(item => ({
      id: item.id,
      title: item.title,
      source_url: item.source_url,
      location: item.location,
      salary_min: item.salary_min,
      salary_max: item.salary_max,
      skills: Array.isArray(item.skills) ? item.skills : [],
      work_styles: [],
      company: {
        id: item.companies.id,
        name: item.companies.name,
        logo_url: item.companies.logo_url,
        tags: Array.isArray(item.companies.tags) ? item.companies.tags : [],
      },
      crawled_at: item.crawled_at,
      created_at: item.crawled_at,
      is_active: item.is_active,
    }));

    return {
      jobs,
      total: count || 0,
    };
  }
}
