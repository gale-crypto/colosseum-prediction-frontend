# Fix Markets RLS Policy

## Problem

When creating a market, you get:
```
Error: new row violates row-level security policy for table "markets"
Code: 42501
```

This happens because the RLS policy checks for `auth.role() = 'authenticated'`, but wallet-based authentication doesn't use Supabase Auth roles.

## Solution

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Markets authenticated insert" ON markets;
DROP POLICY IF EXISTS "Markets authenticated update" ON markets;

-- Allow inserts if creator_id exists in users table
CREATE POLICY "Markets authenticated insert" 
ON markets 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = creator_id
  )
);

-- Allow updates if user is the creator
CREATE POLICY "Markets creator update" 
ON markets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = creator_id 
    AND users.id = markets.creator_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = creator_id 
    AND users.id = markets.creator_id
  )
);
```

## Admin-Only Alternative

If you want only admins to create markets, use this instead:

```sql
DROP POLICY IF EXISTS "Markets authenticated insert" ON markets;

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

## Steps

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the SQL above
3. Click "Run"
4. Try creating a market again

The policy now checks if the `creator_id` exists in the `users` table instead of checking for Supabase Auth roles.

