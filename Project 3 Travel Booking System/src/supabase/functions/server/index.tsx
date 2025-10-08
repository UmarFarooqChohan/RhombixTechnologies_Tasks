import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Setup admin user - creates admin account if it doesn't exist
app.post('/make-server-974c2250/setup-admin', async (c) => {
  try {
    const adminEmail = 'umar.farooq1592@gmail.com';
    const adminExists = await kv.get('admin_setup_complete');
    
    if (adminExists) {
      return c.json({ message: 'Admin already exists' });
    }

    // Create admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'umar',
      user_metadata: { name: 'Umar Farooq', role: 'admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating admin user:', error);
      return c.json({ error: 'Failed to create admin', details: error.message }, 400);
    }

    // Store admin profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: adminEmail,
      name: 'Umar Farooq',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    await kv.set('admin_setup_complete', true);

    return c.json({ success: true, message: 'Admin user created', userId: data.user.id });
  } catch (error) {
    console.log('Error in admin setup:', error);
    return c.json({ error: 'Admin setup failed', details: String(error) }, 500);
  }
});

// Initialize sample destinations on first run
app.post('/make-server-974c2250/init', async (c) => {
  try {
    // Also setup admin if not done
    const adminExists = await kv.get('admin_setup_complete');
    if (!adminExists) {
      const adminEmail = 'umar.farooq1592@gmail.com';
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'umar',
        user_metadata: { name: 'Umar Farooq', role: 'admin' },
        email_confirm: true
      });

      if (!error && data.user) {
        await kv.set(`user:${data.user.id}`, {
          id: data.user.id,
          email: adminEmail,
          name: 'Umar Farooq',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        await kv.set('admin_setup_complete', true);
      }
    }

    const existing = await kv.get('destinations_initialized');
    if (existing) {
      return c.json({ message: 'Already initialized' });
    }

    const sampleDestinations = [
      {
        id: 'dest_1',
        name: 'Maldives Paradise',
        location: 'Maldives',
        description: 'Experience luxury overwater bungalows, crystal-clear waters, and pristine white sand beaches in this tropical paradise.',
        price: 2499,
        duration: '7 Days, 6 Nights',
        image: 'https://images.unsplash.com/photo-1682308999971-208126ba75ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHJlc29ydHxlbnwxfHx8fDE3NTkzNTQwODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Beach',
        rating: 4.9,
        reviews: 324,
        includes: ['5-Star Resort', 'All Meals Included', 'Water Sports', 'Spa Access']
      },
      {
        id: 'dest_2',
        name: 'Paris Romance',
        location: 'Paris, France',
        description: 'Discover the City of Light with iconic landmarks, world-class museums, and exquisite French cuisine.',
        price: 1899,
        duration: '5 Days, 4 Nights',
        image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc1OTMxOTM4MXww&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'City',
        rating: 4.8,
        reviews: 512,
        includes: ['4-Star Hotel', 'City Tours', 'Museum Passes', 'Seine River Cruise']
      },
      {
        id: 'dest_3',
        name: 'Dubai Luxury',
        location: 'Dubai, UAE',
        description: 'Explore futuristic architecture, luxury shopping, and desert adventures in this modern oasis.',
        price: 2199,
        duration: '6 Days, 5 Nights',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMHNreWxpbmV8ZW58MXx8fHwxNzU5NDAzOTkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'City',
        rating: 4.7,
        reviews: 428,
        includes: ['5-Star Hotel', 'Desert Safari', 'Burj Khalifa Tickets', 'Shopping Tours']
      },
      {
        id: 'dest_4',
        name: 'Santorini Dreams',
        location: 'Santorini, Greece',
        description: 'Witness breathtaking sunsets, white-washed buildings, and stunning Aegean Sea views.',
        price: 1699,
        duration: '5 Days, 4 Nights',
        image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzU5MzEyNTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Beach',
        rating: 4.9,
        reviews: 389,
        includes: ['Boutique Hotel', 'Wine Tasting', 'Boat Tours', 'Local Cuisine']
      },
      {
        id: 'dest_5',
        name: 'Tokyo Adventure',
        location: 'Tokyo, Japan',
        description: 'Immerse yourself in Japanese culture, cutting-edge technology, and incredible cuisine.',
        price: 2299,
        duration: '7 Days, 6 Nights',
        image: 'https://images.unsplash.com/photo-1602283662099-1c6c158ee94d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXxlbnwxfHx8fDE3NTk0MDExOTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'City',
        rating: 4.8,
        reviews: 456,
        includes: ['4-Star Hotel', 'JR Pass', 'Cultural Tours', 'Food Experience']
      },
      {
        id: 'dest_6',
        name: 'Bali Retreat',
        location: 'Bali, Indonesia',
        description: 'Find serenity in ancient temples, lush rice terraces, and pristine beaches.',
        price: 1499,
        duration: '6 Days, 5 Nights',
        image: 'https://images.unsplash.com/photo-1604394089666-6d365c060c6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwaW5kb25lc2lhJTIwdGVtcGxlfGVufDF8fHx8MTc1OTQwMzk5NHww&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Beach',
        rating: 4.7,
        reviews: 391,
        includes: ['Resort Stay', 'Temple Tours', 'Yoga Classes', 'Spa Treatments']
      },
      {
        id: 'dest_7',
        name: 'Swiss Alps Escape',
        location: 'Swiss Alps, Switzerland',
        description: 'Experience majestic mountain peaks, charming villages, and world-class skiing.',
        price: 2799,
        duration: '7 Days, 6 Nights',
        image: 'https://images.unsplash.com/photo-1633942515749-f93dddbbcff9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMGFscHMlMjBtb3VudGFpbnN8ZW58MXx8fHwxNzU5MzU0MDgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Mountain',
        rating: 4.9,
        reviews: 267,
        includes: ['Chalet Accommodation', 'Ski Passes', 'Mountain Tours', 'Swiss Cuisine']
      },
      {
        id: 'dest_8',
        name: 'Caribbean Beach',
        location: 'Caribbean Islands',
        description: 'Relax on stunning beaches, explore vibrant coral reefs, and enjoy island life.',
        price: 1899,
        duration: '6 Days, 5 Nights',
        image: 'https://images.unsplash.com/photo-1702743599501-a821d0b38b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzU5Mzc2MjMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Beach',
        rating: 4.8,
        reviews: 445,
        includes: ['Beachfront Resort', 'Snorkeling', 'Island Tours', 'Water Activities']
      }
    ];

    for (const dest of sampleDestinations) {
      await kv.set(`destination:${dest.id}`, dest);
    }

    await kv.set('destinations_initialized', true);
    
    return c.json({ message: 'Destinations initialized', count: sampleDestinations.length });
  } catch (error) {
    console.log('Error initializing destinations:', error);
    return c.json({ error: 'Failed to initialize destinations', details: String(error) }, 500);
  }
});

