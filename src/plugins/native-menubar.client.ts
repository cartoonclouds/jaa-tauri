import { logError } from "@infra/logging/tauriLog.client";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";
import { defineNuxtPlugin } from "nuxt/app";

import { useCompaniesDialog } from "@/composables/useCompaniesDialog";
import { useContactsDialog } from "@/composables/useContactsDialog";
import { useSettingsDialog } from "@/composables/useSettingsDialog";

/**
 * Installs a native app menubar with Settings navigation and app exit actions.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", async () => {
    if (!import.meta.client || !isTauri()) {
      return;
    }

    const { openCompaniesDialog } = useCompaniesDialog();
    const { openContactsDialog } = useContactsDialog();
    const { openSettingsDialog } = useSettingsDialog();

    try {
      const companiesItem = await MenuItem.new({
        id: "open-companies",
        text: "Companies",
        action: () => {
          openCompaniesDialog();
        },
      });

      const contactsItem = await MenuItem.new({
        id: "open-contacts",
        text: "Contacts",
        action: () => {
          openContactsDialog();
        },
      });

      const settingsItem = await MenuItem.new({
        id: "open-settings",
        text: "Settings",
        accelerator: "CmdOrCtrl+,",
        action: () => {
          openSettingsDialog();
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
        items: [companiesItem, contactsItem, settingsItem, exitItem],
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
