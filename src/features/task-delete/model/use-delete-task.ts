import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { dashboardQueries } from '@/entities/dashboard'
import { TaskRepository, taskQueries } from '@/entities/task'
import { ROUTES } from '@/shared/config/routes'

export interface UseDeleteTask {
  deleteTask: () => void
  isPending: boolean
}

export function useDeleteTask(id: string, onSettled?: () => void): UseDeleteTask {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => TaskRepository.remove(id),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: taskQueries.list().queryKey })
      await navigate({ to: ROUTES.TASK })
      queryClient.removeQueries({ queryKey: taskQueries.detail(id).queryKey })
      await queryClient.invalidateQueries({ queryKey: dashboardQueries.summary().queryKey })
    },
    onSettled,
  })

  return {
    deleteTask: mutation.mutate,
    isPending: mutation.isPending,
  }
}
