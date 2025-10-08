import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Search, MapPin, Star, Calendar, User, LogOut, Settings } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AdminStatusChecker } from './AdminStatusChecker';

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

interface HomePageProps {
  accessToken: string;
  userId: string;
  onLogout: () => void;
  onViewDestination: (destination: Destination) => void;
  onViewBookings: () => void;
  onViewAdmin: () => void;
  isAdmin: boolean;
  onRefreshAdminStatus?: () => void;
}

export function HomePage({ accessToken, userId, onLogout, onViewDestination, onViewBookings, onViewAdmin, isAdmin, onRefreshAdminStatus }: HomePageProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Beach', 'City', 'Mountain'];

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [searchQuery, selectedCategory, destinations]);

  const fetchDestinations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/destinations`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setDestinations(data.destinations || []);
      } else {
        console.error('Failed to fetch destinations:', data);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
    
    setLoading(false);
  };

  const filterDestinations = () => {
    let filtered = destinations;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((dest) => dest.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((dest) =>
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDestinations(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl">TravelBooking</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onViewBookings}>
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </Button>
              {isAdmin ? (
                <Button variant="default" size="sm" onClick={onViewAdmin} className="bg-green-600 hover:bg-green-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              ) : (
                <span className="text-xs text-gray-400 px-2">
                  {/* Debug: Not admin */}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-4">Discover Your Next Adventure</h1>
            <p className="text-xl text-blue-100">Explore amazing destinations around the world</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <Input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Status Checker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminStatusChecker 
          accessToken={accessToken} 
          userId={userId} 
          onAdminFixed={() => {
            if (onRefreshAdminStatus) {
              onRefreshAdminStatus();
            }
          }}
        />
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading destinations...</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No destinations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDestination(destination)}>
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImageWithFallback
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-white text-gray-900">
                    {destination.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg mb-1">{destination.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.location}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{destination.rating}</span>
                    <span className="text-sm text-gray-500">({destination.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl text-blue-600">${destination.price}</span>
                      <span className="text-sm text-gray-500 ml-1">per person</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{destination.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
