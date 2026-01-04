import { SupabaseClient } from '@supabase/supabase-js';
import { IJobFavoriteRepository } from '../../domain/repositories/IJobFavoriteRepository';
import { JobFavorite } from '../../domain/entities/JobFavorite';
import { Job } from '../../domain/entities/Job';

export class SupabaseJobFavoriteRepository implements IJobFavoriteRepository {
  constructor(private client: SupabaseClient) {}

  async findByUserId(userId: string): Promise<Job[]> {
    const { data, error } = await this.client
      .from('job_favorites')
      .select(`
        created_at,
        jobs (
          *,
          companies (
            id,
            name,
            logo_url,
            tags
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    // データ型を変換
    return data
      .filter(item => item.jobs) // jobsが存在するもののみ
      .map(item => {
        const jobData = item.jobs as any;
        return {
          id: jobData.id,
          title: jobData.title,
          source_url: jobData.source_url,
          location: jobData.location,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          skills: Array.isArray(jobData.skills) ? jobData.skills : [],
          work_styles: [], // 現在DBスキーマに未定義
          company: {
            id: jobData.companies.id,
            name: jobData.companies.name,
            logo_url: jobData.companies.logo_url,
            tags: Array.isArray(jobData.companies.tags) ? jobData.companies.tags : [],
          },
          crawled_at: jobData.crawled_at,
          created_at: jobData.crawled_at,
          is_active: jobData.is_active,
        };
      });
  }

  async create(favorite: Omit<JobFavorite, 'created_at'>): Promise<JobFavorite> {
    const { data, error } = await this.client
      .from('job_favorites')
      .insert({
        user_id: favorite.user_id,
        job_id: favorite.job_id,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create favorite');
    }

    return {
      user_id: data.user_id,
      job_id: data.job_id,
      created_at: data.created_at,
    };
  }

  async delete(userId: string, jobId: string): Promise<void> {
    const { error } = await this.client
      .from('job_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);

    if (error) {
      throw new Error('Failed to delete favorite');
    }
  }

  async exists(userId: string, jobId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('job_favorites')
      .select('user_id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single();

    return !error && !!data;
  }
}
