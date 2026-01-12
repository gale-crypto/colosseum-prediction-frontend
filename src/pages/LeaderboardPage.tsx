import { useState, useMemo } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import Pagination from '../components/Pagination'

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  refScore: number
  ptsScore: number
  multiplier: number
  totalScore: number
  profilePicture?: string
}

// Generate mock data for a specific page range (lazy loading approach)
const generatePageData = (page: number, itemsPerPage: number): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = []
  const usernames = [
    'Arii_Defi', 'Novus', 'Gandi', 'jepri', '0xculo455632yyy2gufoculobello3787873t17gy2vxx2jjj',
    'CryptoKing', 'DeFiMaster', 'TradingPro', 'BlockchainGuru', 'CryptoWhale',
    'MoonLander', 'DiamondHands', 'HodlForever', 'BullMarket', 'CryptoNinja',
    'TradingElite', 'DeFiWarrior', 'CryptoLegend', 'MarketMaker', 'PriceOracle'
  ]

  const startRank = (page - 1) * itemsPerPage + 1
  // const endRank = page * itemsPerPage

  // Use a seeded random function for consistent data per page
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  for (let i = 0; i < itemsPerPage; i++) {
    const rank = startRank + i
    if (rank > TOTAL_ITEMS) break
    
    const seed = rank * 1000
    const usernameIndex = Math.floor(seededRandom(seed) * usernames.length)
    const username = rank <= 5 ? usernames[rank - 1] : `${usernames[usernameIndex]}_${rank}`
    
    // Generate scores that decrease as rank increases (more realistic leaderboard)
    const baseScore = 100000000 - (rank * 100000)
    const score = Math.max(1000000, baseScore + Math.floor(seededRandom(seed + 1) * 50000000))
    const refScore = Math.floor(seededRandom(seed + 2) * 5000000)
    const ptsScore = Math.floor(seededRandom(seed + 3) * 100000000)
    const multiplier = seededRandom(seed + 4) > 0.5 ? 3 : 2
    const totalScore = (score + refScore + ptsScore) * multiplier

    entries.push({
      rank,
      username,
      score,
      refScore,
      ptsScore,
      multiplier,
      totalScore
    })
  }

  return entries
}

const ITEMS_PER_PAGE = 50
const TOTAL_ITEMS = 531018 // Total number of predictors
const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE)

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const currentPageData = useMemo(() => {
    return generatePageData(currentPage, ITEMS_PER_PAGE)
  }, [currentPage])
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 gold-text gelio-font">Leaderboard</h1>
        <div className="flex items-center gap-4 mt-4">
          <div className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg">
            <span className="text-sm font-medium text-primary">SZN 2</span>
          </div>
          <span className="text-muted-foreground text-sm">(531K)</span>
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
              {currentPageData.map((entry) => (
                <tr
                  key={entry.rank}
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
                      {entry.profilePicture ? (
                        <img
                          src={entry.profilePicture}
                          alt={entry.username}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">
                            {entry.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-none">
                        {entry.username.length > 20
                          ? `${entry.username.slice(0, 20)}...`
                          : entry.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-foreground text-sm">
                    {formatNumber(entry.score)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-foreground text-sm hidden lg:table-cell">
                    {formatNumber(entry.refScore)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-foreground text-sm hidden lg:table-cell">
                    {formatNumber(entry.ptsScore)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-foreground text-sm hidden xl:table-cell">
                    {entry.multiplier}x
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-bold text-primary text-sm">
                    {formatNumber(entry.totalScore)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border/30">
          {currentPageData.map((entry) => (
            <div
              key={entry.rank}
              className={`p-4 ${getRankBg(entry.rank)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <span className="font-semibold text-foreground text-lg">{entry.rank}</span>
                  {entry.profilePicture ? (
                    <img
                      src={entry.profilePicture}
                      alt={entry.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {entry.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-foreground truncate max-w-[140px]">
                    {entry.username.length > 15
                      ? `${entry.username.slice(0, 15)}...`
                      : entry.username}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">$ Score</div>
                  <div className="font-medium text-foreground">{formatNumber(entry.score)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Total Score</div>
                  <div className="font-bold text-primary">{formatNumber(entry.totalScore)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ref Score</div>
                  <div className="font-medium text-foreground">{formatNumber(entry.refScore)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">PTS Score</div>
                  <div className="font-medium text-foreground">{formatNumber(entry.ptsScore)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={TOTAL_ITEMS}
      />
    </div>
  )
}

