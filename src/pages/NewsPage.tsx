import { Calendar, ExternalLink } from 'lucide-react'

interface NewsArticle {
  id: string
  title: string
  excerpt: string
  source: string
  date: string
  category: string
  link?: string
  image?: string
}

// Mock data - replace with actual API call
const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Getting Started With Myriad',
    excerpt: "Myriad's prediction market ecosystem enables you to make predictions using USDC. Here's how to get set up and start using it.",
    source: 'Decrypt',
    date: '2024-01-10',
    category: 'Tutorial',
  },
  {
    id: '2',
    title: 'Buy the Bitcoin Dip? Why Ric Edelman Still Thinks Portfolios Should Hold Up to 40% Crypto',
    excerpt: "Ric Edelman isn't budging from the Bitcoin investment strategies he urged six months ago, even as BTC lingers far from record-breaking heights.",
    source: 'Decrypt',
    date: '2024-01-09',
    category: 'Crypto',
  },
  {
    id: '3',
    title: 'Crypto Holiday Gift Guide 2025',
    excerpt: 'At a loss for what to buy the crypto fan in your life this festive season? Look no further than Decrypt\'s holiday gift guide.',
    source: 'Decrypt',
    date: '2024-01-08',
    category: 'Culture',
  },
  {
    id: '4',
    title: 'Professor Coin: When Bitcoin Sneezes—How Crypto and Equities Caught the Same Cold',
    excerpt: 'Academic literature finds that during periods of economic stress, correlations and spillovers between cryptocurrencies and equities spike.',
    source: 'Decrypt',
    date: '2024-01-07',
    category: 'Economics',
  },
  {
    id: '5',
    title: 'Bitcoin, Ethereum and XRP Dive as Liquidations Hit $500 Million—While Stocks Rise',
    excerpt: 'Bitcoin is back below the $90,000 mark as Ethereum flirts with another dip below $3,000—all while major stock indices stay green.',
    source: 'Decrypt',
    date: '2024-01-06',
    category: 'Crypto',
  },
]

export default function NewsPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 gold-text gelio-font">News</h1>
        <p className="text-muted-foreground">Stay updated with the latest from the prediction market world</p>
      </div>

      {/* Articles Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockArticles.map((article) => (
          <article
            key={article.id}
            className="bg-card/90 border border-border/50 rounded-xl overflow-hidden hover:border-primary/70 hover:shadow-lg transition-all backdrop-blur-sm group"
          >
            {article.image && (
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                <div className="absolute inset-0 market-card-bg opacity-10"></div>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full uppercase tracking-wide">
                  {article.category}
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(article.date)}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <span className="text-xs font-medium text-primary">{article.source}</span>
                <button className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                  <span>Read More</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-medium transition-colors">
          Load more
        </button>
      </div>
    </div>
  )
}

