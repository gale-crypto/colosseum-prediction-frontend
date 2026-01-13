import { useState } from 'react'
import MarketCard from '../components/MarketCard'
import CategoryCard from '../components/CategoryCard'
import Dropdown from '../components/Dropdown'
import FilterModal from '../components/FilterModal'
import type { Market } from '../components/MarketCard'
import { Star, Clock, BarChart3, TrendingUp, ChevronRight, Search } from 'lucide-react'

// Mock data - replace with actual API calls
const mockMarkets: Market[] = [
  {
    id: '1',
    question: 'Will Ethereum reach $4,000 before $2,500?',
    description: 'This market resolves to YES if ETH reaches $4,000 before it reaches $2,500, and NO otherwise.',
    endDate: '2026-12-31',
    volume: 1250000,
    participants: 3420,
    yesPrice: 0.65,
    noPrice: 0.35,
    category: 'Crypto'
  },
  {
    id: '2',
    question: 'Will Bitcoin hit $100k in 2026?',
    description: 'This market resolves to YES if BTC reaches $100,000 USD on any exchange before January 1, 2025.',
    endDate: '2026-12-31',
    volume: 890000,
    participants: 2150,
    yesPrice: 0.42,
    noPrice: 0.58,
    category: 'Crypto'
  },
  {
    id: '3',
    question: 'Will there be a recession in 2026?',
    description: 'This market resolves based on official GDP data showing two consecutive quarters of negative growth.',
    endDate: '2026-12-31',
    volume: 560000,
    participants: 1890,
    yesPrice: 0.28,
    noPrice: 0.72,
    category: 'Economics'
  },
  {
    id: '4',
    question: 'Will AI achieve AGI by 2026?',
    description: 'This market resolves based on consensus from major AI research institutions.',
    endDate: '2026-12-31',
    volume: 320000,
    participants: 980,
    yesPrice: 0.15,
    noPrice: 0.85,
    category: 'Technology'
  }
]

export default function MarketsPage() {
  const [selectedToken, setSelectedToken] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('open')
  const [activeFilter, setActiveFilter] = useState<string>('featured')

  const categoryCards = [
    { name: 'Crypto', gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20', count: 9 },
    { name: 'Sports', gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20', count: 9 },
    { name: 'Politics', gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20', count: 12 },
    { name: 'Economy', gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20', count: 15 },
    { name: 'Gaming', gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20', count: 7 },
    { name: 'Culture', gradient: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20', count: 5 },
    { name: 'Sentiment', gradient: 'bg-gradient-to-br from-gray-500/20 to-gray-500/20', count: 5 },
  ]

  const filters = [
    { id: 'featured', label: 'Featured', icon: Star },
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'volume', label: 'Volume', icon: BarChart3 },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'ending', label: 'Ending', icon: Clock }
  ]

  const tokenOptions = [
    { value: 'all', label: 'All Tokens' },
    { value: 'usdc', label: 'USDC' },
    { value: 'points', label: 'Points' },
  ]

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'resolved', label: 'Resolved' },
  ]

  const filteredMarkets = mockMarkets.filter(() => {
    // In a real app, you'd filter by token and status here
    return true
  })

  return (
    <div className="max-w-8xl mx-auto">
      {/* Category Cards Section */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-muted/50">
        <div className="flex 2xl:grid 2xl:grid-cols-7 gap-2 p-2 overflow-x-auto 2xl:overflow-hidden scrollbar-hide">
          {categoryCards.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              gradient={category.gradient}
            />
          ))}
        </div>
        <div 
        className="flex flex-shrink-0 items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-muted/50 p-2 cursor-pointer"
        onClick={() => {
          const scrollLeft = document.querySelector('.category-cards')?.scrollLeft;
          if (scrollLeft) {
            (document.querySelector('.category-cards') as HTMLElement).scrollLeft += 100
          }
        }}
        >
          <ChevronRight className="w-6 h-6 text-muted-foreground" />
        </div>        
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-col items-start gap-4 xl:gap-6">
        {/* Mobile Filter Button */}
        <div className="flex gap-2 w-full xl:hidden">
          <div className="relative flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search markets..."
              className="w-full pl-10 pr-4 py-2.5 bg-input/50 border border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>           
          <FilterModal
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            tokenOptions={tokenOptions}
            statusOptions={statusOptions}
            selectedToken={selectedToken}
            selectedStatus={selectedStatus}
            onTokenChange={setSelectedToken}
            onStatusChange={setSelectedStatus}
          />
        </div>

        {/* Desktop Filter Buttons */}
        <div className="hidden xl:flex gap-2 w-full flex-wrap">
          <div className="relative flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search markets..."
              className="w-full pl-10 pr-4 py-2.5 bg-input/50 border border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>          
          {filters.map((filter) => {
            const Icon = filter.icon
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{filter.label}</span>
              </button>
            )
          })}
          <div className="flex items-center gap-2 ml-auto">
            <Dropdown
              options={tokenOptions}
              value={selectedToken}
              onChange={setSelectedToken}
              className="relative"
            />
            <Dropdown
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="relative"
            />
          </div>
        </div>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredMarkets.map(market => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center h-full w-full py-4">
          <p className="text-muted-foreground text-lg">No results found</p>
          <p className="text-muted-foreground text-sm mt-2">Try changing some of your filters to find markets.</p>
        </div>
      )}
    </div>
  )
}

