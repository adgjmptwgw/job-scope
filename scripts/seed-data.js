
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding data...');

  // 1. Create Company
  const companyId = crypto.randomUUID();
  const company = {
    id: companyId,
    name: 'Tech Startup Inc.',
    logo_url: 'https://via.placeholder.com/100',
    tags: ['Startup', 'AI', 'Remote'],
    created_at: new Date().toISOString()
  };

  const { error: companyError } = await supabase.from('companies').insert(company);
  if (companyError) {
    console.error('Error seeding company:', companyError);
    return;
  }
  console.log('Company seeded:', company.name);

  // 2. Create Jobs
  const jobs = [
    {
      title: 'Senior Go Developer',
      description: 'We are looking for a senior Go developer to lead our backend team. You will be responsible for designing and implementing scalable microservices.',
      company_id: companyId,
      location: 'Tokyo (Remote)',
      salary_min: 8000000,
      salary_max: 12000000,
      skills: ['Go', 'GCP', 'Kubernetes'],
      source_url: 'https://example.com/job1',
      is_active: true,
      created_at: new Date().toISOString(), // Used as crawled_at
    },
    {
      title: 'Frontend Engineer (React)',
      description: 'Join our frontend team to build modern web applications using React and Next.js. Experience with TypeScript is required.',
      company_id: companyId,
      location: 'Tokyo',
      salary_min: 6000000,
      salary_max: 9000000,
      skills: ['React', 'TypeScript', 'Next.js'],
      source_url: 'https://example.com/job2',
      is_active: true,
      created_at: new Date().toISOString(),
    }
  ];

  const { error: jobsError } = await supabase.from('jobs').insert(jobs);
  if (jobsError) {
    console.error('Error seeding jobs:', jobsError);
  } else {
    console.log(`Seeded ${jobs.length} jobs.`);
  }
}

seed();
