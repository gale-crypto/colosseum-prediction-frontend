import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { 
  User, 
  Link2, 
  Wallet, 
  Zap,
  Upload,
  Mail,
  X as XIcon,
  Send
} from 'lucide-react'

export default function SettingsPage() {
  const { address } = useAppKitAccount()
  const [activeTab, setActiveTab] = useState('profile')
  const [username, setUsername] = useState(address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '')
  const [avatar, setAvatar] = useState<string | null>(null)

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              SETTINGS
            </h2>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-card border border-border/50 rounded-2xl p-6 lg:p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
                  <p className="text-muted-foreground">Manage your profile and preferences here.</p>
                </div>

                {/* Avatar Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Avatar</h2>
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0 overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        address?.charAt(2).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/50 rounded-full cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Upload</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/gif,image/png"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, GIF or PNG. 1MB Max.
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

                {/* Save Button */}
                <div>
                  <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors">
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Connections</h1>
                  <p className="text-muted-foreground">Manage your connections here.</p>
                </div>

                <div className="space-y-4">
                  {/* Email Connection */}
                  <div className="p-4 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Connect email</h3>
                        <p className="text-sm text-muted-foreground">Connect your email</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/50 rounded-full transition-colors">
                        <Mail className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Connect</span>
                      </button>
                    </div>
                  </div>

                  {/* X (Twitter) Connection */}
                  <div className="p-4 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Connect X (Twitter)</h3>
                        <p className="text-sm text-muted-foreground">Connect X to your account</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/50 rounded-full transition-colors">
                        <XIcon className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Connect</span>
                      </button>
                    </div>
                  </div>

                  {/* Telegram Connection */}
                  <div className="p-4 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Connect Telegram</h3>
                        <p className="text-sm text-muted-foreground">Connect Telegram to your account</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/50 rounded-full transition-colors">
                        <Send className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Connect</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wallets Tab */}
            {activeTab === 'wallets' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Wallets</h1>
                  <p className="text-muted-foreground">Add one or more wallets to your account.</p>
                </div>

                <div className="flex justify-center py-12">
                  <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors">
                    Link Wallet
                  </button>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Advanced</h1>
                  <p className="text-muted-foreground">Manage your advanced settings here.</p>
                </div>

                <div className="flex justify-center py-12">
                  <p className="text-muted-foreground">
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

