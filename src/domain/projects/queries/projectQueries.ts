import {
  defineQuery,
  useMutation,
  useQueryCache,
} from '@pinia/colada'
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '../types'
import { useProjectService } from '../services/useProjectService'

export const useProjectsQuery = defineQuery(() => {
  const service = useProjectService()

  return {
    key: ['projects'],
    query: () => service.listProjects(),
  }
})

export const useProjectQuery = defineQuery((id: MaybeRefOrGetter<string>) => {
  const service = useProjectService()

  return {
    key: () => ['projects', toValue(id)],
    query: () => service.getProject(toValue(id)),
  }
})

export function useCreateProjectMutation() {
  const queryCache = useQueryCache()
  const service = useProjectService()

  return useMutation({
    mutation: (input: CreateProjectInput) => service.createProject(input),

    async onSuccess() {
      await queryCache.invalidateQueries({ key: ['projects'] })
    },
  })
}

export function useUpdateProjectMutation() {
  const queryCache = useQueryCache()
  const service = useProjectService()

  return useMutation({
    mutation: (input: UpdateProjectInput) => service.updateProject(input),

    async onSuccess(project) {
      await Promise.all([
        queryCache.invalidateQueries({ key: ['projects'] }),
        queryCache.invalidateQueries({ key: ['projects', project.id] }),
      ])
    },
  })
}

export function useDeleteProjectMutation() {
  const queryCache = useQueryCache()
  const service = useProjectService()

  return useMutation({
    mutation: (id: string) => service.deleteProject(id),

    async onSuccess() {
      await queryCache.invalidateQueries({ key: ['projects'] })
    },
  })
}
