import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marketService } from '../services/marketService'
import type { MarketCardData } from '../types/database'

interface UseMarketsOptions {
  category?: string
  status?: string
  search?: string
  sortBy?: 'volume' | 'created_at' | 'participants'
}

export function useMarkets(options?: UseMarketsOptions) {
  return useQuery<MarketCardData[]>({
    queryKey: ['markets', options],
    queryFn: () => marketService.getAllMarkets(options),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true
  })
}

export function useMarket(idOrSlug: string) {
  return useQuery({
    queryKey: ['market', idOrSlug],
    queryFn: () => {
      // Try slug first (most common case), fallback to ID for backward compatibility
      // Check if it looks like a UUID (contains hyphens in UUID format)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
      
      if (isUUID) {
        return marketService.getMarketById(idOrSlug)
      } else {
        return marketService.getMarketBySlug(idOrSlug)
      }
    },
    enabled: !!idOrSlug,
    staleTime: 30000
  })
}

export function useMarketPriceHistory(marketId: string, timeFilter: '24h' | '7d' | '30d' | 'all' = 'all') {
  // Only enable if marketId is a valid UUID (not a slug)
  const isUUID = marketId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(marketId) : false
  
  return useQuery({
    queryKey: ['market-price-history', marketId, timeFilter],
    queryFn: () => marketService.getMarketPriceHistory(marketId, timeFilter),
    enabled: !!marketId && isUUID,
    staleTime: 60000 // 1 minute
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => marketService.getCategories(),
    staleTime: 300000 // 5 minutes
  })
}

export function useCreateMarket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      question: string
      description: string
      category_id: string
      market_type: 'perpetual' | 'hits' | 'time_scalar'
      market_method: 'binary' | 'multi_choice'
      end_date?: string
      resolution_source_url?: string
      resolution_source_name?: string
      banner_url?: string
      logo_url?: string
      tags?: string[]
      payment_options: string[]
      custom_labels?: { up: string; down: string }
      multi_choice_options?: string[]
      badge?: string
      initial_yes_price?: number
      initial_no_price?: number
      creation_fee_paid: boolean
      creation_fee_amount: number
    }) => {
      const { walletAuthService } = await import('../services/walletAuthService')
      
      // Get current user from wallet auth
      const currentUser = await walletAuthService.getCurrentUser()
      if (!currentUser) {
        throw new Error('You must be logged in to create markets')
      }

      // Generate slug from question
      const { slugify, generateUniqueSlug } = await import('../utils/slugify')
      const baseSlug = slugify(data.question)
      const slug = await generateUniqueSlug(
        baseSlug,
        async (slug) => {
          const { marketService } = await import('../services/marketService')
          return marketService.slugExists(slug)
        }
      )

      // Create market in Supabase
      const { supabase } = await import('../lib/supabase')
      const { data: market, error } = await supabase
        .from('markets')
        .insert({
          slug: slug,
          question: data.question,
          description: data.description,
          category_id: data.category_id || null,
          creator_id: currentUser.id,
          market_type: data.market_type,
          market_method: data.market_method,
          end_date: data.end_date || null,
          resolution_source_url: data.resolution_source_url || null,
          resolution_source_name: data.resolution_source_name || null,
          resolution_source: data.resolution_source_name || 'You', // Keep for backward compatibility
          banner_url: data.banner_url || null,
          logo_url: data.logo_url || null,
          image_url: data.banner_url || null, // Keep for backward compatibility
          tags: data.tags || null,
          payment_options: data.payment_options,
          custom_labels: data.custom_labels || null,
          multi_choice_options: data.multi_choice_options || null,
          badge: data.badge || null,
          creation_fee_paid: data.creation_fee_paid,
          creation_fee_amount: data.creation_fee_amount,
          yes_price: data.initial_yes_price ?? 0.5,
          no_price: data.initial_no_price ?? 0.5,
          initial_yes_price: data.initial_yes_price ?? 0.5,
          initial_no_price: data.initial_no_price ?? 0.5,
          volume: 0,
          liquidity: 0,
          participants: 0,
          trades_count: 0,
          resolution_status: 'open'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Create initial price history entry with custom or default prices
      if (market) {
        const initialYesPrice = data.initial_yes_price ?? 0.5
        const initialNoPrice = data.initial_no_price ?? 0.5
        
        const { error: priceHistoryError } = await supabase
          .from('market_price_history')
          .insert({
            market_id: market.id,
            yes_price: initialYesPrice,
            no_price: initialNoPrice,
            volume_24h: 0,
            timestamp: new Date().toISOString()
          })

        if (priceHistoryError) {
          console.error('Error creating initial price history:', priceHistoryError)
          // Don't throw - market is created, price history is optional
        }
      }

      return market
    },
    onSuccess: () => {
      // Invalidate markets query to refetch
      queryClient.invalidateQueries({ queryKey: ['markets'] })
    }
  })
}

