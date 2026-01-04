import { IJobRepository } from '../repositories/IJobRepository';
import { Job } from '../entities/Job';

export class JobService {
  constructor(private repository: IJobRepository) {}

  async getJob(id: string): Promise<Job | null> {
    return this.repository.findById(id);
  }
}
