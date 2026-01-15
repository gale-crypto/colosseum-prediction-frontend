import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MarketCard from '../components/MarketCard'
import CategoryCard from '../components/CategoryCard'
import Dropdown from '../components/Dropdown'
import FilterModal from '../components/FilterModal'
import { useMarkets, useCategories } from '../hooks/useMarkets'
import { Star, Clock, BarChart3, TrendingUp, ChevronRight, Search } from 'lucide-react'
import type { MarketCardData } from '../types/database'

export default function MarketsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category') || undefined
  
  const [selectedToken, setSelectedToken] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('open')
  const [activeFilter, setActiveFilter] = useState<string>('featured')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Fetch markets from Supabase
  const { data: markets = [], isLoading, error } = useMarkets({
    category: categoryFromUrl,
    status: selectedStatus,
    search: searchQuery || undefined,
    sortBy: activeFilter === 'volume' ? 'volume' : activeFilter === 'newest' ? 'created_at' : 'participants'
  })

  // Fetch categories from Supabase
  const { data: categories = [] } = useCategories()

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

  // Map categories to category cards format
  const categoryCards = categories.map(cat => {
    const gradients: Record<string, string> = {
      'Crypto': 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
      'Sports': 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      'Politics': 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      'Economy': 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      'Gaming': 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
      'Culture': 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
      'Sentiment': 'bg-gradient-to-br from-gray-500/20 to-gray-500/20',
    }
    return {
      name: cat.name,
      slug: cat.slug,
      gradient: gradients[cat.name] || 'bg-gradient-to-br from-primary/20 to-secondary/20',
      count: cat.market_count
    }
  })

  return (
    <div className="max-w-8xl mx-auto">
      {/* Category Cards Section */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-muted/50">
        <div className="flex 2xl:grid 2xl:grid-cols-7 gap-2 p-2 overflow-x-auto 2xl:overflow-hidden scrollbar-hide">
          {categoryCards.map((category) => (
            <CategoryCard
              key={category.slug}
              name={category.name}
              slug={category.slug}
              gradient={category.gradient}
              isActive={categoryFromUrl === category.slug}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
      {isLoading ? (
        <div className="flex flex-col items-center h-full w-full py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading markets...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center h-full w-full py-12">
          <p className="text-muted-foreground text-lg">Error loading markets</p>
          <p className="text-muted-foreground text-sm mt-2">Please try again later.</p>
        </div>
      ) : markets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {markets.map(market => (
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
