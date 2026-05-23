import { logError } from "@infra/logging/tauriLog.client";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";
import { defineNuxtPlugin } from "nuxt/app";

import { useSettingsModal } from "@/composables/useSettingsModal";

/**
 * Installs a native app menubar with Settings navigation and app exit actions.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", async () => {
    if (!import.meta.client || !isTauri()) {
      return;
    }

    const { openSettingsModal } = useSettingsModal();

    try {
      const settingsItem = await MenuItem.new({
        id: "open-settings",
        text: "Settings",
        accelerator: "CmdOrCtrl+,",
        action: () => {
          openSettingsModal();
        },
      });

      const exitItem = await MenuItem.new({
        id: "exit-app",
        text: "Exit",
        accelerator: "CmdOrCtrl+Q",
        action: () => {
          void invoke("exit_app");
        },
      });

      const appSubmenu = await Submenu.new({
        text: "App",
        items: [settingsItem, exitItem],
      });

      const appMenu = await Menu.new({
        items: [appSubmenu],
      });

      await appMenu.setAsAppMenu();
    } catch (error) {
      logError("Failed to initialize native app menubar:", error);
    }
  });
});
