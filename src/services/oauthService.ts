import { supabase } from '../lib/supabase'

export class OAuthService {
  // Google OAuth using Supabase Auth
  async connectGoogle(): Promise<void> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/settings`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      throw new Error(error.message || 'Failed to connect Google')
    }

    // The OAuth flow will redirect to the callback URL
    // We'll handle the callback in SettingsPage useEffect
  }

  // Twitter/X OAuth using Supabase Auth
  async connectTwitter(): Promise<void> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/settings`,
      },
    })

    if (error) {
      throw new Error(error.message || 'Failed to connect Twitter')
    }
  }

  // Telegram OAuth - Note: Supabase doesn't have Telegram provider
  // We'll use a manual approach or Telegram Login Widget
  async connectTelegram(): Promise<void> {
    // For Telegram, we'll use the Telegram Login Widget
    // This requires setting up a Telegram bot
    const botId = import.meta.env.VITE_TELEGRAM_BOT_ID
    if (!botId) {
      throw new Error('Telegram bot not configured')
    }

    // Open Telegram Login Widget
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(window.location.origin)}&return_to=${encodeURIComponent(`${window.location.origin}/settings`)}&request_access=write`
    
    return this.openOAuthWindow(authUrl, 'Telegram')
  }

  // Helper to update user profile after OAuth
  async updateUserFromOAuth(userId: string, provider: 'google' | 'twitter', userData: any): Promise<void> {
    const updateData: any = {}

    if (provider === 'google') {
      if (userData.email) {
        updateData.email = userData.email
      }
    } else if (provider === 'twitter') {
      if (userData.user_metadata?.user_name) {
        updateData.twitter_handle = userData.user_metadata.user_name
      }
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)

      if (error) {
        throw new Error(error.message || 'Failed to update user profile')
      }
    }
  }

  openOAuthWindow(url: string, provider: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const width = 600
      const height = 700
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2

      const popup = window.open(
        url,
        `${provider} Login`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no`
      )

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'))
        return
      }

      // Check if popup is closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          // Check URL params for success/error
          const urlParams = new URLSearchParams(window.location.search)
          if (urlParams.get('success')) {
            resolve()
          } else if (urlParams.get('error')) {
            reject(new Error('OAuth authentication failed'))
          }
        }
      }, 500)

      // Listen for messages from popup (if using postMessage)
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'oauth-success') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          popup.close()
          resolve()
        } else if (event.data.type === 'oauth-error') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          popup.close()
          reject(new Error(event.data.error || 'OAuth authentication failed'))
        }
      }

      window.addEventListener('message', messageHandler)
    })
  }
}

export const oauthService = new OAuthService()