// Sign up route
app.post('/make-server-974c2250/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'user' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating user during signup:', error);
      return c.json({ error: 'Failed to create user', details: error.message }, 400);
    }

    // Store user profile in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Error in signup route:', error);
    return c.json({ error: 'Signup failed', details: String(error) }, 500);
  }
});

// Sync user profile - ensures logged in users have their profile in KV store
app.post('/make-server-974c2250/sync-profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      console.log('Authorization error while syncing profile:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if profile already exists
    const existingProfile = await kv.get(`user:${user.id}`);
    
    if (existingProfile) {
      // Check if this is the admin email but doesn't have admin role
      if (user.email === 'umar.farooq1592@gmail.com' && existingProfile.role !== 'admin') {
        // Auto-fix admin role
        const updatedProfile = {
          ...existingProfile,
          role: 'admin',
          name: 'Umar Farooq'
        };
        await kv.set(`user:${user.id}`, updatedProfile);
        return c.json({ success: true, profile: updatedProfile, synced: false, autoFixed: true });
      }
      return c.json({ success: true, profile: existingProfile, synced: false });
    }

    // Create profile from Supabase Auth metadata
    // Auto-assign admin role if this is the admin email
    const isAdminEmail = user.email === 'umar.farooq1592@gmail.com';
    
    const profile = {
      id: user.id,
      email: user.email,
      name: isAdminEmail ? 'Umar Farooq' : (user.user_metadata?.name || user.email?.split('@')[0] || 'User'),
      role: isAdminEmail ? 'admin' : (user.user_metadata?.role || 'user'),
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, profile);
    
    if (isAdminEmail) {
      await kv.set('admin_setup_complete', true);
    }

    return c.json({ success: true, profile, synced: true });
  } catch (error) {
    console.log('Error syncing user profile:', error);
    return c.json({ error: 'Failed to sync profile', details: String(error) }, 500);
  }
});

