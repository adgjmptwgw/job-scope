import { ICompanyRepository } from '../repositories/ICompanyRepository';
import { IGeminiClient, CompanyEvaluation } from '../../infrastructure/ai/IGeminiClient';
import { Company } from '../entities/Company';

export class CompanyService {
  constructor(
    private companyRepository: ICompanyRepository,
    private geminiClient: IGeminiClient
  ) {}

  async getCompany(id: string): Promise<Company | null> {
    return this.companyRepository.findById(id);
  }

  async evaluateCompany(id: string): Promise<CompanyEvaluation> {
    const company = await this.companyRepository.findById(id);
    
    if (!company) {
      throw new Error('Company not found');
    }

    // AIによる企業評価を生成
    return this.geminiClient.evaluateCompany(company.id, company.name);
  }
}
