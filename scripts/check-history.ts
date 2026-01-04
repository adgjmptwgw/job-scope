
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Envs are missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const email = 'test@example.com';
  
  // 1. Get User ID
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
      console.error('Error listing users:', userError);
      return;
  }
  const user = users.find((u: any) => u.email === email);
  
  if (!user) {
      console.log('User not found:', email);
      return;
  }
  
  console.log('User ID:', user.id);

  // 2. Check Jobs
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('*')
    .limit(1);

  if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      return;
  }

  console.log(`Found ${jobs.length} jobs.`);
}

main();

export {};
