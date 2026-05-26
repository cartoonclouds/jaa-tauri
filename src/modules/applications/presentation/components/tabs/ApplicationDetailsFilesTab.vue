<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import {
    getApplicationFileIcon,
    getFileNameFromPath,
  } from "@modules/applications/presentation/utils/applicationFileUtils";
  import { useDocument } from "@modules/documents";
  import { getDocumentMimeTypeFromFilePath } from "@modules/documents/utils/documentUtils";
  import { appLocalDataDir, join } from "@tauri-apps/api/path";
  import { openPath, revealItemInDir } from "@tauri-apps/plugin-opener";
  import { computed, ref, watch } from "vue";

  import { useFileSystem } from "@/composables/useFileSystem";

  /**
   * Linked file data displayed in the files tab.
   */
  interface LinkedFileItem {
    id: string;
    title: string;
    filePath: string;
    mimeType: string | null;
    relationType: string;
    createdAt: Date;
  }

  /**
   * Document service subset used by this tab.
   */
  interface DocumentLookupService {
    listByApplicationId(applicationId: string): Promise<
      {
        document: {
          id: string;
          title: string;
          filePath: string;
          mimeType: string | null;
          createdAt: Date;
        };
        relationType: string;
      }[]
    >;
    create(payload: {
      title: string;
      kind: string;
      filePath: string;
      mimeType: string;
      sizeBytes: number | null;
      checksum: string | null;
    }): Promise<string>;
    linkToApplication(
      applicationId: string,
      documentId: string,
      relationType?: string,
    ): Promise<void>;
  }

  /**
   * Defines props.
   */
  interface Props {
    application: Application | null;
  }

  const props = defineProps<Props>();

  const { service } = useDocument();
  const documentService = service as DocumentLookupService;
  const { sanitizeFileName, writeBrowserFile } = useFileSystem({
    ensureDirectoryExists: true,
  });

  const linkedFiles = ref<LinkedFileItem[]>([]);
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const isLoading = ref(false);
  const isUploading = ref(false);
  const errorMessage = ref<string | null>(null);

  const hasApplication = computed(() => Boolean(props.application?.id));

  /**
   * Loads linked files for a selected application.
   */
  async function loadFiles(applicationId: string): Promise<void> {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      const rows = await documentService.listByApplicationId(applicationId);
      linkedFiles.value = rows.map((row) => ({
        id: row.document.id,
        title: row.document.title,
        filePath: row.document.filePath,
        mimeType: row.document.mimeType,
        relationType: row.relationType,
        createdAt: row.document.createdAt,
      }));
    } catch (error: unknown) {
      linkedFiles.value = [];
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage.value = `Unable to load files: ${message}`;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Saves an uploaded file into the app local data directory.
   */
  async function saveUploadedFileToLocalData(
    file: File,
    applicationId: string,
  ): Promise<string> {
    const rootDirectory = await appLocalDataDir();
    const uploadsDirectory = await join(
      rootDirectory,
      "documents",
      "applications",
      applicationId,
    );
    const destinationPath = await join(
      uploadsDirectory,
      `${Date.now()}-${sanitizeFileName(file.name || "upload.bin")}`,
    );

    await writeBrowserFile(file, destinationPath, {
      create: true,
    });

    return destinationPath;
  }

  /**
   * Uploads and links a selected browser file to the current application.
   */
  async function uploadSelectedFile(file: File): Promise<void> {
    const applicationId = props.application?.id;
    if (!applicationId) {
      return;
    }

    isUploading.value = true;
    errorMessage.value = null;

    try {
      const storedPath = await saveUploadedFileToLocalData(file, applicationId);
      const title = file.name.trim() || getFileNameFromPath(storedPath);
      const mimeType =
        file.type.trim() ||
        getDocumentMimeTypeFromFilePath(file.name || storedPath);
      const documentId = await documentService.create({
        title,
        kind: "attachment",
        filePath: storedPath,
        mimeType,
        sizeBytes: Number.isFinite(file.size) ? file.size : null,
        checksum: null,
      });

      await documentService.linkToApplication(applicationId, documentId);
      await loadFiles(applicationId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage.value = `Unable to upload file: ${message}`;
    } finally {
      isUploading.value = false;
    }
  }

  /**
   * Opens the native file chooser.
   */
  function onUploadFileClick(): void {
    fileInputRef.value?.click();
  }

  /**
   * Handles file chooser changes and uploads the selected file.
   */
  async function onFileInputChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const selectedFile = input?.files?.[0] ?? null;

    if (input) {
      input.value = "";
    }

    if (!selectedFile) {
      return;
    }

    await uploadSelectedFile(selectedFile);
  }

  /**
   * Opens the selected file using the OS default program.
   */
  async function openLinkedFile(filePath: string): Promise<void> {
    try {
      await openPath(filePath);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage.value = `Unable to open file: ${message}`;
    }
  }

  /**
   * Reveals the selected file in the operating system file explorer.
   */
  async function revealLinkedFileInFolder(filePath: string): Promise<void> {
    try {
      await revealItemInDir(filePath);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage.value = `Unable to reveal file: ${message}`;
    }
  }

  watch(
    () => props.application?.id,
    async (applicationId) => {
      if (!applicationId) {
        linkedFiles.value = [];
        errorMessage.value = null;
        return;
      }

      await loadFiles(applicationId);
    },
    { immediate: true },
  );
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm text-surface-600">
        Upload files into app local storage and double-click any file to open
        it.
      </p>
      <Button
        type="button"
        size="small"
        :disabled="!hasApplication"
        :loading="isUploading"
        @click="onUploadFileClick"
      >
        <Icon name="heroicons:arrow-up-tray" class="h-4 w-4" />
        <span>Upload File</span>
      </Button>
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        @change="onFileInputChange"
      />
    </div>

    <Message v-if="!hasApplication" severity="info">
      Files are available after selecting an application.
    </Message>

    <Message v-else-if="errorMessage" severity="error">
      {{ errorMessage }}
    </Message>

    <Message v-else-if="isLoading" severity="info">Loading files...</Message>

    <Message v-else-if="linkedFiles.length === 0" severity="info">
      No files are associated with this application yet.
    </Message>

    <div v-else class="space-y-2">
      <button
        v-for="item in linkedFiles"
        :key="item.id"
        type="button"
        class="flex w-full items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3 text-left transition hover:border-primary-300 hover:bg-primary-50/40"
        @dblclick="openLinkedFile(item.filePath)"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-100"
        >
          <Icon
            :name="getApplicationFileIcon(item.filePath, item.mimeType)"
            class="h-5 w-5"
          />
        </span>

        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold text-surface-900">
            {{ item.title }}
          </span>
          <span class="block truncate text-xs text-surface-500">
            {{ item.filePath }}
          </span>
        </span>

        <Button
          type="button"
          size="small"
          outlined
          severity="secondary"
          class="shrink-0"
          @click.stop="revealLinkedFileInFolder(item.filePath)"
        >
          <Icon name="heroicons:folder-open" class="h-4 w-4" />
          <span>Reveal</span>
        </Button>

        <Tag :value="item.relationType" severity="secondary" />
      </button>
    </div>
  </div>
</template>
