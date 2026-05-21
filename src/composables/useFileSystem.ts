import type * as TauriFs from "@tauri-apps/plugin-fs";

import { ref } from "vue";

type TauriFsModule = typeof TauriFs;

let tauriFsModulePromise: Promise<TauriFsModule> | null = null;

/** Default human-readable units used by formatBytes. */
const DEFAULT_FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];

/** Normalize unknown throw values into a readable error message. */
function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Lazily resolves the Tauri fs module and guards against non-client / non-Tauri usage.
 */
async function resolveFileSystemModule(): Promise<TauriFsModule> {
  if (!import.meta.client) {
    throw new Error("Filesystem is only available on the client runtime.");
  }

  const { isTauri } = await import("@tauri-apps/api/core");
  if (!isTauri()) {
    throw new Error("Filesystem operations require a Tauri runtime.");
  }

  tauriFsModulePromise ??= import("@tauri-apps/plugin-fs");

  return tauriFsModulePromise;
}

/**
 * Filesystem composable for Tauri applications.
 *
 * Includes guarded wrappers around @tauri-apps/plugin-fs APIs and
 * convenience helpers for browser `File` objects and display formatting.
 */
export function useFileSystem() {
  const isSupported = ref(false);
  const isBusy = ref(false);
  const lastError = ref<string | null>(null);

  /**
   * Runs a filesystem operation with shared loading and error state handling.
   */
  async function runOperation<T>(
    operation: (fs: TauriFsModule) => Promise<T>,
  ): Promise<T> {
    isBusy.value = true;
    lastError.value = null;

    try {
      const fs = await resolveFileSystemModule();
      isSupported.value = true;
      return await operation(fs);
    } catch (error) {
      isSupported.value = false;
      lastError.value = toErrorMessage(error);
      throw error;
    } finally {
      isBusy.value = false;
    }
  }

  /** Clears the latest tracked filesystem error. */
  function clearError(): void {
    lastError.value = null;
  }

  /** Checks whether a file or directory exists. */
  function pathExists(
    path: string | URL,
    options?: TauriFs.ExistsOptions,
  ): Promise<boolean> {
    return runOperation((fs) => fs.exists(path, options));
  }

  /** Reads a text file. */
  function readText(
    path: string | URL,
    options?: TauriFs.ReadFileOptions,
  ): Promise<string> {
    return runOperation((fs) => fs.readTextFile(path, options));
  }

  /** Reads a binary file as bytes. */
  function readBinary(
    path: string | URL,
    options?: TauriFs.ReadFileOptions,
  ): Promise<Uint8Array<ArrayBuffer>> {
    return runOperation((fs) => fs.readFile(path, options));
  }

  /** Writes UTF-8 text to a path. */
  function writeText(
    path: string | URL,
    data: string,
    options?: TauriFs.WriteFileOptions,
  ): Promise<void> {
    return runOperation((fs) => fs.writeTextFile(path, data, options));
  }

  /** Writes binary data to a path. */
  function writeBinary(
    path: string | URL,
    data: Uint8Array | ReadableStream<Uint8Array>,
    options?: TauriFs.WriteFileOptions,
  ): Promise<void> {
    return runOperation((fs) => fs.writeFile(path, data, options));
  }

  /** Creates a directory (optionally recursively). */
  function ensureDirectory(
    path: string | URL,
    options?: TauriFs.MkdirOptions,
  ): Promise<void> {
    return runOperation((fs) => fs.mkdir(path, options));
  }

  /** Removes a file or directory. */
  function removePath(
    path: string | URL,
    options?: TauriFs.RemoveOptions,
  ): Promise<void> {
    return runOperation((fs) => fs.remove(path, options));
  }

  /** Copies a file from one path to another. */
  function copyPath(
    fromPath: string | URL,
    toPath: string | URL,
    options?: TauriFs.CopyFileOptions,
  ): Promise<void> {
    return runOperation((fs) => fs.copyFile(fromPath, toPath, options));
  }

  /**
   * Writes a browser File to a destination path.
   * Use when base directory is already included in options.
   */
  async function writeBrowserFile(
    file: File,
    destinationPath: string | URL,
    options?: TauriFs.WriteFileOptions,
  ): Promise<void> {
    await runOperation(async (fs) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await fs.writeFile(destinationPath, bytes, options);
    });
  }

  /**
   * Writes a browser File to AppLocalData.
   * This enforces baseDir = AppLocalData for safe app-owned storage.
   */
  async function writeBrowserFileToAppLocalData(
    file: File,
    destinationPath: string | URL,
    options?: Omit<TauriFs.WriteFileOptions, "baseDir">,
  ): Promise<void> {
    await runOperation(async (fs) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await fs.writeFile(destinationPath, bytes, {
        ...options,
        baseDir: fs.BaseDirectory.AppLocalData,
      });
    });
  }

  /** Replaces unsupported filename characters with underscores. */
  function sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  /**
   * Formats bytes to a human-readable string (e.g. 1.234 MB).
   */
  function formatBytes(
    bytes: number,
    options?: {
      decimalPlaces?: number;
      units?: readonly string[];
    },
  ): string {
    const decimalPlaces = options?.decimalPlaces ?? 3;
    const units =
      options?.units && options.units.length > 0
        ? options.units
        : DEFAULT_FILE_SIZE_UNITS;

    if (bytes === 0) {
      return `0 ${units[0] ?? "B"}`;
    }

    const k = 1024;
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(k));
    const safeUnitIndex = Math.min(unitIndex, units.length - 1);
    const formattedSize = (bytes / Math.pow(k, safeUnitIndex)).toFixed(
      decimalPlaces,
    );

    return `${formattedSize} ${units[safeUnitIndex] ?? "B"}`;
  }

  /**
   * Writes multiple browser Files into AppLocalData under a single directory.
   * Returns the saved relative paths.
   */
  async function writeBrowserFilesToAppLocalData(
    files: readonly File[],
    directory: string,
    options?: {
      fileNamePrefix?: string;
      writeOptions?: Omit<TauriFs.WriteFileOptions, "baseDir">;
    },
  ): Promise<string[]> {
    const savedPaths: string[] = [];
    const fileNamePrefix = options?.fileNamePrefix ?? String(Date.now());

    await ensureDirectory(directory, { recursive: true });

    for (const [index, file] of files.entries()) {
      const safeName = sanitizeFileName(file.name);
      const destinationPath = `${directory}/${fileNamePrefix}-${String(index)}-${safeName}`;

      await writeBrowserFileToAppLocalData(file, destinationPath, {
        create: true,
        ...options?.writeOptions,
      });

      savedPaths.push(destinationPath);
    }

    return savedPaths;
  }

  return {
    clearError,
    copyPath,
    ensureDirectory,
    isBusy,
    isSupported,
    lastError,
    pathExists,
    readBinary,
    readText,
    removePath,
    writeBinary,
    writeBrowserFile,
    writeBrowserFilesToAppLocalData,
    writeBrowserFileToAppLocalData,
    writeText,
    sanitizeFileName,
    formatBytes,
  };
}
