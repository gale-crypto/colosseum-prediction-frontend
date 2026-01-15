// Database types matching Supabase schema

export interface User {
  id: string
  wallet_address: string
  username: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  twitter_handle: string | null
  telegram_handle: string | null
  total_volume: number
  total_profit: number
  win_rate: number
  reputation_score: number
  is_verified: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  color: string | null
  market_count: number
  created_at: string
}

export interface Market {
  id: string
  slug: string // URL-friendly slug generated from question
  question: string
  description: string
  category_id: string | null
  creator_id: string | null
  market_type: 'perpetual' | 'hits' | 'time_scalar'
  start_date: string
  end_date: string | null
  resolution_date: string | null
  yes_price: number
  no_price: number
  initial_yes_price: number | null
  initial_no_price: number | null
  volume: number
  liquidity: number
  participants: number
  trades_count: number
  resolution_status: 'open' | 'resolved' | 'cancelled'
  resolution_outcome: 'yes' | 'no' | 'cancelled' | null
  resolution_source: string | null // Deprecated, use resolution_source_name
  resolution_source_url: string | null
  resolution_source_name: string | null
  resolution_notes: string | null
  image_url: string | null // Deprecated, use banner_url and logo_url
  banner_url: string | null
  logo_url: string | null
  tags: string[] | null
  is_featured: boolean
  is_verified: boolean
  // New fields
  payment_options: string[] // ['USDT', 'SOL']
  custom_labels: { up: string; down: string } | null
  market_method: 'binary' | 'multi_choice'
  multi_choice_options: string[] | null // For multi-choice markets
  badge: string | null // 'Sentiment', 'Points', 'New Years Special', etc.
  creation_fee_paid: boolean
  creation_fee_amount: number
  created_at: string
  updated_at: string
  // Joined fields
  category?: Category
  creator?: User
}

export interface MarketPriceHistory {
  id: string
  market_id: string
  yes_price: number
  no_price: number
  volume_24h: number
  timestamp: string
}

export interface Trade {
  id: string
  market_id: string
  user_id: string
  side: 'yes' | 'no'
  trade_type: 'buy' | 'sell'
  shares: number
  price: number
  amount: number
  fee_amount: number
  fee_percentage: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  transaction_hash: string | null
  created_at: string
}

export interface Position {
  id: string
  market_id: string
  user_id: string
  side: 'yes' | 'no'
  shares: number
  avg_price: number
  total_cost: number
  current_price: number | null
  current_value: number | null
  unrealized_profit: number
  realized_profit: number
  updated_at: string
}

export interface Comment {
  id: string
  market_id: string
  user_id: string
  parent_id: string | null
  content: string
  likes_count: number
  replies_count: number
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  // Joined fields
  user?: User
  replies?: Comment[]
}

export interface CommentLike {
  id: string
  comment_id: string
  user_id: string
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  market_id: string
  created_at: string
}

// Frontend-friendly Market type (matching MarketCard interface)
export interface MarketCardData {
  id: string
  slug: string
  question: string
  description: string
  endDate: string
  volume: number
  participants: number
  yesPrice: number
  noPrice: number
  category: string,
  custom_labels: { up: string; down: string }
  image_url: string | null // Deprecated, use banner_url
  banner_url: string | null
  logo_url: string | null
}

