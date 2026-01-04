const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY are required in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = 'test@example.com';
  const password = 'password123';
  const name = 'Test User';

  console.log(`Creating user: ${email}...`);

  // Check if user exists first to avoid error
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
      console.error('Error listing users:', listError.message);
      process.exit(1);
  }
  
  const existingUser = users.find((u: any) => u.email === email);
  if (existingUser) {
      console.log('User already exists:', existingUser.id);
      return;
  }


  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto confirm email
    user_metadata: { display_name: name },
  });

  if (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  console.log('User created successfully!');
  console.log('User ID:', data.user.id);
  console.log('Email:', data.user.email);
  console.log('Password:', password);
}

main();
