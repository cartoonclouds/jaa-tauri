import { logError } from "@infra/logging/tauriLog.client";
import { useGlobalSearchDialog } from "@modules/search";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";
import { appLogDir, join } from "@tauri-apps/api/path";
import { readDir, stat } from "@tauri-apps/plugin-fs";
import { openPath, revealItemInDir } from "@tauri-apps/plugin-opener";
import { defineNuxtPlugin } from "nuxt/app";

import { useCompaniesDialog } from "@/composables/useCompaniesDialog";
import { useContactsDialog } from "@/composables/useContactsDialog";
import { useOnboardingNavigation } from "@/composables/useOnboardingNavigation.client";
import { useSettingsDialog } from "@/composables/useSettingsDialog";

/**
 * Installs a native app menubar with Settings navigation and app exit actions.
 */
// fallow-ignore-next-line complexity
export default defineNuxtPlugin((nuxtApp) => {
  // fallow-ignore-next-line complexity
  nuxtApp.hook("app:mounted", async () => {
    if (!import.meta.client || !isTauri()) {
      return;
    }

    const { openCompaniesDialog } = useCompaniesDialog();
    const { openContactsDialog } = useContactsDialog();
    const { openOnboarding } = useOnboardingNavigation();
    const { openSettingsDialog } = useSettingsDialog();
    const { openGlobalSearchDialog } = useGlobalSearchDialog();

    async function resolveLatestLogFilePath(): Promise<string | null> {
      const logDirectory = await appLogDir();
      const entries = await readDir(logDirectory);
      const logFiles = entries.filter(
        (entry) => entry.isFile && entry.name.toLowerCase().endsWith(".log"),
      );

      if (logFiles.length === 0) {
        return null;
      }

      const filesWithMetadataResults = await Promise.allSettled(
        logFiles.map(async (entry) => {
          const filePath = await join(logDirectory, entry.name);
          const fileInfo = await stat(filePath);

          return {
            filePath,
            modifiedAt:
              fileInfo.mtime?.getTime() ?? fileInfo.birthtime?.getTime() ?? 0,
          };
        }),
      );

      const filesWithMetadata = filesWithMetadataResults
        .map((result) => {
          if (result.status === "rejected") {
            logError("Failed to read log file metadata:", result.reason);
            return null;
          }

          return result.value;
        })
        .filter(
          (
            entry,
          ): entry is {
            filePath: string;
            modifiedAt: number;
          } => entry !== null,
        );

      if (filesWithMetadata.length === 0) {
        return null;
      }

      filesWithMetadata.sort(
        (left, right) => right.modifiedAt - left.modifiedAt,
      );

      return filesWithMetadata[0]?.filePath ?? null;
    }

    // fallow-ignore-next-line complexity
    async function openLatestLogFile(): Promise<void> {
      try {
        const logFilePath = await resolveLatestLogFilePath();
        if (!logFilePath) {
          logError("No log files were found in the Tauri log directory.");
          return;
        }

        try {
          await openPath(logFilePath);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          if (!message.includes("Not allowed to open path")) {
            throw error;
          }

          await revealItemInDir(logFilePath);
        }
      } catch (error) {
        logError("Failed to open latest log file:", error);
      }
    }

    async function openLogDirectory(): Promise<void> {
      try {
        const logFilePath = await resolveLatestLogFilePath();
        if (!logFilePath) {
          logError("No log files were found in the Tauri log directory.");
          return;
        }

        await revealItemInDir(logFilePath);
      } catch (error) {
        logError("Failed to open log directory:", error);
      }
    }

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

      const searchItem = await MenuItem.new({
        id: "open-search",
        text: "Search",
        accelerator: "CmdOrCtrl+F",
        action: () => {
          openGlobalSearchDialog();
        },
      });

      const onboardingItem = await MenuItem.new({
        id: "open-onboarding",
        text: "Onboarding",
        action: () => {
          void openOnboarding();
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
        items: [
          companiesItem,
          contactsItem,
          searchItem,
          settingsItem,
          onboardingItem,
          exitItem,
        ],
      });

      const menuItems = [appSubmenu];

      if (import.meta.dev) {
        const openLatestLogFileItem = await MenuItem.new({
          id: "open-latest-log-file",
          text: "Open Latest Log File",
          action: () => {
            void openLatestLogFile();
          },
        });

        const openLogDirectoryItem = await MenuItem.new({
          id: "open-log-directory",
          text: "Open Log Directory",
          action: () => {
            void openLogDirectory();
          },
        });

        const debugSubmenu = await Submenu.new({
          text: "Debug",
          items: [openLatestLogFileItem, openLogDirectoryItem],
        });

        menuItems.push(debugSubmenu);
      }

      const appMenu = await Menu.new({
        items: menuItems,
      });

      await appMenu.setAsAppMenu();
    } catch (error) {
      logError("Failed to initialize native app menubar:", error);
    }
  });
});
