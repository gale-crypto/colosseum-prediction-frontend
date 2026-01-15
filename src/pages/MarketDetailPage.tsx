import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, TrendingUp, Users, DollarSign, MessageSquare, User, ThumbsUp, Reply, ChevronUp, ArrowRight, Info, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react'
import PriceChart from '../components/PriceChart'
import type { Time } from 'lightweight-charts'
import { useMarket, useMarketPriceHistory } from '../hooks/useMarkets'
import { useMarketComments, useCreateComment, useLikeComment } from '../hooks/useComments'
import { marketService } from '../services/marketService'
import { useWalletAuth } from '../hooks/useWalletAuth'
import { sanitizeHtml } from '../utils/sanitizeHtml'
import type { Market } from '../types/database'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/Tooltip'
import AnimatedNumber from '../components/AnimatedNumber'

export default function MarketDetailPage() {
  const { id: slugOrId } = useParams<{ id: string }>()
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all')
  const [activeTab, setActiveTab] = useState<'opinions' | 'holders' | 'activity' | 'news'>('opinions')
  const [buySellMode, setBuySellMode] = useState<'buy' | 'sell'>('buy')
  const [selectedSide, setSelectedSide] = useState<'up' | 'down'>('up')
  const [commentContent, setCommentContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [currentMarket, setCurrentMarket] = useState<Market | null>(null)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [amount, setAmount] = useState('0.00')
  const [hoveredPrices, setHoveredPrices] = useState<{ yesPrice: number; noPrice: number } | null>(null)
  
  // Fetch market data (supports both slug and ID for backward compatibility)
  const { data: market, isLoading: marketLoading } = useMarket(slugOrId || '')

  // Get market ID - only use it if it's a valid UUID (not a slug)
  // Check if slugOrId is a UUID format (contains hyphens in UUID pattern)
  const isUUID = slugOrId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId) : false
  const marketId = market?.id || (isUUID ? slugOrId : null) || ''

  // Only fetch price history and comments when we have a valid market ID (not slug)
  const { data: priceHistory = [] } = useMarketPriceHistory(marketId, selectedTimeFilter)

  // Fetch comments (use market ID once loaded)
  const { data: comments = [], isLoading: commentsLoading } = useMarketComments(marketId)

  // Wallet auth
  const { user: currentUser, isAuthenticated } = useWalletAuth()

  // Mutations
  const createCommentMutation = useCreateComment()
  const likeCommentMutation = useLikeComment()

  // Update current market when data loads
  useEffect(() => {
    if (market) {
      setCurrentMarket(market)
    }
  }, [market])

  // Set up real-time subscription for price updates
  useEffect(() => {
    if (!marketId) return

    const subscription = marketService.subscribeToMarketPrices(marketId, (updatedMarket) => {
      setCurrentMarket(updatedMarket)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [marketId])

  // Convert price history to chart format and filter by time
  // Include current market prices as the latest data point for live chart
  const chartData = useMemo(() => {
    const now = new Date()
    const nowTimestamp = Math.floor(now.getTime() / 1000)
    
    // Filter price history based on selected time filter
    let startTime: Date

    switch (selectedTimeFilter) {
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(0) // All time
    }

    console.log('Price History', priceHistory)

    // Filter and sort by timestamp (ascending)
    const filteredHistory = (priceHistory && priceHistory.length > 0
      ? (selectedTimeFilter === 'all'
          ? priceHistory
          : priceHistory.filter(ph => {
            const phDate = new Date(ph.timestamp)
            return phDate >= startTime && phDate <= now
          })
        ).sort((a, b) => {
          // Ensure data is sorted by timestamp ascending
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        })
      : []
    )

    console.log('Filtered History:', filteredHistory)

    // Convert historical data to chart format
    const upData = filteredHistory.map(ph => {
      const timestamp = new Date(ph.timestamp)
      return {
        time: Math.floor(timestamp.getTime() / 1000) as Time,
        value: Math.max(0, Math.min(100, ph.yes_price * 100)) // Clamp between 0-100
      }
    })

    const downData = filteredHistory.map(ph => {
      const timestamp = new Date(ph.timestamp)
      return {
        time: Math.floor(timestamp.getTime() / 1000) as Time,
        value: Math.max(0, Math.min(100, ph.no_price * 100)) // Clamp between 0-100
      }
    })

    // Add current market prices as the latest data point (live data)
    // This ensures the chart connects from start to current prices
    if (currentMarket) {
      const currentUpValue = Math.max(0, Math.min(100, currentMarket.yes_price * 100))
      const currentDownValue = Math.max(0, Math.min(100, currentMarket.no_price * 100))
      
      // Only add current price if it's different from the last historical point or if there's no history
      const lastUpTime = upData.length > 0 ? (upData[upData.length - 1].time as number) : 0
      const lastDownTime = downData.length > 0 ? (downData[downData.length - 1].time as number) : 0
      
      // Add current price if it's newer than the last historical point or if there's no history
      if (nowTimestamp > lastUpTime || upData.length === 0) {
        upData.push({
          time: nowTimestamp as Time,
          value: currentUpValue
        })
      } else if (upData.length > 0) {
        // Update the last point if it's the same timestamp
        upData[upData.length - 1] = {
          time: nowTimestamp as Time,
          value: currentUpValue
        }
      }
      
      if (nowTimestamp > lastDownTime || downData.length === 0) {
        downData.push({
          time: nowTimestamp as Time,
          value: currentDownValue
        })
      } else if (downData.length > 0) {
        // Update the last point if it's the same timestamp
        downData[downData.length - 1] = {
          time: nowTimestamp as Time,
          value: currentDownValue
        }
      }
    }

    console.log('Up Data:', upData)
    console.log('Down Data:', downData)

    return { upData, downData }
  }, [priceHistory, selectedTimeFilter, currentMarket])

  const finalUpData = chartData.upData
  const finalDownData = chartData.downData

  console.log('Chart Data:', chartData)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  const handlePostComment = async () => {
    if (!marketId || !commentContent.trim()) return

    if (!currentUser || !isAuthenticated) {
      alert('Please connect your wallet to post comments')
      return
    }

    try {
      await createCommentMutation.mutateAsync({
        marketId: marketId,
        userId: currentUser.id,
        content: commentContent.trim()
      })
      setCommentContent('')
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handlePostReply = async (parentId: string) => {
    if (!marketId || !replyContent.trim()) return

    if (!currentUser || !isAuthenticated) {
      alert('Please connect your wallet to post replies')
      return
    }

    try {
      await createCommentMutation.mutateAsync({
        marketId: marketId,
        userId: currentUser.id,
        content: replyContent.trim(),
        parentId: parentId
      })
      setReplyContent('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error posting reply:', error)
    }
  }

  const handleReplyClick = (comment: { id: string; user?: { username?: string | null; wallet_address?: string | null } }) => {
    const username = comment.user?.username || comment.user?.wallet_address?.slice(0, 6) || 'Anonymous'
    setReplyingTo({ id: comment.id, username })
    setReplyContent('')
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyContent('')
  }

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser || !isAuthenticated) {
      alert('Please connect your wallet to like comments')
      return
    }

    try {
      await likeCommentMutation.mutateAsync({
        commentId,
        userId: currentUser.id
      })
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const timeFilters = [
    { id: '24h' as const, label: '24h' },
    { id: '7d' as const, label: '7d' },
    { id: '30d' as const, label: '30d' },
    { id: 'all' as const, label: 'all' }
  ]

  if (marketLoading) {
    return (
      <div className="mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market...</p>
        </div>
      </div>
    )
  }

  if (!currentMarket) {
    return (
      <div className="mx-auto">
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Markets</span>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Market not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto">
      <Link
        to="/markets"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Markets</span>
      </Link>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Market Header */}
          <div className="relative bg-card/90 border border-border/50 rounded-xl overflow-hidden card-shadow mb-6 backdrop-blur-sm">
            {/* Banner Image */}
            {(currentMarket.banner_url || currentMarket.image_url) && (
              <div className="relative h-48 sm:h-64 w-full overflow-hidden">
                <img
                  src={currentMarket.banner_url || currentMarket.image_url || ''}
                  alt="Market banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90"></div>
              </div>
            )}

            <div className="relative p-6 sm:p-8">
              <div className="absolute inset-0 rounded-xl opacity-5 market-card-bg pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full uppercase tracking-wide">
                    {currentMarket.category?.name || 'Other'}
                  </span>
                </div>

                <div className='flex items-center gap-4 mb-6'>
                  {/* Logo Image */}
                  {currentMarket.logo_url && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 sm:min-w-20 sm:min-h-20 aspect-square rounded-lg overflow-hidden border-2 border-border/50 bg-card shadow-lg">
                      <img
                        src={currentMarket.logo_url}
                        alt="Market logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 gold-text gelio-font leading-tight">
                      {currentMarket.question}
                    </h1>
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                        <img src="/images/usdt-logo.png" alt="Volume" width={15} height={15} />
                        {formatVolume(currentMarket.volume)}
                      </div>
                      <div className="border border-l border-white h-3" />
                      <div className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {currentMarket.market_type === 'perpetual' ? 'Perpetual market' : 'Market'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Probability Display */}
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <div className='flex items-end gap-2'>
                      <span className='text-2xl text-muted-foreground'>{market?.custom_labels?.up}</span>
                      <div className={`flex items-center text-sm ${((hoveredPrices?.yesPrice ?? currentMarket.yes_price) / (currentMarket?.initial_yes_price ?? 0)) * 100 - 100 > 0 ? 'text-[#16B364]' : 'text-[#FB4BAA]'}`}>
                        {((hoveredPrices?.yesPrice ?? currentMarket.yes_price) / (currentMarket?.initial_yes_price ?? 0)) * 100 - 100 > 0 ? <ArrowUp className='w-3 h-3' /> : <ArrowDown className='w-3 h-3' />}
                        <span>
                          <AnimatedNumber
                          value={((hoveredPrices?.yesPrice ?? currentMarket.yes_price) / (currentMarket?.initial_yes_price ?? 0)) * 100 - 100}
                          duration={1500}
                          formatter={(val) => val.toFixed(1)}
                          />
                        %</span>
                      </div>
                    </div>
                    <span>
                    <AnimatedNumber
                          value={(hoveredPrices?.yesPrice ?? currentMarket.yes_price) * 100}
                          duration={1500}
                          formatter={(val) => val.toFixed(1)}
                          />% chance
                    </span>
                  </div>
                  <div className="flex items-center gap-8 flex-wrap">
                    <div className="flex items-center text-nowrap">
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: '#22D3BB' }}></span>
                      <span className="text-text-sub-600 text-sm font-medium leading-5 mr-1">{currentMarket.custom_labels?.up}</span>
                      <strong className="text-text-strong-950 text-sm font-semibold leading-5">
                        <AnimatedNumber
                          value={(currentMarket.yes_price) * 100}
                          duration={1500}
                          formatter={(val) => val.toFixed(1)}
                        />%
                      </strong>
                    </div>
                    <div className="flex items-center text-nowrap">
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: '#FB4BAA' }}></span>
                      <span className="text-text-sub-600 text-sm font-medium leading-5 mr-1">{currentMarket.custom_labels?.down}</span>
                      <strong className="text-text-strong-950 text-sm font-semibold leading-5">
                        <AnimatedNumber
                          value={(currentMarket.no_price) * 100}
                          duration={1500}
                          formatter={(val) => val.toFixed(1)}
                        />%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Time Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {timeFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedTimeFilter(filter.id)}
                      className={`px-4 py-0.5 rounded-full text-sm font-medium transition-colors ${selectedTimeFilter === filter.id
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
                  {finalUpData.length === 0 && finalDownData.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      <div className="text-center">
                        <p className="text-sm">No price history available yet</p>
                        <p className="text-xs mt-1">Price history will appear as trading activity begins</p>
                      </div>
                    </div>
                  ) : (
                    <PriceChart
                      key={`chart-${selectedTimeFilter}-${marketId}`}
                      upData={finalUpData}
                      downData={finalDownData}
                      height={400}
                      upLabel={currentMarket.custom_labels?.up || 'UP'}
                      downLabel={currentMarket.custom_labels?.down || 'DOWN'}
                      onHover={(data) => {
                        console.log('Hovering...', data)
                        if (data) {
                          setHoveredPrices({ yesPrice: data.yesPrice, noPrice: data.noPrice })
                        } else {
                          setHoveredPrices(null)
                        }
                      }}
                    />
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs">Volume</span>
                    </div>
                    <div className="text-xl font-bold">
                      <AnimatedNumber
                        value={currentMarket.volume}
                        duration={1500}
                        formatter={(val) => formatVolume(val)}
                      />
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Participants</span>
                    </div>
                    <div className="text-xl font-bold">
                      <AnimatedNumber
                        value={currentMarket.participants}
                        duration={1500}
                        formatter={(val) => Math.round(val).toLocaleString()}
                      />
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs">Liquidity</span>
                    </div>
                    <div className="text-xl font-bold">
                      <AnimatedNumber
                        value={currentMarket.liquidity}
                        duration={1500}
                        formatter={(val) => formatVolume(val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column - Rules, Resolution, Timeline */}
          <div className="space-y-6">
            {/* Rules Section */}
            <div className="bg-card/90 border border-border/50 rounded-xl card-shadow backdrop-blur-sm">
            <div className='flex items-center justify-between p-6 cursor-pointer' onClick={() => setIsRulesOpen(!isRulesOpen)}>
                <h2 className="text-xl font-semibold">Rules</h2>
              <button className='font-medium flex items-center gap-2 text-sm transition'>
                <div className='p-1 rounded-full transition text-icon-soft-400'>
                  {isRulesOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
              </button>
              </div>              
              <div 
              className={`space-y-4 text-sm text-muted-foreground leading-relaxed border-t border-stroke-soft-200`}
              style={{
                height: isRulesOpen ? 'auto' : 0,
                overflow: 'hidden',
                opacity: isRulesOpen ? 1 : 0,
              }}
              >
                <div
                  className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-ul:text-muted-foreground prose-ol:text-muted-foreground p-6 pt-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentMarket.description) }}
                />
              </div>
            </div>

            {/* Resolution Source */}
            {(currentMarket.resolution_source_url || currentMarket.resolution_source_name) && (
              <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4 ">Resolution Source</h2>
                {currentMarket.resolution_source_url ? (
                  <div className="space-y-2">
                    <a
                      href={currentMarket.resolution_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2 group"
                    >
                      <span className="text-lg font-medium">
                        {currentMarket.resolution_source_name || currentMarket.resolution_source || 'View Source'}
                      </span>
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-5 h-5" />
                    <span className="text-base font-light">{currentMarket.resolution_source_name || currentMarket.resolution_source || 'You'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Opinions/Comments Section */}
            <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm">
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-border/30">
                <button
                  onClick={() => setActiveTab('opinions')}
                  className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'opinions'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Opinions ({comments.length})
                </button>
                <button
                  onClick={() => setActiveTab('holders')}
                  className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'holders'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Holders
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'activity'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('news')}
                  className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'news'
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
                  {!replyingTo && (
                    <div className="border border-border/50 rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        {currentUser?.avatar_url ? (
                          <img
                            src={currentUser.avatar_url}
                            alt={currentUser.username || 'You'}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <textarea
                            placeholder="Share your opinion..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            maxLength={500}
                            className="w-full bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground min-h-[80px]"
                          />
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                            <span className="text-xs text-muted-foreground">{commentContent.length}/500</span>
                            <button
                              onClick={handlePostComment}
                              disabled={!commentContent.trim() || createCommentMutation.isPending}
                              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {createCommentMutation.isPending ? 'Posting...' : 'Post'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments List */}
                  {commentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading comments...</p>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border-b border-border/30 pb-4 last:border-0">
                          {/* Original Comment */}
                          <div className="flex items-start gap-3">
                            {comment.user?.avatar_url ? (
                              <img
                                src={comment.user.avatar_url}
                                alt={comment.user.username || 'User'}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-foreground">
                                  {comment.user?.username || comment.user?.wallet_address?.slice(0, 6) || 'Anonymous'}
                                </span>
                                {comment.user?.wallet_address && (
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {comment.user.wallet_address.slice(0, 6)}...{comment.user.wallet_address.slice(-4)}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  · {formatTimeAgo(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground mb-2">{comment.content}</p>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleLikeComment(comment.id)}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>{comment.likes_count || 0}</span>
                                </button>
                                <button
                                  onClick={() => handleReplyClick(comment)}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Reply className="w-3.5 h-3.5" />
                                  <span>Reply</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Reply Input (shown when replying to this comment) */}
                          {replyingTo?.id === comment.id && (
                            <div className="mt-4 ml-11 border-l-2 border-border/30 pl-4">
                              <div className="text-xs text-muted-foreground mb-3">
                                Replying to <span className="text-primary">@{replyingTo.username}</span>
                              </div>
                              <div className="flex items-start gap-3">
                                {currentUser?.avatar_url ? (
                                  <img
                                    src={currentUser.avatar_url}
                                    alt={currentUser.username || 'You'}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <textarea
                                    placeholder="Post your reply"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    maxLength={500}
                                    className="w-full bg-muted/30 border border-border/50 rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    autoFocus
                                  />
                                  <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-muted-foreground">{replyContent.length}/500</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={handleCancelReply}
                                        className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handlePostReply(comment.id)}
                                        disabled={!replyContent.trim() || createCommentMutation.isPending}
                                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {createCommentMutation.isPending ? 'Posting...' : 'Reply'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 ml-11 space-y-4 border-l-2 border-border/30 pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-3">
                                  {reply.user?.avatar_url ? (
                                    <img
                                      src={reply.user.avatar_url}
                                      alt={reply.user.username || 'User'}
                                      className="w-8 h-8 rounded-full flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                      <User className="w-4 h-4 text-primary" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-foreground">
                                        {reply.user?.username || reply.user?.wallet_address?.slice(0, 6) || 'Anonymous'}
                                      </span>
                                      {reply.user?.wallet_address && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                          {reply.user.wallet_address.slice(0, 6)}...{reply.user.wallet_address.slice(-4)}
                                        </span>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        · {formatTimeAgo(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground mb-2">{reply.content}</p>
                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={() => handleLikeComment(reply.id)}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                      >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        <span>{reply.likes_count || 0}</span>
                                      </button>
                                      <button
                                        onClick={() => handleReplyClick(reply)}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                      >
                                        <Reply className="w-3.5 h-3.5" />
                                        <span>Reply</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No comments yet. Be the first to share your opinion!</p>
                    </div>
                  )}
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
        </div>

        {/* Right Column - Trading Interface */}
        <div className="lg:col-span-1 md:min-w-[280px] lg:min-w-[330px]">
          <div className="w-full py-4 bg-card/90 border border-border/50 pb-6 relative overflow-hidden px-4 md:px-4 pt-3 hidden md:block my-4 rounded-none sm:rounded-3xl sm:my-0 card-shadow backdrop-blur-sm sticky">
            {/* Buy/Sell Header */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setBuySellMode('buy')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${buySellMode === 'buy'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Buy
              </button>
              <button
                onClick={() => setBuySellMode('sell')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${buySellMode === 'sell'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Sell
              </button>
            </div>

            {/* Percentage Display */}
            <div className="mb-6">
              <div
                className="flex h-5 rounded-full overflow-hidden flex items-center p-1.5 mb-2"
                style={{
                  background: `linear-gradient(rgb(143, 112, 81) -23.2%, rgb(150, 120, 90) 106.03%)`,
                  boxShadow: `rgba(23, 15, 25, 0.8) 0px 1px 1px 0px inset, rgb(206, 180, 145) 0px -1px 1px 0px inset`
                }}
              >
                <div
                  className="h-1.75 w-full rounded-full overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg,#d7aafc,#e36ae8 54%,#f6469d)`,
                    boxShadow: `0 1px 1px 1px #bdf2df66 inset,0 0 4px 3px #ea7be31a`,
                  }}
                >
                  <div
                    className="h-1.75"
                    style={{
                      background: `linear-gradient(270deg,#e9fca3,#3ccc95 49.91%,#29d0ba 97.86%)`,
                      boxShadow: `0 1px 1px 1px #bdf2df66 inset,0 0 4px 3px #3ac99b1a`,
                      width: `${currentMarket.yes_price * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span className="text-primary">{(currentMarket.yes_price * 100).toFixed(0)}%</span>
                <span className="text-secondary">{(currentMarket.no_price * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Trading Buttons */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold mb-3">Pick a side</h3>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  onClick={() => setSelectedSide('up')}
                  className={`w-full py-3.5 rounded-lg font-semibold text-base transition-all ${selectedSide === 'up'
                      ? 'gold-button'
                      : 'gold-button opacity-60 hover:opacity-100'
                    }`}
                >
                  {currentMarket.custom_labels?.up}
                </button>

                <button
                  onClick={() => setSelectedSide('down')}
                  className={`w-full py-3.5 rounded-lg font-semibold text-base transition-all ${selectedSide === 'down'
                      ? 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-2 border-secondary'
                      : 'bg-gradient-to-br from-secondary/60 to-secondary/40 text-secondary-foreground border border-secondary/30 opacity-60 hover:opacity-100'
                    }`}
                >
                  {currentMarket.custom_labels?.down}
                </button>
              </div>

              {selectedSide && (
                <div className="pt-4 border-t border-border/30 space-y-3 mt-4">
                  <div>
                    <div className='flex items-center justify-between'>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Amount</label>
                      <span className="text-xs text-muted-foreground">Balance: 0</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-muted/50 border border-border/50 rounded-lg pl-7 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={0}
                      />
                    </div>
                  </div>
                  <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm">
                    {buySellMode === 'buy' ? 'Buy' : 'Sell'} {selectedSide === 'up' ? currentMarket.custom_labels?.up : currentMarket.custom_labels?.down}
                  </button>
                </div>
              )}

              {!selectedSide && (
                <div className="pt-4 border-t border-border/30 mt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Unavailable
                  </p>
                </div>
              )}
            </div>

            {/* Trading Details */}
            {selectedSide && (
              <div className="mt-6 pt-4 border-t border-border/30 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Price change</span>
                  <div className='flex items-center gap-1'>
                    <AnimatedNumber
                      value={selectedSide === 'up' ? currentMarket.yes_price : currentMarket.no_price}
                      duration={1000}
                      prefix="$"
                      decimals={2}
                      className="text-foreground font-medium"
                    />
                    <ArrowRight className="w-3 h-3" />
                    <AnimatedNumber
                      value={selectedSide === 'up' ? currentMarket.yes_price: currentMarket.no_price}
                      duration={1000}
                      prefix="$"
                      decimals={2}
                      className="text-foreground font-medium"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Shares</span>
                  <AnimatedNumber
                    value={0}
                    duration={1000}
                    decimals={0}
                    className="text-foreground font-medium"
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg. price</span>
                  <AnimatedNumber
                    value={currentMarket.yes_price}
                    duration={1000}
                    prefix="$"
                    decimals={2}
                    className="text-foreground font-medium"
                  />
                </div>
                <div className="h-[1px] bg-border/30 my-2" />
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Fee
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-icon-soft-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The fee is applied to the total amount of the trade. This fee is used to cover the costs of the platform and the liquidity providers.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <AnimatedNumber
                      value={1.42}
                      duration={1000}
                      decimals={2}
                      suffix="%"
                      className="text-foreground font-medium"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max profit</span>
                  <span className="text-foreground font-medium">
                    <AnimatedNumber
                      value={0}
                      duration={1000}
                      prefix="$"
                      decimals={2}
                      className="text-[#3ccb7f] font-medium"
                    />
                    {' '}
                    (
                    <AnimatedNumber
                      value={0}
                      duration={1000}
                      decimals={2}
                      suffix="%"
                      className="text-foreground font-medium"
                    />
                    )
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max payout</span>
                  <AnimatedNumber
                    value={0}
                    duration={1000}
                    prefix="$"
                    decimals={2}
                    className="text-foreground font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-card/90 border border-border/50 rounded-3xl card-shadow backdrop-blur-sm mt-6">
            <div
              className='flex cursor-pointer group p-4 min-h-6 items-center justify-between'
              onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            >
              <h3 className="text-base font-semibold">Timeline</h3>
              <button className='font-medium flex items-center gap-2 text-sm transition'>
                <div className='p-1 rounded-full transition text-icon-soft-400'>
                  {isTimelineOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
              </button>
            </div>
            <div style={{
              height: isTimelineOpen ? 'auto' : 0,
              overflow: 'hidden',
              opacity: isTimelineOpen ? 1 : 0,
            }}>
              <div className="space-y-4 border-t border-stroke-soft-200 p-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Market published</div>
                  <div className="text-xs font-light text-foreground">
                    {formatDate(currentMarket.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {currentMarket.market_type === 'perpetual' ? 'Never closes' : 'End date'}
                  </div>
                  <div className="text-xs font-light text-foreground">
                    {currentMarket.market_type === 'perpetual'
                      ? 'Perpetual markets never close.'
                      : formatDate(currentMarket.end_date)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

