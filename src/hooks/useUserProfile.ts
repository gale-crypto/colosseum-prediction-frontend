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
    onSuccess: (response, variables) => {
      // Invalidate user profile query
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] })
      // Also invalidate wallet auth user
      queryClient.invalidateQueries({ queryKey: ['wallet-auth'] })
    }
  })
}
