import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, TrendingUp, Users, DollarSign, MessageSquare, User, ThumbsUp, Reply } from 'lucide-react'
import type { Market } from '../components/MarketCard'
import PriceChart from '../components/PriceChart'
import type { Time } from 'lightweight-charts'

// Mock data - replace with actual API call
const mockMarket: Market = {
  id: '1',
  question: 'Will Ethereum reach $4,000 before $2,500?',
  description: 'This market resolves to YES if ETH reaches $4,000 before it reaches $2,500, and NO otherwise. The market uses CoinGecko as the price source and checks prices every hour.',
  endDate: '2026-12-31',
  volume: 15400000,
  participants: 3420,
  yesPrice: 0.608,
  noPrice: 0.392,
  category: 'Crypto'
}

interface Comment {
  id: string
  author: string
  authorAddress?: string
  content: string
  timestamp: string
  likes: number
  replies?: Comment[]
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'liusu',
    content: '永远没有结果！',
    timestamp: '4 days ago',
    likes: 0
  },
  {
    id: '2',
    author: 'pengugo',
    content: 'up',
    timestamp: '6 days ago',
    likes: 0
  },
  {
    id: '3',
    author: 'Cedge',
    content: 'Up',
    timestamp: '7 days ago',
    likes: 0
  },
  {
    id: '4',
    author: '0xf9ca...FfB0',
    authorAddress: '0xf9ca...FfB0',
    content: 'UP ONLY!',
    timestamp: '17 days ago',
    likes: 0
  },
  {
    id: '5',
    author: 'ron748',
    content: 'up',
    timestamp: 'a month ago',
    likes: 0
  },
  {
    id: '6',
    author: 'jeanmus',
    content: 'Never hodl for one minute, because others sell.',
    timestamp: '3 months ago',
    likes: 2
  }
]

// Generate mock price history data
const generatePriceData = (timeFilter: string): { time: Time; value: number }[] => {
  const now = Date.now()
  const data: { time: Time; value: number }[] = []
  let startTime: number
  let interval: number

  switch (timeFilter) {
    case '24h':
      startTime = now - 24 * 60 * 60 * 1000
      interval = 60 * 60 * 1000 // 1 hour
      break
    case '7d':
      startTime = now - 7 * 24 * 60 * 60 * 1000
      interval = 4 * 60 * 60 * 1000 // 4 hours
      break
    case '30d':
      startTime = now - 30 * 24 * 60 * 60 * 1000
      interval = 12 * 60 * 60 * 1000 // 12 hours
      break
    default: // all
      startTime = now - 90 * 24 * 60 * 60 * 1000
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
  }

  let currentPrice = 0.55
  for (let time = startTime; time <= now; time += interval) {
    // Random walk with slight upward bias
    currentPrice += (Math.random() - 0.45) * 0.02
    currentPrice = Math.max(0.1, Math.min(0.9, currentPrice))
    data.push({
      time: Math.floor(time / 1000) as Time,
      value: currentPrice * 100
    })
  }

  return data
}

