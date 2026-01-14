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
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (fetchError) {
        // PGRST116 means no rows found, which is fine - user doesn't exist yet
        if (fetchError.code === 'PGRST116') {
          // User doesn't exist, will create below
        } else {
          // Other error (like RLS policy violation)
          console.error('Error fetching user:', fetchError)
          throw new Error(`Failed to check user: ${fetchError.message}`)
        }
      }

      if (existingUser && !fetchError) {
        // User exists, sign in with custom token
        // For now, we'll use a simple approach: store wallet in sessionStorage
        // In production, you'd want to use Supabase Auth with custom tokens
        sessionStorage.setItem('wallet_address', walletAddress)
        sessionStorage.setItem('user_id', existingUser.id)
        
        return { user: existingUser as User, error: null }
      }

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          username: walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4),
          email: null,
          avatar_url: null,
          bio: null,
          reputation_score: 0,
          total_volume: 0,
          total_profit: 0,
          win_rate: 0,
          is_verified: false,
          is_admin: false
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        // Check if it's a unique constraint violation (user already exists)
        if (createError.code === '23505') {
          // User was created between our check and insert, fetch it
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single()
          
          if (existingUser) {
            sessionStorage.setItem('wallet_address', walletAddress)
            sessionStorage.setItem('user_id', existingUser.id)
            return { user: existingUser as User, error: null }
          }
        }
        throw new Error(`Failed to create user: ${createError.message}. Please check RLS policies.`)
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
      .eq('wallet_address', walletAddress)
      .single()

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

