# Fix RLS Policies for Wallet Authentication

## Problem

The 406 (Not Acceptable) error occurs because Row Level Security (RLS) policies on the `users` table are blocking wallet-based authentication.

The current policies require `auth.uid() = id`, but wallet-based auth doesn't use Supabase Auth, so `auth.uid()` is null.

## Solution

Run the SQL migration script to update RLS policies:

### Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project: https://sgungezjivnpjcyovaea.supabase.co
   - Navigate to SQL Editor

2. **Run the Migration Script**
   - Copy the contents of `colosseum_prediction_backend/database/fix_wallet_auth_rls.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Policies**
   - Go to Authentication > Policies
   - Check that `users` table has:
     - ✅ "Users public read" (SELECT)
     - ✅ "Users public insert" (INSERT)
     - ✅ "Users update own" (UPDATE)

## What the Fix Does

The updated policies:
- ✅ Allow **public read** - Anyone can view user profiles
- ✅ Allow **public insert** - Anyone can create a user account (needed for wallet auth)
- ✅ Allow **public update** - Users can update their profiles (you can restrict this later)

## Security Note

For production, consider:
1. Adding rate limiting for user creation
2. Requiring wallet signature verification
3. Restricting updates to only allow users to update their own records
4. Adding validation for wallet addresses

## Alternative: Use Supabase Auth

If you want stricter security, you can:
1. Use Supabase Auth with custom JWT tokens
2. Sign messages with wallet and verify on backend
3. Create Supabase Auth users with wallet addresses as metadata

For now, the public insert/update policies work for development and MVP.

