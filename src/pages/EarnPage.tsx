import { Gem, ExternalLink } from 'lucide-react'

interface EarnOpportunity {
  id: string
  title: string
  description: string
  points: string
  source: string
  link?: string
  image?: string
}

// Mock data - replace with actual API call
const mockEarnOpportunities: EarnOpportunity[] = [
  {
    id: '1',
    title: 'Vote for Myriad on the Abstract Portal',
    description: 'Myriad Markets partners with @TrustWallet to become the first ever native Prediction Market product inside a wallet.',
    points: '10K+ pts',
    source: 'Myriad',
  },
  {
    id: '2',
    title: 'Myriad Markets on Trust Wallet',
    description: 'Trusted by over 200 million people, Trust Wallet will make Myriad Markets on-chain predictions accessible in a way the industry has never seen before.',
    points: '20K+ pts',
    source: 'Myriad',
  },
  {
    id: '3',
    title: '1inch Gives Developers Early Access',
    description: 'Aqua will allow multiple DeFi strategies to operate using the same capital simultaneously, without compromising self-custody for users.',
    points: '5K pts',
    source: 'DECRYPT',
  },
  {
    id: '4',
    title: 'MYRIAD is now live on BNB Chain',
    description: 'LIVE NOW: Automated Markets, continuous 5-minute price action markets with auto resolution. Full BNB Chain support with EVM wallet sign-in options.',
    points: '20K+ pts',
    source: 'Myriad',
  },
]

export default function EarnPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 gold-text gelio-font">Earn</h1>
        <p className="text-muted-foreground">Engage with content and earn points</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg font-medium whitespace-nowrap">
          All
        </button>
        <button className="px-4 py-2 bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50 rounded-lg font-medium whitespace-nowrap">
          MYRIAD
        </button>
        <button className="px-4 py-2 bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50 rounded-lg font-medium whitespace-nowrap">
          DECRYPT
        </button>
        <button className="px-4 py-2 bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50 rounded-lg font-medium whitespace-nowrap">
          RUG RADIO
        </button>
        <button className="px-4 py-2 bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50 rounded-lg font-medium whitespace-nowrap">
          DEGENZ LIVE
        </button>
      </div>

      {/* Earn Opportunities Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEarnOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-card/90 border border-border/50 rounded-xl p-6 hover:border-primary/70 hover:shadow-lg transition-all backdrop-blur-sm group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-lg">
                <span className="text-xs font-medium text-primary uppercase">{opportunity.source}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-semibold">
                <Gem className="w-4 h-4" />
                <span className="text-sm">{opportunity.points}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {opportunity.title}
            </h3>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
              {opportunity.description}
            </p>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-medium transition-colors">
              <span>Engage to Earn</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

