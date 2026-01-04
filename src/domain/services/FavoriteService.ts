import { IJobFavoriteRepository } from '../repositories/IJobFavoriteRepository';
import { Job } from '../entities/Job';

export class FavoriteService {
  constructor(private favoriteRepository: IJobFavoriteRepository) {}

  async getFavorites(userId: string): Promise<Job[]> {
    return this.favoriteRepository.findByUserId(userId);
  }

  async addFavorite(userId: string, jobId: string): Promise<void> {
    // 既に存在チェック
    const exists = await this.favoriteRepository.exists(userId, jobId);
    if (exists) {
      throw new Error('Already in favorites');
    }

    await this.favoriteRepository.create({ user_id: userId, job_id: jobId });
  }

  async removeFavorite(userId: string, jobId: string): Promise<void> {
    await this.favoriteRepository.delete(userId, jobId);
  }

  async isFavorite(userId: string, jobId: string): Promise<boolean> {
    return this.favoriteRepository.exists(userId, jobId);
  }
}
