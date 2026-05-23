import type { RouteNamedMap } from "vue-router/auto-routes";

import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";

type ChildWebviewRoutePath = RouteNamedMap[keyof RouteNamedMap]["path"];

/**
 * Options used to configure a child webview window.
 */
export interface ChildWebviewWindowOptions {
  /** Unique window label used for reuse checks. */
  label: string;
  /** Initial URL loaded inside the child window. */
  url: ChildWebviewRoutePath;
  /** Window title displayed by the OS. */
  title: string;
  /** Optional window width. */
  width?: number;
  /** Optional window height. */
  height?: number;
  /** Center the window on creation. */
  center?: boolean;
  /** Focus the window after creation. */
  focus?: boolean;
  /** Allow resizing. */
  resizable?: boolean;
  /** Allow minimization. */
  minimizable?: boolean;
  /** Allow maximization. */
  maximizable?: boolean;
  /** Allow closing. */
  closable?: boolean;
  /** Hide the window from the taskbar. */
  skipTaskbar?: boolean;
  /** Keep the window above other windows. */
  alwaysOnTop?: boolean;
}

/**
 * Create helpers for opening and reusing child webview windows.
 */
export function useChildWebviewWindow() {
  async function openChildWebviewWindow(
    options: ChildWebviewWindowOptions,
  ): Promise<void> {
    const mainWindow = getCurrentWindow();
    const existing = await WebviewWindow.getByLabel(options.label);

    if (existing) {
      await existing.setFocus();
      return;
    }

    const childWindow = new WebviewWindow(options.label, {
      url: options.url,
      title: options.title,
      width: options.width ?? 1040,
      height: options.height ?? 800,
      center: options.center ?? true,
      focus: options.focus ?? true,
      resizable: options.resizable ?? false,
      minimizable: options.minimizable ?? false,
      maximizable: options.maximizable ?? false,
      closable: options.closable ?? true,
      skipTaskbar: options.skipTaskbar ?? true,
      parent: mainWindow.label,
      alwaysOnTop: options.alwaysOnTop ?? true,
    });

    await new Promise<void>((resolve, reject) => {
      void childWindow.once("tauri://created", () => {
        resolve();
      });

      void childWindow.once("tauri://error", (event) => {
        reject(
          new Error(`Failed to create child window: ${String(event.payload)}`),
        );
      });
    });

    await mainWindow.setEnabled(false);
    await childWindow.setFocus();

    const restoreMainWindow = async (): Promise<void> => {
      await mainWindow.setEnabled(true);
      await mainWindow.setFocus();
    };

    void childWindow.once("tauri://destroyed", restoreMainWindow);
    void childWindow.once("tauri://error", restoreMainWindow);
  }

  return {
    openChildWebviewWindow,
  };
}
