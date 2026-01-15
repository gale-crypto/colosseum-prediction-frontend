import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import type { UpdateProfileData } from '../services/userService'

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userService.getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 30000
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateProfileData }) =>
      userService.updateProfile(userId, data),
    onSuccess: (_response, variables) => {
      // Invalidate user profile query
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] })
      // Also invalidate wallet auth user
      queryClient.invalidateQueries({ queryKey: ['wallet-auth'] })
    }
  })
}

export function useUserRank(userId: string | null | undefined) {
  return useQuery<number | null>({
    queryKey: ['user-rank', userId],
    queryFn: () => userId ? userService.getUserRank(userId) : null,
    enabled: !!userId,
    staleTime: 300000, // 5 minutes (rank doesn't change frequently)
    refetchOnWindowFocus: false
  })
}

export function useLeaderboard(page: number = 1, itemsPerPage: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', page, itemsPerPage],
    queryFn: () => userService.getLeaderboard(page, itemsPerPage),
    staleTime: 60000, // 1 minute
    placeholderData: (previousData) => previousData // Keep previous data while fetching new page
  })
}
