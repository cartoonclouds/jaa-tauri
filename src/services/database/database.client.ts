import { defineNuxtPlugin } from "nuxt/app";

import { TauriSqliteDriver } from "./TauriSqliteDriver.client";

export default defineNuxtPlugin(async () => {
  const database = await TauriSqliteDriver.connect("sqlite:jaa.db");

  return {
    provide: {
      database,
    },
  };
});
