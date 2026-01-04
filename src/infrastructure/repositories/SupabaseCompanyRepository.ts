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
}
