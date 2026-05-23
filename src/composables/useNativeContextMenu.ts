import { isTauri } from "@tauri-apps/api/core";
import { PhysicalPosition } from "@tauri-apps/api/dpi";
import { Menu } from "@tauri-apps/api/menu";
import { message } from "@tauri-apps/plugin-dialog";

/**
 * Registers a global native context menu for Tauri desktop windows.
 * Returns a cleanup function that removes listeners and frees menu resources.
 */
export async function setupNativeContextMenu(): Promise<
  () => void | Promise<void>
> {
  if (!import.meta.client) {
    return () => undefined;
  }

  if (!isTauri()) {
    return () => undefined;
  }

  const contextMenu = await Menu.new({
    id: "main-context-menu",
    items: [
      {
        id: "about-app",
        text: "About This App",
        action: () => {
          void message("Apply-Flow\nNuxt + Tauri desktop app", {
            title: "About",
            kind: "info",
          });
        },
      },
      {
        id: "open-homepage",
        text: "Open Project Website",
        action: () => {
          window.open("https://nuxt.com", "_blank", "noopener,noreferrer");
        },
      },
      {
        id: "tools-submenu",
        text: "Quick Tools",
        items: [
          {
            id: "copy-page-title",
            text: "Copy Page Title",
            action: async () => {
              try {
                await navigator.clipboard.writeText(document.title);
              } catch {
                void message("Clipboard write is not available.", {
                  title: "Copy Failed",
                  kind: "warning",
                });
              }
            },
          },
          {
            id: "show-location",
            text: "Show Current URL",
            action: () => {
              void message(window.location.href, {
                title: "Current URL",
                kind: "info",
              });
            },
          },
        ],
      },
      { item: "Separator" },
      {
        id: "reload",
        text: "Reload",
        action: () => {
          window.location.reload();
        },
      },
      { item: "Separator" },
      { item: "Copy" },
      { item: "Cut" },
      { item: "Paste" },
      { item: "SelectAll" },
    ],
  });

  const onContextMenu = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    await contextMenu.popup(new PhysicalPosition(event.clientX, event.clientY));
  };

  window.addEventListener("contextmenu", onContextMenu);

  return async () => {
    window.removeEventListener("contextmenu", onContextMenu);
    await contextMenu.close();
  };
}



