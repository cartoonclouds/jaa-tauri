import { defineNuxtPlugin } from "nuxt/app";

import { InMemoryDriver } from "@/services/database/InMemoryDriver";

export default defineNuxtPlugin(async () => {
  if (import.meta.server) {
    return {
      provide: {
        database: new InMemoryDriver(),
      },
    };
  }

  const { TauriSqliteDriver } =
    await import("@/services/database/TauriSqliteDriver.client");
  const database = await TauriSqliteDriver.connect("sqlite:jaa.db");

  return {
    provide: {
      database,
    },
  };
});
