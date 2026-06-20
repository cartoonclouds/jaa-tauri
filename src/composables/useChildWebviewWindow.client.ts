import type { RouteNamedMap } from "vue-router/auto-routes";

import { Menu } from "@tauri-apps/api/menu";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Route path union accepted by child webview windows.
 */
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
  /** Remove native top menu bar for this child window. */
  hideNativeMenuBar?: boolean;
}

const CHILD_WINDOW_CREATION_TIMEOUT_MS = 10000;

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
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Failed to create child window "${options.label}" within ${String(CHILD_WINDOW_CREATION_TIMEOUT_MS)}ms`,
          ),
        );
      }, CHILD_WINDOW_CREATION_TIMEOUT_MS);

      void childWindow.once("tauri://created", () => {
        clearTimeout(timeout);
        resolve();
      });

      void childWindow.once("tauri://error", (event) => {
        clearTimeout(timeout);
        reject(
          new Error(`Failed to create child window: ${String(event.payload)}`),
        );
      });
    });

    if (options.hideNativeMenuBar) {
      const emptyWindowMenu = await Menu.new({ items: [] });
      await emptyWindowMenu.setAsWindowMenu(childWindow);
    }

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
