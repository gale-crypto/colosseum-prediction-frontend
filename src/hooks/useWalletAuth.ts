import { useEffect, useState } from 'react'
import { useAppKitAccount, useDisconnect } from '@reown/appkit/react'
import { walletAuthService } from '../services/walletAuthService'
import { supabase } from '../lib/supabase'
import type { User } from '../types/database'

export function useWalletAuth() {
  const { address, isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Authenticate when wallet connects
  useEffect(() => {
    const authenticate = async () => {
      if (!isConnected || !address) {
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      try {
        const { user: authUser, error } = await walletAuthService.authenticateWithWallet(address)
        
        if (error) {
          console.error('Authentication error:', error)
          setUser(null)
          setIsAuthenticated(false)
        } else {
          setUser(authUser)
          setIsAuthenticated(!!authUser)
          
          // Also set up Supabase Auth session for API calls
          // We'll use the user ID as the auth identifier
          if (authUser) {
            // For now, we'll use a custom approach
            // In production, you'd want to use Supabase's custom auth with JWT
            await supabase.auth.setSession({
              access_token: `wallet_${address}`,
              refresh_token: `refresh_${address}`
            } as any).catch(() => {
              // Ignore errors - we're using custom auth
            })
          }
        }
      } catch (error) {
        console.error('Error in authentication:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    authenticate()
  }, [isConnected, address])

  // Sign out handler
  const signOut = async () => {
    await walletAuthService.signOut()
    setUser(null)
    setIsAuthenticated(false)
    disconnect()
  }

  // Get current user on mount
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await walletAuthService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    walletAddress: address,
    isConnected,
    signOut
  }
}

