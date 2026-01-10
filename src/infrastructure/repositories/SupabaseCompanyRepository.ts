import { SupabaseClient } from '@supabase/supabase-js';
import { ICompanyRepository } from '../../domain/repositories/ICompanyRepository';
import { Company } from '../../domain/entities/Company';

export class SupabaseCompanyRepository implements ICompanyRepository {
  constructor(private client: SupabaseClient) {}

  async findById(id: string): Promise<Company | null> {
    const { data, error } = await this.client
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      domain: data.domain,
      tags: Array.isArray(data.tags) ? data.tags : [],
      description: data.description,
      logo_url: data.logo_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  async findByDomain(domain: string): Promise<Company | null> {
    const { data, error } = await this.client
      .from('companies')
      .select('*')
      .eq('domain', domain)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      domain: data.domain,
      tags: Array.isArray(data.tags) ? data.tags : [],
      description: data.description,
      logo_url: data.logo_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
  async getEvaluation(companyId: string): Promise<import('../../infrastructure/ai/IGeminiClient').CompanyEvaluation | null> {
    const { data, error } = await this.client
      .from('company_evaluations')
      .select('*')
      .eq('company_id', companyId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      summary: data.summary,
      topics: data.topics as any, // JSONB cast
      generated_at: data.created_at,
    };
  }

  async saveEvaluation(companyId: string, evaluation: import('../../infrastructure/ai/IGeminiClient').CompanyEvaluation): Promise<void> {
    const { error } = await this.client
      .from('company_evaluations')
      .insert({
        company_id: companyId,
        summary: evaluation.summary,
        topics: evaluation.topics,
      });

    if (error) {
      console.error('Failed to save company evaluation:', error);
    }
  }
}
