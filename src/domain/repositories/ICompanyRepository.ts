import { Company } from '../entities/Company';

export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  findByDomain(domain: string): Promise<Company | null>;
  getEvaluation(companyId: string): Promise<import('../../infrastructure/ai/IGeminiClient').CompanyEvaluation | null>;
  saveEvaluation(companyId: string, evaluation: import('../../infrastructure/ai/IGeminiClient').CompanyEvaluation): Promise<void>;
}
