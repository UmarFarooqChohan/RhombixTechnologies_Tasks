// Admin Setup Script
// This script creates the admin user using environment variables
// Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME in Supabase Edge Function settings

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function setupAdmin() {
  try {
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    const adminName = Deno.env.get('ADMIN_NAME') || 'Admin User';

    if (!adminEmail || !adminPassword) {
      console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set!');
      console.error('Go to Supabase Dashboard → Edge Functions → Settings to add them.');
      return;
    }

    console.log('Setting up admin user...');
    console.log('Admin Email:', adminEmail);

    // Create admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      user_metadata: { name: adminName, role: 'admin' },
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
      email: adminEmail,
      name: adminName,
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
