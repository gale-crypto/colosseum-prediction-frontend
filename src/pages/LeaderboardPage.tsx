import { useState } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import Pagination from '../components/Pagination'
import { useLeaderboard } from '../hooks/useUserProfile'
import Title from '../components/Title'

interface LeaderboardEntry {
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
}

const ITEMS_PER_PAGE = 50

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { data, isLoading, error } = useLeaderboard(currentPage, ITEMS_PER_PAGE)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatAddress = (addr: string) => {
    if (!addr) return 'Unknown'
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const getDisplayName = (entry: LeaderboardEntry) => {
    return entry.username || formatAddress(entry.wallet_address)
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return null
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30'
    if (rank === 3) return 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/30'
    return 'bg-card/50 border-border/50'
  }

  // Calculate scores for display
  const calculateScores = (entry: LeaderboardEntry) => {
    // Map database fields to display scores
    const score = entry.total_profit // $ Score = total profit
    const refScore = entry.reputation_score // Ref Score = reputation
    const ptsScore = entry.total_trades // PTS Score = total trades
    const multiplier = entry.win_rate > 0 ? (entry.win_rate / 100) : 1 // Multiplier based on win rate
    const totalScore = score + refScore + (ptsScore * multiplier) // Total Score calculation

    return {
      score,
      refScore,
      ptsScore,
      multiplier: multiplier.toFixed(2),
      totalScore
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Title text="Leaderboard" />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Title text="Leaderboard" />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">Error loading leaderboard. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  const entries: LeaderboardEntry[] = data?.entries || []
  const totalItems = data?.total || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Title text="Leaderboard" />
        <div className="flex items-center gap-4 mt-4">
          <div className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg">
            <span className="text-sm font-medium text-primary">SZN 2</span>
          </div>
          <span className="text-muted-foreground text-sm">
            ({totalItems >= 1000 ? `${(totalItems / 1000).toFixed(0)}K` : totalItems.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-card/90 border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</th>
                <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">$ Score</th>
                <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Ref Score</th>
                <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">PTS Score</th>
                <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Multiplier</th>
                <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 lg:px-6 py-8 text-center text-muted-foreground">
                    No leaderboard data available
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const scores = calculateScores(entry)
                  const displayName = getDisplayName(entry)
                  
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-muted/30 transition-colors ${getRankBg(entry.rank)}`}
                    >
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                          <span className="font-semibold text-foreground">{entry.rank}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt={displayName}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-primary">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-none">
                            {displayName.length > 20
                              ? `${displayName.slice(0, 20)}...`
                              : displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-foreground text-sm">
                        {formatNumber(scores.score)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-foreground text-sm hidden lg:table-cell">
                        {formatNumber(scores.refScore)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-foreground text-sm hidden lg:table-cell">
                        {formatNumber(scores.ptsScore)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-foreground text-sm hidden xl:table-cell">
                        {scores.multiplier}x
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-bold text-primary text-sm">
                        {formatNumber(scores.totalScore)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border/30">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No leaderboard data available
            </div>
          ) : (
            entries.map((entry) => {
              const scores = calculateScores(entry)
              const displayName = getDisplayName(entry)
              
              return (
                <div
                  key={entry.id}
                  className={`p-4 ${getRankBg(entry.rank)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <span className="font-semibold text-foreground text-lg">{entry.rank}</span>
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={displayName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-foreground truncate max-w-[140px]">
                        {displayName.length > 15
                          ? `${displayName.slice(0, 15)}...`
                          : displayName}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">$ Score</div>
                      <div className="font-medium text-foreground">{formatNumber(scores.score)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total Score</div>
                      <div className="font-bold text-primary">{formatNumber(scores.totalScore)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Ref Score</div>
                      <div className="font-medium text-foreground">{formatNumber(scores.refScore)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">PTS Score</div>
                      <div className="font-medium text-foreground">{formatNumber(scores.ptsScore)}</div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={totalItems}
        />
      )}
    </div>
  )
}
