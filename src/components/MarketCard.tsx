import { Link } from 'react-router-dom'
import { Clock, TrendingUp, Users } from 'lucide-react'
import type { MarketCardData } from '../types/database'

interface MarketCardProps {
  market: MarketCardData
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
    <Link to={`/markets/${market.slug}`}>
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

          {/* Percentage Bar */}
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
                    width: `${market.yesPrice * 100}%`
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span className="text-primary">{(market.yesPrice * 100).toFixed(0)}%</span>
              <span className="text-secondary">{(market.noPrice * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="text-base font-medium text-muted-foreground uppercase tracking-wide">{market.custom_labels.up}</div>
            </button>
            <button className="flex-1 bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 rounded-lg p-3">
              <div className="text-base font-medium text-muted-foreground uppercase tracking-wide">{market.custom_labels.down}</div>
            </button>
          </div>

          <div className="flex justify-between gap-4 text-sm gap-1 mt-4 pt-3 border-t border-border/30">
            <div className='flex items-center rounded-full bg-primary/10 pr-2 gap-1'>
              <div className='w-8 h-6 relative'>
                <div className='absolute top-0 left-0 w-6 h-6 border border-[#110904] border-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500' />
                <div className='absolute top-0 left-2 w-6 h-6 border border-[#110904] border-2 rounded-full bg-gradient-to-br from-green-500 to-blue-500' />
              </div>
              <span className='text-sm'>+{market.participants}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground font-medium">${(market.volume / 1000).toFixed(1)}k</span>
            </div>
          </div>        
        </div>
      </div>
    </Link>
  )
}

