import { Job } from '../entities/Job';
import { SearchConditions } from '../../infrastructure/ai/IGeminiClient';

export interface IJobRepository {
  findById(id: string): Promise<Job | null>;
  search(conditions: SearchConditions, offset?: number, limit?: number): Promise<{ jobs: Job[]; total: number }>;
}
