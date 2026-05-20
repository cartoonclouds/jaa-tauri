export interface ChildWebviewWindowOptions {
  label: string;
  url: string;
  title: string;
  width?: number;
  height?: number;
  center?: boolean;
  focus?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  skipTaskbar?: boolean;
  alwaysOnTop?: boolean;
}

export function useChildWebviewWindow() {
  async function openChildWebviewWindow(
    options: ChildWebviewWindowOptions,
  ): Promise<void> {
    const [{ getCurrentWindow }, { WebviewWindow }] = await Promise.all([
      import("@tauri-apps/api/window"),
      import("@tauri-apps/api/webviewWindow"),
    ]);

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
