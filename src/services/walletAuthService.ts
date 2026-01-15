import { supabase } from '../lib/supabase'
import type { User } from '../types/database'

export class WalletAuthService {
  /**
   * Authenticate user with wallet address
   * Creates or updates user in Supabase
   */
  async authenticateWithWallet(walletAddress: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Check if user exists with this wallet address
      // Use ilike for case-insensitive matching and handle potential encoding issues
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.trim())
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no row found

      if (fetchError) {
        // PGRST116 means no rows found, which is fine - user doesn't exist yet
        // 406 errors might also occur if RLS policies aren't set up correctly
        if (fetchError.code === 'PGRST116') {
          // User doesn't exist, will create below
        } else if (fetchError.code === '406' || fetchError.message?.includes('406')) {
          // 406 Not Acceptable - likely RLS policy issue
          console.warn('406 error fetching user - RLS policy may need updating:', fetchError)
          // Continue to try creating user - if it exists, upsert will handle it
        } else {
          // Other error (like RLS policy violation)
          console.error('Error fetching user:', fetchError)
          // Don't throw - continue to try upsert which will handle existing users
        }
      }

      if (existingUser) {
        // User exists, sign in with custom token
        // For now, we'll use a simple approach: store wallet in sessionStorage
        // In production, you'd want to use Supabase Auth with custom tokens
        sessionStorage.setItem('wallet_address', walletAddress)
        sessionStorage.setItem('user_id', existingUser.id)
        
        return { user: existingUser as User, error: null }
      }

      // Use upsert to handle race conditions - if user exists, update; if not, create
      const defaultUsername = walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4)
      
      const { data: newUser, error: upsertError } = await supabase
        .from('users')
        .upsert({
          wallet_address: walletAddress,
          username: defaultUsername,
          email: null,
          avatar_url: null,
          bio: null,
          reputation_score: 0,
          total_volume: 0,
          total_profit: 0,
          win_rate: 0,
          is_verified: false,
          is_admin: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address',
          ignoreDuplicates: false // Update if exists
        })
        .select()
        .single()

      if (upsertError) {
        console.error('Error upserting user:', upsertError)
        
        // If upsert fails, try to fetch the existing user one more time
        if (upsertError.code === '23505' || upsertError.code === 'PGRST116' || upsertError.code === '406') {
          const { data: existingUser, error: fetchError2 } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', walletAddress.trim())
            .maybeSingle()
          
          if (existingUser && !fetchError2) {
            sessionStorage.setItem('wallet_address', walletAddress)
            sessionStorage.setItem('user_id', existingUser.id)
            return { user: existingUser as User, error: null }
          }
        }
        
        throw new Error(`Failed to create/update user: ${upsertError.message}. Please check RLS policies.`)
      }

      if (!newUser) {
        // If upsert didn't return data but also didn't error, try fetching
        const { data: fetchedUser, error: fetchError3 } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress.trim())
          .maybeSingle()
        
        if (fetchedUser && !fetchError3) {
          sessionStorage.setItem('wallet_address', walletAddress)
          sessionStorage.setItem('user_id', fetchedUser.id)
          return { user: fetchedUser as User, error: null }
        }
        
        throw new Error('Failed to create user: No data returned')
      }

      // Store in session
      sessionStorage.setItem('wallet_address', walletAddress)
      sessionStorage.setItem('user_id', newUser.id)

      return { user: newUser as User, error: null }
    } catch (error) {
      console.error('Error authenticating with wallet:', error)
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Authentication failed') 
      }
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    sessionStorage.removeItem('wallet_address')
    sessionStorage.removeItem('user_id')
    
    // Also sign out from Supabase Auth if session exists
    await supabase.auth.signOut()
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const walletAddress = sessionStorage.getItem('wallet_address')
    if (!walletAddress) {
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.trim())
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data as User
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('wallet_address')
  }

  /**
   * Get wallet address from session
   */
  getWalletAddress(): string | null {
    return sessionStorage.getItem('wallet_address')
  }
}

export const walletAuthService = new WalletAuthService()

