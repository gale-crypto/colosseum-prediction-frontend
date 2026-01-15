import { supabase } from '../lib/supabase'
import type { User } from '../types/database'

export interface UpdateProfileData {
  username?: string
  bio?: string
  avatar?: File
  avatar_url?: string
  email?: string | null
  twitter_handle?: string | null
  telegram_handle?: string | null
}

export class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<{ user: User }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }

    return { user: data as User }
  }

  /**
   * Upload avatar image to backend
   */
  async uploadAvatar(file: File): Promise<{ avatar_url: string; filename: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/upload/avatar`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload avatar' }))
      throw new Error(error.message || 'Failed to upload avatar')
    }

    const data = await response.json()
    return {
      avatar_url: data.avatar_url || data.image_url,
      filename: data.filename,
    }
  }

  /**
   * Upload market images (banner and logo) to backend
   */
  async uploadMarketImages(banner?: File, logo?: File): Promise<{ banner_url?: string; logo_url?: string; banner_filename?: string; logo_filename?: string }> {
    if (!banner && !logo) {
      throw new Error('At least one image (banner or logo) must be provided')
    }

    const formData = new FormData()
    if (banner) formData.append('banner', banner)
    if (logo) formData.append('logo', logo)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/upload/market-images`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload market images' }))
      throw new Error(error.message || 'Failed to upload market images')
    }

    return await response.json()
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<{ user: User }> {
    // If avatar file is provided, upload it first
    let avatarUrl = data.avatar_url
    if (data.avatar) {
      const uploadResult = await this.uploadAvatar(data.avatar)
      avatarUrl = uploadResult.avatar_url
    }

    // Update user profile in Supabase
    const updateData: Partial<User> = {}
    if (data.username !== undefined) updateData.username = data.username
    if (data.bio !== undefined) updateData.bio = data.bio
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl
    if (data.email !== undefined) updateData.email = data.email
    if (data.twitter_handle !== undefined) updateData.twitter_handle = data.twitter_handle
    if (data.telegram_handle !== undefined) updateData.telegram_handle = data.telegram_handle

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }

    return { user: updatedUser as User }
  }

  /**
   * Get user rank based on total_profit (leaderboard position)
   * Rank is calculated as the position in the leaderboard ordered by total_profit DESC
   */
  async getUserRank(userId: string): Promise<number | null> {
    try {
      // First, get the user's total_profit
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('total_profit')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        console.error('Error fetching user:', userError)
        return null
      }

      // Count how many users have higher total_profit (rank = count + 1)
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('total_profit', user.total_profit)

      if (countError) {
        console.error('Error calculating rank:', countError)
        return null
      }

      // Rank is the number of users with higher profit + 1
      return (count || 0) + 1
    } catch (error) {
      console.error('Error getting user rank:', error)
      return null
    }
  }

  /**
   * Get user rank based on reputation_score
   */
  async getUserRankByReputation(userId: string): Promise<number | null> {
    try {
      // First, get the user's reputation_score
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('reputation_score')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        console.error('Error fetching user:', userError)
        return null
      }

      // Count how many users have higher reputation_score (rank = count + 1)
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('reputation_score', user.reputation_score)

      if (countError) {
        console.error('Error calculating rank:', countError)
        return null
      }

      // Rank is the number of users with higher reputation + 1
      return (count || 0) + 1
    } catch (error) {
      console.error('Error getting user rank:', error)
      return null
    }
  }

  /**
   * Format rank number with commas (e.g., 365117 -> "365,117")
   */
  formatRank(rank: number | null): string {
    if (rank === null) return 'N/A'
    return rank.toLocaleString()
  }

  /**
   * Get leaderboard data from user_leaderboard view
   */
  async getLeaderboard(page: number = 1, itemsPerPage: number = 50): Promise<{
    entries: Array<{
      id: string
      rank: number
      username: string | null
      wallet_address: string
      total_volume: number
      total_profit: number
      win_rate: number
      reputation_score: number
      active_positions: number
      total_trades: number
      avatar_url: string | null
    }>
    total: number
  }> {
    try {
      // First, get total count of users
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error fetching leaderboard count:', countError)
        throw countError
      }

      const total = count || 0

      // Calculate offset
      const offset = (page - 1) * itemsPerPage

      // Fetch leaderboard data with pagination from users table (ordered by total_profit DESC)
      // Join with user_leaderboard view would be ideal, but we'll fetch from users and calculate stats
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('users')
        .select(`
          id,
          username,
          wallet_address,
          total_volume,
          total_profit,
          win_rate,
          reputation_score,
          avatar_url
        `)
        .order('total_profit', { ascending: false })
        .range(offset, offset + itemsPerPage - 1)

      if (leaderboardError) {
        console.error('Error fetching leaderboard:', leaderboardError)
        throw leaderboardError
      }

      // Get active positions and total trades counts in batch
      const userIds = (leaderboardData || []).map(u => u.id)
      
      // Batch query for active positions
      const { data: positionsData } = await supabase
        .from('positions')
        .select('user_id')
        .in('user_id', userIds)
        .gt('shares', 0)

      // Batch query for total trades
      const { data: tradesData } = await supabase
        .from('trades')
        .select('user_id')
        .in('user_id', userIds)

      // Count positions and trades per user
      const positionsCount = new Map<string, number>()
      const tradesCount = new Map<string, number>()

      positionsData?.forEach(p => {
        positionsCount.set(p.user_id, (positionsCount.get(p.user_id) || 0) + 1)
      })

      tradesData?.forEach(t => {
        tradesCount.set(t.user_id, (tradesCount.get(t.user_id) || 0) + 1)
      })

      // Map to entries with rank
      const entries = (leaderboardData || []).map((user, index) => ({
        id: user.id,
        rank: offset + index + 1,
        username: user.username,
        wallet_address: user.wallet_address,
        total_volume: user.total_volume || 0,
        total_profit: user.total_profit || 0,
        win_rate: user.win_rate || 0,
        reputation_score: user.reputation_score || 0,
        active_positions: positionsCount.get(user.id) || 0,
        total_trades: tradesCount.get(user.id) || 0,
        avatar_url: user.avatar_url
      }))

      return { entries, total }
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      throw error
    }
  }
}

export const userService = new UserService()
