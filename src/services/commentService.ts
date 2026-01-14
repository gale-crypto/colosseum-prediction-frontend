import { supabase } from '../lib/supabase'
import type { Comment } from '../types/database'

export class CommentService {
  // Get comments for a market
  async getMarketComments(marketId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, username, wallet_address, avatar_url)
      `)
      .eq('market_id', marketId)
      .eq('is_deleted', false)
      .is('parent_id', null) // Only top-level comments
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      throw error
    }

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            user:users(id, username, wallet_address, avatar_url)
          `)
          .eq('parent_id', comment.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies: replies || []
        } as Comment
      })
    )

    return commentsWithReplies
  }

  // Create a comment
  async createComment(marketId: string, userId: string, content: string, parentId?: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        market_id: marketId,
        user_id: userId,
        content,
        parent_id: parentId || null
      })
      .select(`
        *,
        user:users(id, username, wallet_address, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      throw error
    }

    return data as Comment
  }

  // Like a comment
  async likeComment(commentId: string, userId: string) {
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: userId
      })

    if (error) {
      // If already liked, unlike it
      if (error.code === '23505') {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId)
      } else {
        console.error('Error liking comment:', error)
        throw error
      }
    }
  }

  // Subscribe to new comments
  subscribeToComments(marketId: string, callback: (comment: Comment) => void) {
    return supabase
      .channel(`comments-${marketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `market_id=eq.${marketId}`
        },
        async (payload) => {
          // Fetch full comment with user data
          const { data } = await supabase
            .from('comments')
            .select(`
              *,
              user:users(id, username, wallet_address, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            callback(data as Comment)
          }
        }
      )
      .subscribe()
  }
}

export const commentService = new CommentService()