export default function MarketDetailPage() {
  const market = mockMarket // In real app, fetch by id from useParams
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all')
  const [comments] = useState<Comment[]>(mockComments)
  const [activeTab, setActiveTab] = useState<'opinions' | 'holders' | 'activity' | 'news'>('opinions')
  const [buySellMode, setBuySellMode] = useState<'buy' | 'sell'>('buy')
  const [selectedSide, setSelectedSide] = useState<'up' | 'down' | null>(null)

  const chartData = useMemo(() => generatePriceData(selectedTimeFilter), [selectedTimeFilter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' UTC'
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}k`
    }
    return `$${volume.toLocaleString()}`
  }

  const timeFilters = [
    { id: '24h', label: '24h' },
    { id: '7d', label: '7d' },
    { id: '30d', label: '30d' },
    { id: 'all', label: 'all' }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to="/markets"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Markets</span>
      </Link>

      {/* Market Header */}
      <div className="relative bg-card/90 border border-border/50 rounded-xl p-6 sm:p-8 card-shadow mb-6 backdrop-blur-sm">
        <div className="absolute inset-0 rounded-xl opacity-5 market-card-bg pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full uppercase tracking-wide">
              {market.category}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>Perpetual market</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 gold-text gelio-font leading-tight">
            {market.question}
          </h1>

          <div className="text-lg sm:text-xl font-semibold text-muted-foreground mb-6">
            {formatVolume(market.volume)} Perpetual market
          </div>

          {/* Probability Display */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-xl p-6 sm:p-8">
              <div className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">UP</div>
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                {(market.yesPrice * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {(market.yesPrice * 100).toFixed(1)}% chance
              </div>
            </div>
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-2 border-secondary/30 rounded-xl p-6 sm:p-8">
              <div className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">DOWN</div>
              <div className="text-4xl sm:text-5xl font-bold text-secondary mb-2">
                {(market.noPrice * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {(market.noPrice * 100).toFixed(1)}% chance
              </div>
            </div>
          </div>

          {/* Time Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedTimeFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeFilter === filter.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Price Chart */}
          <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm mb-6">
            <PriceChart data={chartData} height={400} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Volume</span>
              </div>
              <div className="text-xl font-bold">{formatVolume(market.volume)}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Participants</span>
              </div>
              <div className="text-xl font-bold">{market.participants.toLocaleString()}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Liquidity</span>
              </div>
              <div className="text-xl font-bold">{formatVolume(market.volume * 0.1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Rules, Resolution, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rules Section */}
          <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 gelio-font">Rules</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground">
                <strong>There are zero trading fees charged for this market.</strong>
              </p>
              <p>
                <strong>This market is a social sentiment experiment, is trading only, and will never be resolved towards either option.</strong>
              </p>
              <p>
                Winning or losing? To be or not to be? <em>Up or Down?</em>
              </p>
              <p>
                Questions that have been asked since the dawn of time, maybe even before. But is it more than a societal belief that pits us against each other?
              </p>
              <p>
                To begin grasping a potential path to an answer, we must first acknowledge that there isn't one. Like a caveman transported to Woodstock '69, we must attempt to understand the crowd that we are simultaneously part of and apart from—a crowd that behaves unpredictably based on predictable events and continues to surprise us while seemingly never changing.
              </p>
              <p>
                Only then—once humbled, emboldened, and full of wonder—we can ask ourselves and the atoms around us the ever-ringing question, the itch at the back of our brains, the perpetrator of too many sleepless nights: <strong>Up or Down?</strong>
              </p>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="font-semibold text-foreground mb-2">Market Period:</p>
                <p>Infinite. Do not give heed to any calendar dates, as they are but a mere distraction</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="font-semibold text-foreground mb-2">Resolution Criteria:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>This market will not resolve</li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="font-semibold text-foreground mb-2">Resolution Details:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>No resolution can be triggered in this market</li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="font-semibold text-foreground mb-2">Cancelation (Invalidity) Conditions:</p>
                <p className="mb-2">This market will be canceled/invalid if:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Myriad Markets undergoes a change of its contract that demands the cancelation of all active markets, or similar technical or business imperatives</li>
                  <li>Myriad Markets decides it is time for this market to cease to exist</li>
                </ul>
                <p className="mt-2 text-xs italic">
                  <em>In the event of cancelation, participants may claim their stakes at the market value of their open positions at the time of cancelation. This could result in a profit or a loss, depending on the price of their outstanding shares.</em>
                </p>
              </div>
            </div>
          </div>

          {/* Resolution Source */}
          <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 gelio-font">Resolution Source</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-5 h-5" />
              <span className="text-lg font-medium">You</span>
            </div>
          </div>

          {/* Opinions/Comments Section */}
          <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border/30">
              <button
                onClick={() => setActiveTab('opinions')}
                className={`pb-3 px-2 font-medium text-sm transition-colors ${
                  activeTab === 'opinions'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Opinions ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('holders')}
                className={`pb-3 px-2 font-medium text-sm transition-colors ${
                  activeTab === 'holders'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Holders
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-3 px-2 font-medium text-sm transition-colors ${
                  activeTab === 'activity'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`pb-3 px-2 font-medium text-sm transition-colors ${
                  activeTab === 'news'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                News
              </button>
            </div>

            {/* Comments */}
            {activeTab === 'opinions' && (
              <div className="space-y-6">
                {/* Comment Input */}
                <div className="border border-border/50 rounded-lg p-4 bg-muted/30">
                  <textarea
                    placeholder="Share your opinion..."
                    className="w-full bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground min-h-[80px]"
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">0/500</span>
                    <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                      Post
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-border/30 pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground">
                              {comment.author}
                            </span>
                            {comment.authorAddress && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {comment.authorAddress}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              · {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mb-2">{comment.content}</p>
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{comment.likes}</span>
                            </button>
                            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                              <Reply className="w-3.5 h-3.5" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'holders' && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No holders data available</p>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activity data available</p>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No news available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Trading Interface */}
        <div className="lg:col-span-1">
          <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm sticky top-24">
            {/* Buy/Sell Toggle */}
            <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => setBuySellMode('buy')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  buySellMode === 'buy'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setBuySellMode('sell')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  buySellMode === 'sell'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Percentage Display */}
            <div className="mb-6">
              <div className="flex h-3 bg-muted/50 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 transition-all"
                  style={{ width: `${market.yesPrice * 100}%` }}
                />
                <div
                  className="bg-gradient-to-r from-secondary/80 to-secondary transition-all"
                  style={{ width: `${market.noPrice * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-primary">{(market.yesPrice * 100).toFixed(0)}%</span>
                <span className="text-secondary">{(market.noPrice * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Trading Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold gelio-font mb-4">Pick a side</h3>
              
              <button
                onClick={() => setSelectedSide(selectedSide === 'up' ? null : 'up')}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  selectedSide === 'up'
                    ? 'gold-button'
                    : 'gold-button opacity-70 hover:opacity-100'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                UP
              </button>
              
              <button
                onClick={() => setSelectedSide(selectedSide === 'down' ? null : 'down')}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  selectedSide === 'down'
                    ? 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-2 border-secondary'
                    : 'bg-gradient-to-br from-secondary/60 to-secondary/40 text-secondary-foreground border border-secondary/30 opacity-70 hover:opacity-100'
                }`}
              >
                <TrendingUp className="w-5 h-5 rotate-180" />
                DOWN
              </button>

              {selectedSide && (
                <div className="pt-4 border-t border-border/30 space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    {buySellMode === 'buy' ? 'Buy' : 'Sell'} {selectedSide.toUpperCase()}
                  </button>
                </div>
              )}

              {!selectedSide && (
                <div className="pt-4 border-t border-border/30">
                  <p className="text-xs text-muted-foreground text-center">
                    {buySellMode === 'buy' ? 'Select UP or DOWN to buy shares' : 'Select UP or DOWN to sell shares'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm mt-6">
            <h3 className="text-lg font-semibold mb-4 gelio-font">Timeline</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Market published</div>
                <div className="text-sm font-medium text-foreground">
                  {formatDate('2025-09-06T15:25:00Z')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Never closes</div>
                <div className="text-sm font-medium text-foreground">
                  Perpetual markets never close.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
