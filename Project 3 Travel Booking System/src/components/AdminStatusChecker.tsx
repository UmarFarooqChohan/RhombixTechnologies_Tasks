import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminStatusCheckerProps {
  accessToken: string;
  userId: string;
  onAdminFixed?: () => void;
}

export function AdminStatusChecker({ accessToken, userId, onAdminFixed }: AdminStatusCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkStatus = async () => {
    setChecking(true);
    setResult(null);

    try {
      // Step 1: Sync profile
      console.log('Step 1: Syncing profile...');
      const syncResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/sync-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const syncData = await syncResponse.json();
      console.log('Sync response:', syncData);

      // Step 2: Check admin users
      console.log('Step 2: Checking admin users...');
      const usersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      let usersData = null;
      if (usersResponse.ok) {
        usersData = await usersResponse.json();
        console.log('Users response:', usersData);
      } else {
        console.log('Users endpoint error:', await usersResponse.text());
      }

      setResult({
        profile: syncData.profile,
        synced: syncData.synced,
        isAdmin: syncData.profile?.role === 'admin',
        allUsers: usersData?.users || [],
        currentUserId: userId,
        canFixAdmin: syncData.profile?.email === 'umar.farooq1592@gmail.com'
      });

    } catch (error) {
      console.error('Error checking status:', error);
      setResult({ error: String(error) });
    }

    setChecking(false);
  };

  const fixAdminRole = async () => {
    setFixing(true);

    try {
      console.log('Fixing admin role for user...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-974c2250/fix-admin-role`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Admin role fixed!', data);
        alert('🎉 Admin role granted! Please refresh the page to see changes.');
        
        // Re-check status
        await checkStatus();
        
        // Notify parent component
        if (onAdminFixed) {
          onAdminFixed();
        }
      } else {
        console.error('Failed to fix admin role:', data);
        alert(`Failed to fix admin role: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fixing admin role:', error);
      alert(`Error: ${String(error)}`);
    }

    setFixing(false);
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Admin Status Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">
          Click the button below to diagnose why the Admin Dashboard button might not be showing.
        </p>

        <div className="flex gap-2">
          <Button onClick={checkStatus} disabled={checking}>
            {checking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Admin Status
              </>
            )}
          </Button>

          {result && result.canFixAdmin && !result.isAdmin && (
            <Button 
              onClick={fixAdminRole} 
              disabled={fixing}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {fixing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Grant Admin Role
                </>
              )}
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-3 mt-4">
            {result.error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">Error: {result.error}</p>
              </div>
            ) : (
              <>
                <div className={`p-3 border rounded ${result.isAdmin ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.isAdmin ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className={result.isAdmin ? 'text-green-800' : 'text-yellow-800'}>
                      {result.isAdmin ? '✅ You ARE an admin!' : '❌ You are NOT an admin'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p><strong>User ID:</strong> {result.currentUserId}</p>
                    <p><strong>Email:</strong> {result.profile?.email}</p>
                    <p><strong>Name:</strong> {result.profile?.name}</p>
                    <p><strong>Role:</strong> <Badge variant={result.isAdmin ? 'default' : 'secondary'}>{result.profile?.role}</Badge></p>
                    <p><strong>Profile Synced:</strong> {result.synced ? 'Yes (just created)' : 'No (already existed)'}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <h4 className="text-sm mb-2">All Users in Database ({result.allUsers.length}):</h4>
                  {result.allUsers.length === 0 ? (
                    <p className="text-xs text-gray-600">No users found in KV store</p>
                  ) : (
                    <div className="space-y-2">
                      {result.allUsers.map((user: any) => (
                        <div key={user.id} className="text-xs p-2 bg-white rounded border border-gray-200">
                          <p><strong>{user.email}</strong> - {user.name}</p>
                          <p>Role: <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></p>
                          <p className="text-gray-500">ID: {user.id}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!result.isAdmin && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="text-sm mb-2">How to become admin:</h4>
                    <ol className="text-xs space-y-1 ml-4 list-decimal">
                      <li>Log out of current account</li>
                      <li>Login with: <strong>umar.farooq1592@gmail.com</strong></li>
                      <li>Password: <strong>umar</strong></li>
                      <li>The admin account should be auto-created on first app load</li>
                    </ol>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
