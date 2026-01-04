export interface Job {
  id: string;
  title: string;
  source_url: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  skills: string[];
  work_styles: string[];
  company: {
    id: string;
    name: string;
    logo_url: string | null;
    tags: string[];
  };
  crawled_at: string;
  created_at: string;
  is_active: boolean;
}
