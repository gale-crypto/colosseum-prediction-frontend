import { Link } from 'react-router-dom'
import { Clock, TrendingUp, Users } from 'lucide-react'

export interface Market {
  id: string
  question: string
  description: string
  endDate: string
  volume: number
  participants: number
  yesPrice: number
  noPrice: number
  category: string
}

interface MarketCardProps {
  market: Market
}

export default function MarketCard({ market }: MarketCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Category-based gradient colors
  const categoryGradients: Record<string, string> = {
    'Crypto': 'from-yellow-500/10 to-orange-500/10',
    'Economics': 'from-green-500/10 to-emerald-500/10',
    'Technology': 'from-blue-500/10 to-cyan-500/10',
    'Politics': 'from-purple-500/10 to-pink-500/10',
    'Sports': 'from-red-500/10 to-rose-500/10',
  }

  const gradient = categoryGradients[market.category] || 'from-primary/10 to-secondary/10'

  return (
    <Link to={`/markets/${market.id}`}>
      <div className="relative bg-card/90 border border-border/50 rounded-2xl overflow-hidden hover:border-primary/70 hover:shadow-xl transition-all cursor-pointer backdrop-blur-sm group">
        {/* Category Image/Background */}
        <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 market-card-bg"></div>
        </div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full uppercase tracking-wide">
              {market.category}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(market.endDate)}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {market.question}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {market.description}
          </p>

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground font-medium">${(market.volume / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground font-medium">{market.participants}</span>
              </div>
            </div>
          </div>

          {/* Percentage Bar */}
          <div className="mb-3">
            <div className="flex h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 transition-all"
                style={{ width: `${market.yesPrice * 100}%` }}
              />
              <div
                className="bg-gradient-to-r from-secondary/80 to-secondary transition-all"
                style={{ width: `${market.noPrice * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-primary">{((market.yesPrice * 100).toFixed(1))}% YES</span>
              <span className="font-medium text-secondary">{((market.noPrice * 100).toFixed(1))}% NO</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">YES</div>
              <div className="text-xl font-bold text-primary">
                ${(market.yesPrice * 100).toFixed(2)}
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 rounded-lg p-3">
              <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">NO</div>
              <div className="text-xl font-bold text-secondary">
                ${(market.noPrice * 100).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

