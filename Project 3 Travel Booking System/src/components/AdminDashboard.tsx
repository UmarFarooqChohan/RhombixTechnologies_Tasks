import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ArrowLeft, Plus, Trash2, Users, MapPin, Calendar, Database } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DatabaseViewer } from './DatabaseViewer';

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

interface Booking {
  id: string;
  destinationName: string;
  destinationLocation: string;
  travelers: number;
  startDate: string;
  fullName: string;
  email: string;
  phone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface AdminDashboardProps {
  accessToken: string;
  onBack: () => void;
}

export function AdminDashboard({ accessToken, onBack }: AdminDashboardProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);

  // Form state
  const [newDestName, setNewDestName] = useState('');
  const [newDestLocation, setNewDestLocation] = useState('');
  const [newDestDescription, setNewDestDescription] = useState('');
  const [newDestPrice, setNewDestPrice] = useState('');
  const [newDestDuration, setNewDestDuration] = useState('');
  const [newDestImage, setNewDestImage] = useState('');
  const [newDestCategory, setNewDestCategory] = useState('Beach');
  const [newDestIncludes, setNewDestIncludes] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDestinations(),
      fetchBookings(),
      fetchUsers()
    ]);
    setLoading(false);
  };

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
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/admin/bookings`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();

    const includesArray = newDestIncludes.split(',').map(item => item.trim()).filter(item => item);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/admin/destinations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: newDestName,
            location: newDestLocation,
            description: newDestDescription,
            price: parseFloat(newDestPrice),
            duration: newDestDuration,
            image: newDestImage,
            category: newDestCategory,
            rating: 4.5,
            reviews: 0,
            includes: includesArray,
          }),
        }
      );

      if (response.ok) {
        setShowAddDestination(false);
        resetForm();
        await fetchDestinations();
      } else {
        const error = await response.json();
        console.error('Failed to add destination:', error);
        alert('Failed to add destination');
      }
    } catch (error) {
      console.error('Error adding destination:', error);
      alert('Failed to add destination');
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/admin/destinations/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        await fetchDestinations();
      } else {
        const error = await response.json();
        console.error('Failed to delete destination:', error);
        alert('Failed to delete destination');
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Failed to delete destination');
    }
  };

  const resetForm = () => {
    setNewDestName('');
    setNewDestLocation('');
    setNewDestDescription('');
    setNewDestPrice('');
    setNewDestDuration('');
    setNewDestImage('');
    setNewDestCategory('Beach');
    setNewDestIncludes('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (showDatabaseViewer) {
    return <DatabaseViewer accessToken={accessToken} onBack={() => setShowDatabaseViewer(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => setShowDatabaseViewer(true)}>
              <Database className="w-4 h-4 mr-2" />
              View Raw Database
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage destinations, bookings, and users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Destinations</p>
                  <p className="text-3xl mt-1">{destinations.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-3xl mt-1">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl mt-1">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="destinations">
          <TabsList>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Destinations Tab */}
          <TabsContent value="destinations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl">Manage Destinations</h2>
              <Dialog open={showAddDestination} onOpenChange={setShowAddDestination}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Destination
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Destination</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddDestination} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Destination Name</Label>
                        <Input
                          id="name"
                          value={newDestName}
                          onChange={(e) => setNewDestName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newDestLocation}
                          onChange={(e) => setNewDestLocation(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDestDescription}
                        onChange={(e) => setNewDestDescription(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (USD)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newDestPrice}
                          onChange={(e) => setNewDestPrice(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          placeholder="5 Days, 4 Nights"
                          value={newDestDuration}
                          onChange={(e) => setNewDestDuration(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          value={newDestCategory}
                          onChange={(e) => setNewDestCategory(e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          required
                        >
                          <option value="Beach">Beach</option>
                          <option value="City">City</option>
                          <option value="Mountain">Mountain</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        type="url"
                        value={newDestImage}
                        onChange={(e) => setNewDestImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="includes">What's Included (comma-separated)</Label>
                      <Textarea
                        id="includes"
                        value={newDestIncludes}
                        onChange={(e) => setNewDestIncludes(e.target.value)}
                        placeholder="5-Star Resort, All Meals Included, Water Sports"
                        rows={2}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">Add Destination</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destination</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destinations.map((dest) => (
                    <TableRow key={dest.id}>
                      <TableCell>{dest.name}</TableCell>
                      <TableCell>{dest.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dest.category}</Badge>
                      </TableCell>
                      <TableCell>${dest.price}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDestination(dest.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-xl">All Bookings</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Travelers</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="text-sm text-gray-500">
                        {booking.id.substring(0, 12)}...
                      </TableCell>
                      <TableCell>{booking.destinationName}</TableCell>
                      <TableCell>{booking.fullName}</TableCell>
                      <TableCell>{booking.travelers}</TableCell>
                      <TableCell>{formatDate(booking.startDate)}</TableCell>
                      <TableCell>${booking.totalPrice}</TableCell>
                      <TableCell>
                        <Badge>{booking.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl">All Users</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
