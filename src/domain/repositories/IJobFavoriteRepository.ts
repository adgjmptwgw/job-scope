import { JobFavorite } from '../entities/JobFavorite';
import { Job } from '../entities/Job';

export interface IJobFavoriteRepository {
  findByUserId(userId: string): Promise<Job[]>; // お気に入り求人一覧を返す
  create(favorite: Omit<JobFavorite, 'created_at'>): Promise<JobFavorite>;
  delete(userId: string, jobId: string): Promise<void>;
  exists(userId: string, jobId: string): Promise<boolean>;
}
