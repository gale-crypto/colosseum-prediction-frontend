# Admin Setup Guide

## ✅ Admin-Only Market Creation Implemented

Market creation is now restricted to administrators only.

## 🔧 Setup Steps

### 1. Add Admin Field to Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;
```

### 2. Set Admin Users

Set specific wallet addresses as admins:

```sql
-- Replace with your admin wallet address
UPDATE users 
SET is_admin = TRUE 
WHERE wallet_address = 'YOUR_WALLET_ADDRESS_HERE';
```

**Example:**
```sql
UPDATE users 
SET is_admin = TRUE 
WHERE wallet_address = '24cUKwiWbv6yukVJKVNRxMmBayEAHAne4FYcxdppyh33';
```

### 3. Verify Admin Status

Check if a user is admin:

```sql
SELECT wallet_address, username, is_admin 
FROM users 
WHERE is_admin = TRUE;
```

## 🔒 Security Features

### Frontend Protection
- ✅ Admin page checks `user.is_admin` before rendering
- ✅ Shows "Access Denied" message for non-admins
- ✅ Admin link in sidebar only visible to admins
- ✅ Market creation hook validates admin status

### Backend Protection (Recommended)
Update RLS policies to restrict market creation:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Markets authenticated insert" ON markets;

-- Create admin-only insert policy
CREATE POLICY "Markets admin insert" 
ON markets 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = creator_id 
    AND is_admin = TRUE
  )
);
```

## 📋 What's Protected

### Admin-Only Features
- ✅ **Create Markets** - Only admins can access `/admin` page
- ✅ **Market Creation API** - Validates admin status before creating

### User Features (Available to All)
- ✅ View markets
- ✅ Post comments
- ✅ Like comments
- ✅ View profiles

## 🎯 User Experience

### For Admins
- See "Admin" link in sidebar
- Can access `/admin` page
- Can create new markets
- See admin badge/indicator

### For Non-Admins
- Don't see "Admin" link in sidebar
- See "Access Denied" if they try to access `/admin`
- Clear error message explaining restriction
- Can still use all other features

## 🐛 Troubleshooting

### Admin Can't Create Markets
1. Check `is_admin = TRUE` in database
2. Verify wallet address matches exactly
3. Check browser console for errors
4. Ensure user is authenticated

### Non-Admin Sees Admin Link
1. Clear browser cache
2. Reconnect wallet
3. Check `user.is_admin` value in console

### "Access Denied" for Admin
1. Verify `is_admin` field exists in users table
2. Check user record has `is_admin = TRUE`
3. Try disconnecting and reconnecting wallet

## 📝 Files Modified

- `src/types/database.ts` - Added `is_admin` to User type
- `src/services/walletAuthService.ts` - Set `is_admin: false` for new users
- `src/hooks/useMarkets.ts` - Added admin check in `useCreateMarket`
- `src/pages/AdminPage.tsx` - Added admin access checks
- `src/components/Sidebar.tsx` - Hide admin link for non-admins

## 🔮 Future Enhancements

1. **Admin Dashboard** - View all markets, users, analytics
2. **Market Management** - Edit/delete markets
3. **User Management** - Promote/demote users
4. **Admin Logs** - Track admin actions
5. **Role-Based Permissions** - Multiple admin levels

