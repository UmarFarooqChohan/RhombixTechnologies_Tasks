import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ArrowLeft, Database } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DatabaseViewerProps {
  accessToken: string;
  onBack: () => void;
}

export function DatabaseViewer({ accessToken, onBack }: DatabaseViewerProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchDestinations(),
      fetchBookings()
    ]);
    setLoading(false);
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

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
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

      if (response.ok) {
        const data = await response.json();
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

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl">Database Explorer</h1>
          </div>
          <p className="text-gray-600">View all data stored in Supabase KV Store</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm">
              <strong>🔒 Security Note:</strong> User passwords are NOT shown here (or anywhere) because they are encrypted by Supabase Auth. 
              This is a security best practice - passwords should never be visible, even to admins.
            </p>
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users Data ({users.length})</TabsTrigger>
            <TabsTrigger value="destinations">Destinations ({destinations.length})</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Profiles (Passwords are encrypted by Supabase Auth)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : users.length === 0 ? (
                  <p className="text-gray-500">No users found</p>
                ) : (
                  <div className="space-y-4">
                    {users.map((user, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(user, null, 2)}
                        </pre>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Email:</strong> {user.email}<br />
                            <strong>Name:</strong> {user.name}<br />
                            <strong>Role:</strong> <Badge>{user.role}</Badge><br />
                            <strong>Password:</strong> <span className="text-red-600">🔒 ENCRYPTED (not visible for security)</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Destinations Data</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : destinations.length === 0 ? (
                  <p className="text-gray-500">No destinations found</p>
                ) : (
                  <div className="space-y-4">
                    {destinations.map((dest, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(dest, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Data</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-gray-500">No bookings found</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(booking, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Password Authentication Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm mb-2">✅ When User Signs Up:</h3>
              <ol className="text-sm space-y-1 ml-4 list-decimal">
                <li>User enters password: "mypassword123"</li>
                <li>Supabase Auth encrypts it: "$2a$10$X7Y8Z9..." (hash)</li>
                <li>Only the hash is stored in database</li>
                <li>Original password is immediately discarded</li>
              </ol>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm mb-2">✅ When User Logs In:</h3>
              <ol className="text-sm space-y-1 ml-4 list-decimal">
                <li>User enters password: "mypassword123"</li>
                <li>Supabase Auth hashes the entered password</li>
                <li>Compares the hash with stored hash</li>
                <li>If they match → login successful</li>
                <li>Original password is never compared directly</li>
              </ol>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-sm mb-2">🔒 Why This Is Important:</h3>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li><strong>Security:</strong> If database is hacked, passwords are safe</li>
                <li><strong>Privacy:</strong> Even admins can't see user passwords</li>
                <li><strong>Industry Standard:</strong> All secure systems work this way</li>
                <li><strong>Cannot be reversed:</strong> Hash cannot be converted back to password</li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-sm mb-2">❌ What You SHOULD NOT See:</h3>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Plain text passwords (MAJOR security risk)</li>
                <li>Reversible encrypted passwords (still a risk)</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
              <h3 className="text-sm mb-2">📋 What You CAN See (This App):</h3>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>User email addresses</li>
                <li>User names</li>
                <li>User roles (admin/user)</li>
                <li>Registration dates</li>
                <li>All booking information</li>
                <li>All destination data</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
