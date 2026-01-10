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

    // 1. キャッシュ (DB) を確認
    const cachedEvaluation = await this.companyRepository.getEvaluation(company.id);
    if (cachedEvaluation) {
      return cachedEvaluation;
    }

    // 2. AIによる企業評価を生成
    const evaluation = await this.geminiClient.evaluateCompany(company.id, company.name);

    // 3. 結果を保存 (非同期で実行してもよいが、ここではawaitする)
    await this.companyRepository.saveEvaluation(company.id, evaluation);

    return evaluation;
  }
}
