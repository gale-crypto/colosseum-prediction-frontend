import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppKitAccount } from '@reown/appkit/react'
import { 
  // Copy, 
  Settings, 
  Star, 
  DollarSign, 
  Trophy, 
  Search,
  Info,
  User as UserIcon,
  Clock,
  Activity,
  Gift
} from 'lucide-react'
import Dropdown from '../components/Dropdown'

export default function UserProfilePage() {
  const { address } = useAppKitAccount()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('portfolio')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedSort, setSelectedSort] = useState('newest')
  const [copied, setCopied] = useState(false)

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const topicOptions = [
    { value: 'all', label: 'All Topics' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'sports', label: 'Sports' },
    { value: 'politics', label: 'Politics' },
    { value: 'gaming', label: 'Gaming' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'value', label: 'Value' },
    { value: 'pnl', label: 'PNL' },
  ]

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: UserIcon },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'referral', label: 'Referral Points', icon: Gift },
  ]

  return (
    <div className="max-w-8xl mx-auto">
      {/* User Profile Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* User Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div 
            className='p-0.5 rounded-full avatar-outer-box'
            >
              <div className='p-2 bg-transparent rounded-full'>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg sm:text-xl font-semibold flex-shrink-0">
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {formatAddress(address)}
                </h1>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-1 sm:p-1.5 hover:bg-muted/50 rounded-lg transition-colors flex-shrink-0"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
                  {address || '0x0000...0000'}
                </span>
                <div className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <button
                    onClick={handleCopy}
                    className="text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/10"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Points Card */}
            <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">Points</div>
              <div className="text-xs text-muted-foreground mb-1">Profit/loss</div>
              <div className="text-base sm:text-lg font-semibold text-foreground">0 pts</div>
            </div>

            {/* USDC Card */}
            <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                </div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">USDC</div>
              <div className="text-xs text-muted-foreground mb-1">Profit/loss</div>
              <div className="text-base sm:text-lg font-semibold text-foreground">$0</div>
            </div>

            {/* Rank Card */}
            <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">Rank</div>
              <div className="text-base sm:text-lg font-semibold text-foreground">365,117</div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-border/30 px-4 sm:px-6">
          <div className="flex gap-4 sm:gap-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 sm:p-6 border-b border-border/30">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search predictions"
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-input/50 border border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm text-xs sm:text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Dropdown
                options={topicOptions}
                value={selectedTopic}
                onChange={setSelectedTopic}
              />
              <Dropdown
                options={sortOptions}
                value={selectedSort}
                onChange={setSelectedSort}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-4 sm:p-6">
          {/* Table Headers */}
          <div className="hidden md:grid grid-cols-8 gap-2 sm:gap-4 pb-4 border-b border-border/30 text-xs sm:text-sm text-muted-foreground font-medium">
            <div>Market</div>
            <div>Token</div>
            <div>Outcome</div>
            <div>Invested</div>
            <div>Position</div>
            <div className="flex items-center gap-1">
              Current value
              <Info className="w-3 h-3" />
            </div>
            <div>PNL</div>
            <div>Action</div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground text-lg">No markets found. Try changing the filters.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

