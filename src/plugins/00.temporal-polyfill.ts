import { Temporal as TemporalPolyfill } from "@js-temporal/polyfill";
import { defineNuxtPlugin } from "nuxt/app";

type GlobalWithTemporal = typeof globalThis & {
  Temporal?: typeof TemporalPolyfill;
};

/**
 * Installs Temporal polyfill only when native Temporal is not available.
 */
export default defineNuxtPlugin(() => {
  const globalWithTemporal = globalThis as GlobalWithTemporal;

  globalWithTemporal.Temporal ??= TemporalPolyfill;
});
