// src/types/device.d.ts
import type { Device } from "@nuxtjs/device";

type NuxtDevice = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIos: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMacOS: boolean;
  isApple: boolean;
  isCrawler: boolean;
  isMobileOrTablet: boolean;
  userAgent: string;
};

declare module "#app" {
  interface NuxtApp {
    $device: NuxtDevice;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $device: NuxtDevice;
  }
}

export {};
