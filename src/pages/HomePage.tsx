import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Users, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 gold-text gelio-font leading-tight">
          Colosseum Prediction Market
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Bet on the future. Trade on outcomes. Win with knowledge.
          Experience the ancient arena of prediction markets.
        </p>
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 gold-button px-8 py-4 rounded-full font-semibold transition-all text-base sm:text-lg"
        >
          <span>Explore Markets</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <TrendingUp className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Live Markets</h3>
          <p className="text-muted-foreground">
            Trade on real-world events with real-time pricing and liquidity.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <Users className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
          <p className="text-muted-foreground">
            Join thousands of traders making predictions on global events.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <Clock className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Time-Limited</h3>
          <p className="text-muted-foreground">
            Markets resolve automatically when events occur or deadlines pass.
          </p>
        </div>
      </div>

      {/* Popular Markets Preview */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 gold-text">Popular Markets</h2>
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">
            Explore active prediction markets
          </p>
          <Link
            to="/markets"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            View All Markets
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

