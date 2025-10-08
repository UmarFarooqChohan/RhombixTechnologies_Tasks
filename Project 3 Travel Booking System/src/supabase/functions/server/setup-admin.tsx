// Admin Setup Script
// This script creates the admin user with credentials:
// Email: umar.farooq1592@gmail.com
// Password: umarfarooq

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');

    // Create admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'umar.farooq1592@gmail.com',
      password: 'umarfarooq',
      user_metadata: { name: 'Umar Farooq', role: 'admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('Admin user created successfully:', data.user.email);
    console.log('Admin user ID:', data.user.id);

    // Store admin profile in KV
    const kvStoreModule = await import('./kv_store.tsx');
    await kvStoreModule.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: 'umar.farooq1592@gmail.com',
      name: 'Umar Farooq',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    console.log('Admin profile stored in database');
    console.log('Setup complete!');
  } catch (err) {
    console.error('Setup failed:', err);
  }
}

// Run setup
setupAdmin();
