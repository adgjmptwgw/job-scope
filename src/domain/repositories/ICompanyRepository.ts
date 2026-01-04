import { Company } from '../entities/Company';

export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  findByDomain(domain: string): Promise<Company | null>;
}
