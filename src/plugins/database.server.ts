import { defineNuxtPlugin } from "nuxt/app";

import { InMemoryDriver } from "@/services/database/InMemoryDriver";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      database: new InMemoryDriver(),
    },
  };
});
