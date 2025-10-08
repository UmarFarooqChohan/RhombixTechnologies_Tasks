# Admin Login Credentials

## 🔑 Admin Account

**Email:** `umar.farooq1592@gmail.com`  
**Password:** `umar`

---

## 📝 Important Notes

1. **Auto-Creation:** The admin account is automatically created when the app first initializes
2. **Password Security:** Passwords are encrypted by Supabase Auth and cannot be viewed in the database
3. **Admin Access:** Only this account has admin privileges and can access:
   - Admin Dashboard
   - Destination Management (Create/Delete destinations)
   - User Management (View all users)
   - Booking Management (View all bookings)
   - Database Viewer (View raw KV store data)

---

## 🚀 How to Access Admin Dashboard

1. Go to the login page
2. Enter email: `umar.farooq1592@gmail.com`
3. Enter password: `umar`
4. Click "Sign In"
5. Look for the green **"Admin Dashboard"** button in the header
6. Click it to access admin features

---

## 🔧 If Admin Button Doesn't Show

1. Click the **"Check Admin Status"** button (blue card on home page)
2. This will diagnose the issue and show your current role
3. If you're not recognized as admin, try:
   - Logging out and logging back in
   - Refreshing the page
   - Checking browser console for error messages

---

## 🛡️ Security Best Practices

- ✅ Never share admin credentials
- ✅ Change password if compromised (requires Supabase dashboard access)
- ✅ Admin password is hashed and cannot be retrieved
- ✅ Use strong passwords in production environments
- ⚠️ Current password "umar" is simple - only use for development/testing

---

## 📊 Admin Capabilities

### View & Manage Destinations
- See all destinations with full details
- Create new destinations with images
- Delete existing destinations
- View destination analytics

### View & Manage Bookings
- See all user bookings
- View booking details (user, dates, amounts)
- Track booking status
- Cancel bookings if needed

### View & Manage Users
- See all registered users
- View user profiles (email, name, role)
- See user registration dates
- **Note:** Cannot see user passwords (security feature)

### Database Explorer
- View raw KV store data
- Browse all stored information
- See JSON structure of data
- Verify data integrity

---

Last Updated: October 5, 2025
