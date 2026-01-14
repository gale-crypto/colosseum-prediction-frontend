import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '../services/commentService'
import type { Comment } from '../types/database'

export function useMarketComments(marketId: string) {
  // Only enable if marketId is a valid UUID (not a slug)
  const isUUID = marketId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(marketId) : false
  
  return useQuery<Comment[]>({
    queryKey: ['comments', marketId],
    queryFn: () => commentService.getMarketComments(marketId),
    enabled: !!marketId && isUUID,
    staleTime: 30000
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ marketId, userId, content, parentId }: {
      marketId: string
      userId: string
      content: string
      parentId?: string
    }) => commentService.createComment(marketId, userId, content, parentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.marketId] })
    }
  })
}

export function useLikeComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, userId }: { commentId: string; userId: string }) =>
      commentService.likeComment(commentId, userId),
    onSuccess: (_, variables) => {
      // Invalidate comments to refresh likes count
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    }
  })
}

