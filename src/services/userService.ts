import { supabase } from '../lib/supabase'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export interface UpdateProfileData {
  username?: string
  bio?: string
  avatar?: File
  email?: string
  twitter_handle?: string
  telegram_handle?: string
}

export class UserService {
  // Upload avatar file to backend
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(`${BACKEND_URL}/api/upload/avatar`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload avatar')
    }

    const data = await response.json()
    return data.avatar_url
  }

  // Update profile using Supabase directly
  async updateProfile(userId: string, data: UpdateProfileData): Promise<any> {
    const updateData: any = {}
    
    // Handle avatar upload separately
    let avatarUrl: string | undefined
    if (data.avatar) {
      avatarUrl = await this.uploadAvatar(data.avatar)
      updateData.avatar_url = avatarUrl
    }
    
    if (data.username !== undefined) {
      updateData.username = data.username || null
    }
    
    if (data.bio !== undefined) {
      updateData.bio = data.bio || null
    }
    
    if (data.email !== undefined) {
      updateData.email = data.email || null
    }
    
    if (data.twitter_handle !== undefined) {
      updateData.twitter_handle = data.twitter_handle || null
    }
    
    if (data.telegram_handle !== undefined) {
      updateData.telegram_handle = data.telegram_handle || null
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || 'Failed to update profile')
    }

    return { user: updatedUser }
  }

  // Get user profile from Supabase
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      throw new Error(error.message || 'Failed to fetch user profile')
    }

    return { user: data }
  }
}

export const userService = new UserService()

