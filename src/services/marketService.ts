import { supabase } from '../lib/supabase'
import type { Market, MarketCardData, MarketPriceHistory } from '../types/database'

export class MarketService {
  // Convert database Market to MarketCardData format
  private mapToMarketCard(market: Market): MarketCardData {
    return {
      id: market.id,
      slug: market.slug,
      question: market.question,
      description: market.description,
      endDate: market.end_date || '',
      volume: market.volume,
      participants: market.participants,
      yesPrice: market.yes_price,
      noPrice: market.no_price,
      category: market.category?.name || 'Other',
      custom_labels: market.custom_labels || { up: 'YES', down: 'NO' },
    }
  }

  // Get all markets
  async getAllMarkets(filters?: {
    category?: string
    status?: string
    search?: string
    sortBy?: 'volume' | 'created_at' | 'participants'
  }): Promise<MarketCardData[]> {
    // Get category ID if category filter is provided
    let categoryId: string | null = null
    if (filters?.category && filters.category !== 'all') {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.category)
        .single()
      
      if (categoryData) {
        categoryId = categoryData.id
      }
    }

    let query = supabase
      .from('markets')
      .select(`
        *,
        category:categories(*)
      `)

    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (filters?.status) {
      if (filters.status === 'open') {
        query = query.eq('resolution_status', 'open')
      } else if (filters.status === 'resolved') {
        query = query.eq('resolution_status', 'resolved')
      } else if (filters.status === 'closed') {
        query = query.in('resolution_status', ['resolved', 'cancelled'])
      }
    }

    if (filters?.search) {
      query = query.or(`question.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting
    if (filters?.sortBy === 'volume') {
      query = query.order('volume', { ascending: false })
    } else if (filters?.sortBy === 'participants') {
      query = query.order('participants', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching markets:', error)
      throw error
    }

    return (data || []).map(market => this.mapToMarketCard(market as Market))
  }

  // Get market by ID
  async getMarketById(id: string): Promise<Market | null> {
    const { data, error } = await supabase
      .from('markets')
      .select(`
        *,
        category:categories(*),
        creator:users(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching market:', error)
      throw error
    }

    return data as Market
  }

  // Get market by slug
  async getMarketBySlug(slug: string): Promise<Market | null> {
    const { data, error } = await supabase
      .from('markets')
      .select(`
        *,
        category:categories(*),
        creator:users(*)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching market by slug:', error)
      throw error
    }

    return data as Market
  }

  // Check if slug exists
  async slugExists(slug: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('markets')
      .select('id')
      .eq('slug', slug)
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return false // No row found, slug doesn't exist
      }
      console.error('Error checking slug:', error)
      throw error
    }

    return !!data
  }

  // Get market price history
  async getMarketPriceHistory(
    marketId: string,
    timeFilter: '24h' | '7d' | '30d' | 'all' = 'all'
  ): Promise<MarketPriceHistory[]> {
    let query = supabase
      .from('market_price_history')
      .select('*')
      .eq('market_id', marketId)
      .order('timestamp', { ascending: true })

    // Apply time filter
    const now = new Date()
    let startTime: Date

    switch (timeFilter) {
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(0) // All time
    }

    if (timeFilter !== 'all') {
      query = query.gte('timestamp', startTime.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching price history:', error)
      throw error
    }

    return (data || []) as MarketPriceHistory[]
  }

  // Get categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      throw error
    }

    return data || []
  }

  // Subscribe to market price updates
  subscribeToMarketPrices(marketId: string, callback: (market: Market) => void) {
    return supabase
      .channel(`market-prices-${marketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
          filter: `id=eq.${marketId}`
        },
        (payload) => {
          callback(payload.new as Market)
        }
      )
      .subscribe()
  }
}

export const marketService = new MarketService()

