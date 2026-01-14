import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useWalletAuth } from '../hooks/useWalletAuth'
import { useUserProfile, useUpdateProfile } from '../hooks/useUserProfile'
import { oauthService } from '../services/oauthService'
import { supabase } from '../lib/supabase'
import {
  User,
  Link2,
  Wallet,
  Zap,
  Upload,
  Mail,
  X as XIcon,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function SettingsPage() {
  const { address } = useAppKitAccount()
  const { user, isAuthenticated } = useWalletAuth()
  const { data: profileData } = useUserProfile(user?.id)
  const updateProfileMutation = useUpdateProfile()

  const [activeTab, setActiveTab] = useState('profile')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Social connections
  const [email, setEmail] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [telegramHandle, setTelegramHandle] = useState('')

  // OAuth loading states
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  // Load user data when profile is fetched
  useEffect(() => {
    if (profileData?.user) {
      setUsername(profileData.user.username || '')
      setBio(profileData.user.bio || '')
      setAvatar(profileData.user.avatar_url || null)
      setEmail(profileData.user.email || '')
      setTwitterHandle(profileData.user.twitter_handle || '')
      setTelegramHandle(profileData.user.telegram_handle || '')
    } else if (user) {
      // Fallback to wallet auth user data
      const defaultUsername = user.username || (address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '')
      setUsername(defaultUsername)
      setBio(user.bio || '')
      setAvatar(user.avatar_url || null)
      setEmail(user.email || '')
      setTwitterHandle(user.twitter_handle || '')
      setTelegramHandle(user.telegram_handle || '')
    }
  }, [profileData, user, address])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle OAuth callback from Supabase Auth
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session && user?.id) {
        // Update user profile with OAuth data
        try {
          const userMetadata = session.user.user_metadata
          const updateData: any = {}

          // Check if Google OAuth
          if (userMetadata?.email && userMetadata?.provider === 'google') {
            updateData.email = userMetadata.email
          }

          // Check if Twitter OAuth
          if (userMetadata?.user_name && userMetadata?.provider === 'twitter') {
            updateData.twitter_handle = userMetadata.user_name
          }

          if (Object.keys(updateData).length > 0) {
            await supabase
              .from('users')
              .update(updateData)
              .eq('id', user.id)

            setSaveSuccess(true)
            setTimeout(() => {
              setSaveSuccess(false)
            }, 3000)
          }
        } catch (error) {
          console.error('Error updating profile from OAuth:', error)
        }
      }

      // Check URL hash for OAuth callback
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      if (hashParams.get('access_token')) {
        handleAuthCallback()
        // Clear hash
        window.history.replaceState(null, '', window.location.pathname)
      }
    }

    handleAuthCallback()
  }, [user])

  const handleGoogleConnect = async () => {
    if (!user || !isAuthenticated) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setOauthLoading('google')
      await oauthService.connectGoogle()
    } catch (error) {
      console.error('Google OAuth error:', error)
      alert(error instanceof Error ? error.message : 'Failed to connect Google')
      setOauthLoading(null)
    }
  }

  const handleTwitterConnect = async () => {
    if (!user || !isAuthenticated) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setOauthLoading('twitter')
      await oauthService.connectTwitter()
    } catch (error) {
      console.error('Twitter OAuth error:', error)
      alert(error instanceof Error ? error.message : 'Failed to connect Twitter')
      setOauthLoading(null)
    }
  }

  const handleTelegramConnect = async () => {
    if (!user || !isAuthenticated) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setOauthLoading('telegram')
      await oauthService.connectTelegram()
    } catch (error) {
      console.error('Telegram OAuth error:', error)
      alert(error instanceof Error ? error.message : 'Failed to connect Telegram')
      setOauthLoading(null)
    }
  }

  const handleSave = async () => {
    if (!user || !isAuthenticated) {
      alert('Please connect your wallet to update your profile')
      return
    }

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        data: {
          username: username.trim() || undefined,
          bio: bio.trim() || undefined,
          avatar: avatarFile || undefined,
          email: email.trim() || undefined,
          twitter_handle: twitterHandle.trim() || undefined,
          telegram_handle: telegramHandle.trim() || undefined
        }
      })

      setSaveSuccess(true)
      setAvatarFile(null)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'advanced', label: 'Advanced', icon: Zap },
  ]

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-card border border-border/50 rounded-2xl p-3 sm:p-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4">
              SETTINGS
            </h2>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-full transition-colors text-left ${activeTab === tab.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6 lg:p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Profile</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage your profile and preferences here.</p>
                </div>

                {/* Avatar Section */}
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Avatar</h2>
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div
                      className='p-0.5 rounded-full avatar-outer-box'
                    >
                      <div className='p-2 bg-transparent rounded-full'>
                        {avatar ? (
                          <img
                            src={avatar}
                            alt="Profile"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl sm:text-2xl font-semibold flex-shrink-0 overflow-hidden" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-muted/50 hover:bg-muted border border-border/50 rounded-full cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium text-foreground">Upload</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/gif,image/png,image/webp"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, GIF, PNG, or WebP. 5MB Max.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Username Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Username</h2>
                  <div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      placeholder="Enter username"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Can only contain alphanumeric characters, underscores, and dashes.
                    </p>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Bio</h2>
                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-input/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none"
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {bio.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending || !isAuthenticated}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                  {saveSuccess && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      <span>Profile updated successfully!</span>
                    </div>
                  )}
                  {updateProfileMutation.isError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>{updateProfileMutation.error instanceof Error ? updateProfileMutation.error.message : 'Failed to update profile'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Connections</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage your social connections here.</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Email Connection */}
                  <div className="p-4 sm:p-6 border border-border/50 rounded-lg bg-muted/20">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Email</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                            {email ? 'Connected via Google' : 'Connect your Google account'}
                          </p>
                        </div>
                        {email ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground">{email}</span>
                            <button
                              onClick={() => setEmail('')}
                              className="text-xs text-muted-foreground hover:text-destructive"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleGoogleConnect}
                            disabled={oauthLoading === 'google' || !isAuthenticated}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {oauthLoading === 'google' ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Mail className="w-4 h-4" />
                                Connect
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* X (Twitter) Connection */}
                  <div className="p-4 sm:p-6 border border-border/50 rounded-lg bg-muted/20">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <img src="/images/x.webp" alt="X" className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">X (Twitter)</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                            {twitterHandle ? 'Connected via X' : 'Connect your X (Twitter) account'}
                          </p>
                        </div>
                        {twitterHandle ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground">@{twitterHandle}</span>
                            <button
                              onClick={() => setTwitterHandle('')}
                              className="text-xs text-muted-foreground hover:text-destructive"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleTwitterConnect}
                            disabled={oauthLoading === 'twitter' || !isAuthenticated}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {oauthLoading === 'twitter' ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <img src="/images/x.webp" alt="X" className="w-4 h-4" />
                                Connect
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Telegram Connection */}
                  <div className="p-4 sm:p-6 border border-border/50 rounded-lg bg-muted/20">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Send className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Telegram</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                            {telegramHandle ? 'Connected via Telegram' : 'Connect your Telegram account'}
                          </p>
                        </div>
                        {telegramHandle ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground">@{telegramHandle}</span>
                            <button
                              onClick={() => setTelegramHandle('')}
                              className="text-xs text-muted-foreground hover:text-destructive"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleTelegramConnect}
                            disabled={oauthLoading === 'telegram' || !isAuthenticated}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {oauthLoading === 'telegram' ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Connect
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button for Connections */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending || !isAuthenticated}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Connections'
                    )}
                  </button>
                  {saveSuccess && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      <span>Connections updated!</span>
                    </div>
                  )}
                  {updateProfileMutation.isError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>{updateProfileMutation.error instanceof Error ? updateProfileMutation.error.message : 'Failed to update connections'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallets Tab */}
            {activeTab === 'wallets' && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Wallets</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Add one or more wallets to your account.</p>
                </div>

                <div className="flex justify-center py-8 sm:py-12">
                  <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-medium rounded-lg transition-colors">
                    Link Wallet
                  </button>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Advanced</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage your advanced settings here.</p>
                </div>

                <div className="flex justify-center py-8 sm:py-12">
                  <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
                    No advanced settings available for your wallet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

