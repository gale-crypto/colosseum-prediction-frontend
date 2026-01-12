import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, TrendingUp, Users, DollarSign } from 'lucide-react'
import type { Market } from '../components/MarketCard'

// Mock data - replace with actual API call
const mockMarket: Market = {
  id: '1',
  question: 'Will Ethereum reach $4,000 before $2,500?',
  description: 'This market resolves to YES if ETH reaches $4,000 before it reaches $2,500, and NO otherwise. The market uses CoinGecko as the price source and checks prices every hour.',
  endDate: '2026-12-31',
  volume: 1250000,
  participants: 3420,
  yesPrice: 0.65,
  noPrice: 0.35,
  category: 'Crypto'
}

export default function MarketDetailPage() {
  const market = mockMarket // In real app, fetch by id from useParams

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/markets"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Markets</span>
      </Link>

      <div className="relative bg-card/90 border border-border/50 rounded-xl p-6 sm:p-8 card-shadow mb-6 backdrop-blur-sm">
        <div className="absolute inset-0 rounded-xl opacity-5 market-card-bg pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full uppercase tracking-wide">
              {market.category}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>Ends {formatDate(market.endDate)}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 gold-text gelio-font leading-tight">
            {market.question}
          </h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          {market.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Volume</span>
            </div>
            <div className="text-2xl font-bold">${market.volume.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Participants</span>
            </div>
            <div className="text-2xl font-bold">{market.participants.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Liquidity</span>
            </div>
            <div className="text-2xl font-bold">${(market.volume * 0.1).toLocaleString()}</div>
          </div>
        </div>

        {/* Price Display */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-xl p-6 sm:p-8">
            <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">YES</div>
            <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
              ${(market.yesPrice * 100).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {(market.yesPrice * 100).toFixed(1)}% probability
            </div>
          </div>
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-2 border-secondary/30 rounded-xl p-6 sm:p-8">
            <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">NO</div>
            <div className="text-4xl sm:text-5xl font-bold text-secondary mb-2">
              ${(market.noPrice * 100).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {(market.noPrice * 100).toFixed(1)}% probability
            </div>
          </div>
        </div>

        {/* Trading Interface Placeholder */}
        <div className="border-t border-border/30 pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 gelio-font">Place Your Bet</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button className="gold-button py-4 rounded-full font-semibold text-lg transition-all hover:scale-105">
              Buy YES
            </button>
            <button className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 border border-secondary/30">
              Buy NO
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Connect your wallet to start trading
          </p>
        </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm">
        <h3 className="font-semibold mb-4 gelio-font text-lg">Market Rules</h3>
        <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Market resolves automatically when the condition is met or deadline passes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Prices update in real-time based on trading activity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Minimum bet size: $10</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Trading fees: 2% on each trade</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

