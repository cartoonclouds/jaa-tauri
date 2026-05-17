import type { DatabaseDriver } from '~/services/database/DatabaseDriver'

import { useNuxtApp } from 'nuxt/app'

import { ProjectService } from './ProjectService'

export function useProjectService() {
  const { $database } = useNuxtApp() as { $database: DatabaseDriver }
  return new ProjectService($database)
}