// Fix admin role - promotes the designated admin email to admin role
app.post('/make-server-974c2250/fix-admin-role', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      console.log('Authorization error while fixing admin role:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const adminEmail = 'umar.farooq1592@gmail.com';
    
    // Only allow fixing for the designated admin email
    if (user.email !== adminEmail) {
      return c.json({ error: 'Not authorized to become admin' }, 403);
    }

    // Update user metadata in Supabase Auth
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: { name: 'Umar Farooq', role: 'admin' }
      }
    );

    if (updateError) {
      console.log('Error updating user metadata:', updateError);
      return c.json({ error: 'Failed to update user metadata', details: updateError.message }, 400);
    }

    // Update profile in KV store
    const profile = {
      id: user.id,
      email: user.email,
      name: 'Umar Farooq',
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, profile);
    await kv.set('admin_setup_complete', true);

    return c.json({ success: true, message: 'Admin role granted!', profile });
  } catch (error) {
    console.log('Error fixing admin role:', error);
    return c.json({ error: 'Failed to fix admin role', details: String(error) }, 500);
  }
});

// Get all destinations
app.get('/make-server-974c2250/destinations', async (c) => {
  try {
    const destinations = await kv.getByPrefix('destination:');
    return c.json({ destinations });
  } catch (error) {
    console.log('Error fetching destinations:', error);
    return c.json({ error: 'Failed to fetch destinations', details: String(error) }, 500);
  }
});

// Get single destination
app.get('/make-server-974c2250/destinations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const destination = await kv.get(`destination:${id}`);
    
    if (!destination) {
      return c.json({ error: 'Destination not found' }, 404);
    }
    
    return c.json({ destination });
  } catch (error) {
    console.log('Error fetching destination:', error);
    return c.json({ error: 'Failed to fetch destination', details: String(error) }, 500);
  }
});

// Create booking
app.post('/make-server-974c2250/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      console.log('Authorization error while creating booking:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingData = await c.req.json();
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const booking = {
      id: bookingId,
      userId: user.id,
      ...bookingData,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    await kv.set(`booking:${bookingId}`, booking);
    await kv.set(`user_booking:${user.id}:${bookingId}`, bookingId);

    return c.json({ success: true, booking });
  } catch (error) {
    console.log('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking', details: String(error) }, 500);
  }
});

// Get user bookings
app.get('/make-server-974c2250/my-bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      console.log('Authorization error while fetching user bookings:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingKeys = await kv.getByPrefix(`user_booking:${user.id}:`);
    const bookingIds = bookingKeys.map((key: string) => key);
    
    const bookings = [];
    for (const bookingId of bookingIds) {
      const booking = await kv.get(`booking:${bookingId}`);
      if (booking) {
        bookings.push(booking);
      }
    }

    return c.json({ bookings });
  } catch (error) {
    console.log('Error fetching user bookings:', error);
    return c.json({ error: 'Failed to fetch bookings', details: String(error) }, 500);
  }
});

// Admin: Get all bookings
app.get('/make-server-974c2250/admin/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const bookings = await kv.getByPrefix('booking:');
    return c.json({ bookings });
  } catch (error) {
    console.log('Error fetching all bookings (admin):', error);
    return c.json({ error: 'Failed to fetch bookings', details: String(error) }, 500);
  }
});

// Admin: Get all users
app.get('/make-server-974c2250/admin/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    console.log('Error fetching all users (admin):', error);
    return c.json({ error: 'Failed to fetch users', details: String(error) }, 500);
  }
});

// Admin: Add destination
app.post('/make-server-974c2250/admin/destinations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const destinationData = await c.req.json();
    const destId = `dest_${Date.now()}`;
    
    const destination = {
      id: destId,
      ...destinationData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`destination:${destId}`, destination);

    return c.json({ success: true, destination });
  } catch (error) {
    console.log('Error creating destination (admin):', error);
    return c.json({ error: 'Failed to create destination', details: String(error) }, 500);
  }
});

// Admin: Delete destination
app.delete('/make-server-974c2250/admin/destinations/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`destination:${id}`);

    return c.json({ success: true, message: 'Destination deleted' });
  } catch (error) {
    console.log('Error deleting destination (admin):', error);
    return c.json({ error: 'Failed to delete destination', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
