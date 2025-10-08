# 🔧 Supabase Client Singleton Pattern

## ✅ Fixed: Multiple GoTrueClient Instances Error

### **Problem**
Previously, multiple components were creating their own Supabase client instances:
- `App.tsx` created one instance
- `AuthPage.tsx` created another instance
- This caused the warning: "Multiple GoTrueClient instances detected in the same browser context"

### **Solution**
Implemented a **singleton pattern** for the Supabase client to ensure only one instance exists across the entire application.

---

## 📁 New File Structure

```
/utils/supabase/
├── info.tsx          # Project ID and API keys
└── client.tsx        # ✨ NEW: Singleton Supabase client
```

---

## 🔍 Implementation Details

### **1. Singleton Client (`/utils/supabase/client.tsx`)**

```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton instance
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        }
      }
    );
  }
  return supabaseInstance;
}

// Export singleton instance
export const supabase = getSupabaseClient();
```

### **2. Usage Across Components**

**Before (❌ Multiple Instances):**
```typescript
// App.tsx
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

// AuthPage.tsx
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key); // ❌ Second instance!
```

**After (✅ Singleton):**
```typescript
// App.tsx
import { supabase } from './utils/supabase/client';

// AuthPage.tsx
import { supabase } from '../utils/supabase/client';

// Both use the SAME instance!
```

---

## 🎯 Additional Improvements

### **1. Auth State Listener**
Added proper auth state change listener in `App.tsx`:

```typescript
useEffect(() => {
  checkSession();
  
  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (session) {
        setAccessToken(session.access_token);
        setUserId(session.user.id);
        checkAdminStatus(session.user.id);
      } else {
        // Handle logout
        setAccessToken(null);
        setUserId(null);
        setIsAdmin(false);
        setCurrentView('auth');
      }
    }
  );

  // Cleanup subscription
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### **2. Optimized Admin Status Check**
Removed redundant session fetching:

```typescript
const checkAdminStatus = async (uid: string) => {
  // Use existing accessToken instead of fetching session again
  let token = accessToken;
  
  if (!token) {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || null;
  }
  
  if (!token) return;
  
  // Single API call to check admin status
  const profileResponse = await fetch(...);
  // ... rest of logic
};
```

### **3. Cleanup on Component Unmount**
The auth state listener now properly unsubscribes when the component unmounts, preventing memory leaks.

---

## 🚀 Benefits

### **Performance:**
- ✅ Only one Supabase client instance created
- ✅ Reduced memory footprint
- ✅ Faster auth state changes
- ✅ No redundant session fetches

### **Reliability:**
- ✅ Consistent auth state across components
- ✅ No race conditions between multiple clients
- ✅ Proper cleanup prevents memory leaks
- ✅ Single source of truth for auth

### **Developer Experience:**
- ✅ Simple import: `import { supabase } from './utils/supabase/client'`
- ✅ No configuration needed in each component
- ✅ Centralized auth configuration
- ✅ TypeScript support maintained

---

## 📋 Files Updated

1. **Created:**
   - `/utils/supabase/client.tsx` - Singleton client

2. **Updated:**
   - `/App.tsx` - Uses singleton, added auth listener
   - `/components/AuthPage.tsx` - Uses singleton

3. **Unchanged:**
   - All other components (they don't create Supabase clients)

---

## 🧪 Testing the Fix

### **1. Check Browser Console**
You should **NO LONGER** see this warning:
```
⚠️ Multiple GoTrueClient instances detected in the same browser context
```

### **2. Verify Auth Works**
- ✅ Login/Logout still works
- ✅ Session persistence works
- ✅ Auto-refresh tokens work
- ✅ Admin detection works

### **3. Developer Tools**
Open React DevTools and verify:
- Only one Supabase client instance exists
- Auth state updates correctly
- No memory leaks on unmount

---

## 🔐 Security Notes

- ✅ Public anon key is safe to use in frontend
- ✅ Row Level Security (RLS) enforced on backend
- ✅ Service role key ONLY used in server-side code
- ✅ Auth tokens properly validated on backend

---

## 📚 Best Practices Going Forward

### **DO:**
- ✅ Import from `/utils/supabase/client.tsx`
- ✅ Use the exported `supabase` singleton
- ✅ Let the singleton handle configuration

### **DON'T:**
- ❌ Create new Supabase clients with `createClient()`
- ❌ Store multiple instances in different components
- ❌ Bypass the singleton pattern

### **Example (Correct Usage):**
```typescript
// ✅ GOOD
import { supabase } from './utils/supabase/client';

const MyComponent = () => {
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password'
    });
  };
};
```

```typescript
// ❌ BAD
import { createClient } from '@supabase/supabase-js';

const MyComponent = () => {
  const supabase = createClient(url, key); // ❌ Don't do this!
  // ...
};
```

---

## 🐛 Troubleshooting

### **Still Seeing the Warning?**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check all components use singleton import
4. Verify no other files create Supabase clients

### **Auth Not Working?**
1. Check browser console for errors
2. Verify `projectId` and `publicAnonKey` are correct
3. Check Supabase project is active
4. Test with incognito mode

### **Session Lost on Refresh?**
1. Check `persistSession: true` in client config
2. Verify localStorage is enabled
3. Check browser privacy settings

---

Last Updated: October 8, 2025  
Status: ✅ **FIXED**
