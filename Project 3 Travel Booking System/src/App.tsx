import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { DestinationDetail } from './components/DestinationDetail';
import { UserBookings } from './components/UserBookings';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';

interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  includes: string[];
}

type View = 'auth' | 'home' | 'destination' | 'bookings' | 'admin';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<View>('auth');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAccessToken(session.access_token);
        setUserId(session.user.id);
        checkAdminStatus(session.user.id);
      } else {
        setAccessToken(null);
        setUserId(null);
        setIsAdmin(false);
        setCurrentView('auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (accessToken && !initialized) {
      initializeApp();
    }
  }, [accessToken, initialized]);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setAccessToken(data.session.access_token);
      setUserId(data.session.user.id);
      
      // Sync user profile to ensure it exists in KV store
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/sync-profile`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error syncing profile:', error);
      }
      
      await checkAdminStatus(data.session.user.id);
      setCurrentView('home');
    }
  };

  const checkAdminStatus = async (uid: string) => {
    try {
      // Use accessToken if available, otherwise get fresh session
      let token = accessToken;
      
      if (!token) {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token || null;
      }
      
      if (!token) return;

      // Get profile and check admin status
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/sync-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('User profile synced:', profileData.profile);
        if (profileData.profile?.role === 'admin') {
          console.log('✅ Admin access granted!');
          setIsAdmin(true);
        } else {
          console.log('❌ User is not admin. Role:', profileData.profile?.role);
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const initializeApp = async () => {
    try {
      // Initialize sample destinations on first run
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/init`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const handleLogin = async (token: string, uid: string) => {
    setAccessToken(token);
    setUserId(uid);
    setCurrentView('home');
    
    // Sync user profile to ensure it exists in KV store
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/sync-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error syncing profile:', error);
    }
    
    // Check admin status after login
    setTimeout(async () => {
      await checkAdminStatus(uid);
    }, 500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setUserId(null);
    setIsAdmin(false);
    setCurrentView('auth');
  };

  const handleViewDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentView('destination');
  };

  const handleBackToHome = () => {
    setSelectedDestination(null);
    setCurrentView('home');
  };

  const handleViewBookings = () => {
    setCurrentView('bookings');
  };

  const handleViewAdmin = () => {
    setCurrentView('admin');
  };

  const handleBookingComplete = () => {
    setCurrentView('bookings');
  };

  if (!accessToken) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentView === 'destination' && selectedDestination && accessToken) {
    return (
      <DestinationDetail
        destination={selectedDestination}
        accessToken={accessToken}
        onBack={handleBackToHome}
        onBookingComplete={handleBookingComplete}
      />
    );
  }

  if (currentView === 'bookings' && accessToken) {
    return (
      <UserBookings
        accessToken={accessToken}
        onBack={handleBackToHome}
      />
    );
  }

  if (currentView === 'admin' && accessToken && isAdmin) {
    return (
      <AdminDashboard
        accessToken={accessToken}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <HomePage
      accessToken={accessToken}
      userId={userId || ''}
      onLogout={handleLogout}
      onViewDestination={handleViewDestination}
      onViewBookings={handleViewBookings}
      onViewAdmin={handleViewAdmin}
      isAdmin={isAdmin}
      onRefreshAdminStatus={() => {
        if (userId) {
          checkAdminStatus(userId);
        }
      }}
    />
  );
}
