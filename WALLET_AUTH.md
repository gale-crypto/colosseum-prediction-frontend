# Wallet Authentication with Supabase

## ✅ Integration Complete

Wallet connection now automatically authenticates users with Supabase, enabling them to:
- Create markets
- Post comments
- Like comments
- Access authenticated features

## 🔧 How It Works

### 1. Wallet Connection Flow

When a user connects their wallet:
1. **Wallet Connects** → Reown AppKit connects Solana wallet
2. **Auto Authentication** → `useWalletAuth` hook detects connection
3. **User Creation/Lookup** → Checks if user exists in Supabase `users` table by `wallet_address`
4. **Session Storage** → Stores wallet address and user ID in sessionStorage
5. **User Ready** → User can now create markets, post comments, etc.

### 2. Authentication Service

**`walletAuthService.ts`** handles:
- `authenticateWithWallet()` - Creates or finds user by wallet address
- `getCurrentUser()` - Retrieves current authenticated user
- `signOut()` - Clears session and signs out
- `isAuthenticated()` - Checks if user is logged in

### 3. React Hook

**`useWalletAuth()`** provides:
- `user` - Current user object from Supabase
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Loading state
- `walletAddress` - Connected wallet address
- `isConnected` - Wallet connection status
- `signOut()` - Sign out function

## 📝 Usage Examples

### In Components

```typescript
import { useWalletAuth } from '../hooks/useWalletAuth'

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useWalletAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please connect wallet</div>
  
  return <div>Welcome, {user?.username || user?.wallet_address}</div>
}
```

### Creating Markets

The `useCreateMarket()` hook automatically uses wallet authentication:

```typescript
const createMarketMutation = useCreateMarket()

// User must be connected and authenticated
createMarketMutation.mutate({
  question: 'Will...',
  description: '...',
  category_id: '...',
  // ...
})
```

### Posting Comments

```typescript
const { user, isAuthenticated } = useWalletAuth()

const handlePostComment = async () => {
  if (!isAuthenticated) {
    alert('Please connect your wallet')
    return
  }
  
  await createCommentMutation.mutateAsync({
    marketId: id,
    userId: user.id,
    content: 'My comment'
  })
}
```

## 🔐 User Creation

When a wallet connects for the first time:
1. A new user record is created in the `users` table
2. `wallet_address` is set to the connected wallet address
3. Other fields (username, email, etc.) are null initially
4. User can update profile later

## 🗄️ Database Schema

The `users` table stores:
- `id` - UUID primary key
- `wallet_address` - Unique Solana wallet address
- `username` - Optional username
- `email` - Optional email
- `reputation_score` - User reputation
- `total_volume` - Trading volume
- `total_profit` - Total profit
- `win_rate` - Win rate percentage
- `is_verified` - Verification status

## 🔄 Session Management

Authentication state is stored in:
- `sessionStorage.getItem('wallet_address')` - Wallet address
- `sessionStorage.getItem('user_id')` - User ID

**Note:** Session persists across page refreshes but clears when:
- User disconnects wallet
- User clicks "Log out"
- Browser session ends

## 🚀 Features Enabled

With wallet authentication, users can:

✅ **Create Markets** (`/admin`)
- Requires authentication
- Sets `creator_id` to current user

✅ **Post Comments**
- Requires authentication
- Links comment to user

✅ **Like Comments**
- Requires authentication
- Tracks likes per user

✅ **User Profile**
- Shows wallet address
- Shows username if set
- Shows reputation score

## 🔒 Security Considerations

### Current Implementation
- Uses `sessionStorage` for session management
- Wallet address is the authentication identifier
- No password required (wallet signature is proof)

### Production Recommendations
1. **Add Message Signing**: Require users to sign a message to prove wallet ownership
2. **JWT Tokens**: Use Supabase Auth with custom JWT tokens
3. **Backend Validation**: Validate wallet signatures on backend
4. **Rate Limiting**: Add rate limits for authenticated actions
5. **Session Expiry**: Implement session expiry logic

## 🐛 Troubleshooting

### User Not Authenticated
- Check wallet is connected
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies allow user creation

### Can't Create Markets
- Ensure wallet is connected
- Check user exists in `users` table
- Verify `creator_id` is set correctly

### Comments Not Posting
- Check authentication status
- Verify user ID is valid
- Check RLS policies for comments table

## 📚 Related Files

- `src/services/walletAuthService.ts` - Authentication service
- `src/hooks/useWalletAuth.ts` - React hook for auth
- `src/components/UserMenu.tsx` - Updated to use wallet auth
- `src/pages/MarketDetailPage.tsx` - Updated comment posting
- `src/pages/AdminPage.tsx` - Uses wallet auth for market creation

## 🔮 Future Enhancements

1. **Message Signing**: Add wallet signature verification
2. **Profile Management**: Allow users to set username, avatar
3. **Social Features**: Follow users, notifications
4. **Reputation System**: Calculate reputation from trading activity
5. **Verification Badge**: Verify users with verified wallets

