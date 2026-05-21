import type { Device } from "@nuxtjs/device";

/**
 * Normalized device flags exposed to the app.
 */
interface NuxtDevice {
  /** True when the current device is mobile. */
  isMobile: boolean;
  /** True when the current device is a tablet. */
  isTablet: boolean;
  /** True when the current device is a desktop. */
  isDesktop: boolean;
  /** True when running on iOS. */
  isIos: boolean;
  /** True when running on Android. */
  isAndroid: boolean;
  /** True when running on Windows. */
  isWindows: boolean;
  /** True when running on macOS. */
  isMacOS: boolean;
  /** True when running on an Apple platform. */
  isApple: boolean;
  /** True when the user agent looks like a crawler. */
  isCrawler: boolean;
  /** True when the device is mobile or tablet sized. */
  isMobileOrTablet: boolean;
  /** Raw user agent string. */
  userAgent: string;
}

declare module "#app" {
  interface NuxtApp {
    /** Device helper injected by @nuxtjs/device. */
    $device: NuxtDevice;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    /** Device helper injected by @nuxtjs/device. */
    $device: NuxtDevice;
  }
}

export {};
