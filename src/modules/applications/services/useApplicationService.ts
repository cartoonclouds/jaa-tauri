import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { ApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";
import { ApplicationService } from "@modules/applications/services/ApplicationService";
import { useNuxtApp } from "nuxt/app";

export function useApplicationService(): ApplicationService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new ApplicationService(new ApplicationRepository(database));
}
