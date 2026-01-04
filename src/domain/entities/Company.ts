export interface Company {
  id: string;
  name: string;
  domain: string;
  tags: string[];
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}
