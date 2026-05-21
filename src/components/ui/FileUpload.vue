<script setup lang="ts">
  import { usePrimeVue } from "primevue/config";
  import { useToast } from "primevue/usetoast";
  import { ref } from "vue";

  import { useFileSystem } from "@/composables/useFileSystem";

  // 1 MB limit for demonstration purposes
  const MAX_FILE_SIZE_BYTES = 1000000;

  const $primevue = usePrimeVue();
  const toast = useToast();
  const { formatBytes, writeBrowserFilesToAppLocalData } = useFileSystem();

  const totalSize = ref(0);
  const totalSizePercent = ref(0);
  const selectedFiles = ref<UploadFile[]>([]);

  interface UploadFile extends File {
    objectURL?: string;
  }

  interface FileSelectEvent {
    files: UploadFile[];
  }

  type ClearCallback = () => void;
  type RemoveFileCallback = (index: number) => void;
  type UploadCallback = () => void;

  const updateTotalSizePercent = (): void => {
    totalSizePercent.value = Math.min(
      100,
      Math.round((totalSize.value / MAX_FILE_SIZE_BYTES) * 100),
    );
  };

  const onRemoveTemplatingFile = (
    file: UploadFile,
    removeFileCallback: RemoveFileCallback,
    index: number,
  ): void => {
    removeFileCallback(index);
    totalSize.value = Math.max(0, totalSize.value - file.size);
    updateTotalSizePercent();
  };

  const onClearTemplatingUpload = (clear: ClearCallback): void => {
    clear();
    selectedFiles.value = [];
    totalSize.value = 0;
    totalSizePercent.value = 0;
  };

  const onSelectedFiles = (event: FileSelectEvent): void => {
    selectedFiles.value = event.files;
    totalSize.value = selectedFiles.value.reduce(
      (size, file) => size + file.size,
      0,
    );
    updateTotalSizePercent();
  };

  const uploadEvent = (callback: UploadCallback): void => {
    updateTotalSizePercent();
    callback();
  };

  const onTemplatedUpload = async (): Promise<void> => {
    try {
      if (!selectedFiles.value.length) {
        return;
      }

      await writeBrowserFilesToAppLocalData(selectedFiles.value, "uploads", {
        writeOptions: {
          create: true,
        },
      });

      toast.add({
        severity: "info",
        summary: "Success",
        detail: `${String(selectedFiles.value.length)} file(s) uploaded`,
        life: 3000,
      });
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Upload failed",
        detail: error instanceof Error ? error.message : "Unknown error",
        life: 4000,
      });
    }
  };

  const formatSize = (bytes: number): string =>
    formatBytes(bytes, {
      decimalPlaces: 3,
      units: $primevue.config.locale?.fileSizeTypes,
    });
</script>

<template>
  <div class="card">
    <Toast />
    <FileUpload
      name="demo[]"
      url="/api/upload"
      :multiple="true"
      accept="image/*"
      :max-file-size="1000000"
      @upload="onTemplatedUpload"
      @select="onSelectedFiles"
    >
      <template
        #header="{ chooseCallback, uploadCallback, clearCallback, files }"
      >
        <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
          <div class="flex gap-2">
            <Button
              icon="pi pi-images"
              rounded
              variant="outlined"
              severity="secondary"
              @click="chooseCallback()"
            ></Button>
            <Button
              icon="pi pi-cloud-upload"
              rounded
              variant="outlined"
              severity="success"
              :disabled="!files || files.length === 0"
              @click="uploadEvent(uploadCallback)"
            ></Button>
            <Button
              icon="pi pi-times"
              rounded
              variant="outlined"
              severity="danger"
              :disabled="!files || files.length === 0"
              @click="onClearTemplatingUpload(clearCallback)"
            ></Button>
          </div>
          <ProgressBar
            :value="totalSizePercent"
            :show-value="false"
            class="md:w-20rem h-1 w-full md:ml-auto"
          >
            <span class="whitespace-nowrap"
              >{{ formatSize(totalSize) }} / 1 MB</span
            >
          </ProgressBar>
        </div>
      </template>
      <template
        #content="{
          files,
          uploadedFiles,
          removeUploadedFileCallback,
          removeFileCallback,
        }"
      >
        <div class="flex flex-col gap-8 pt-4">
          <div v-if="files.length > 0">
            <h5>Pending</h5>
            <div class="flex flex-wrap gap-4">
              <div
                v-for="(file, index) of files"
                :key="file.name + file.type + file.size"
                class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
              >
                <div>
                  <img
                    role="presentation"
                    :alt="file.name"
                    :src="file.objectURL"
                    width="100"
                    height="50"
                  />
                </div>
                <span
                  class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                  >{{ file.name }}</span
                >
                <div>{{ formatSize(file.size) }}</div>
                <Badge value="Pending" severity="warn" />
                <Button
                  icon="pi pi-times"
                  variant="outlined"
                  rounded
                  severity="danger"
                  @click="
                    onRemoveTemplatingFile(
                      file,
                      removeFileCallback,
                      Number(index),
                    )
                  "
                />
              </div>
            </div>
          </div>

          <div v-if="uploadedFiles.length > 0">
            <h5>Completed</h5>
            <div class="flex flex-wrap gap-4">
              <div
                v-for="(file, index) of uploadedFiles"
                :key="file.name + file.type + file.size"
                class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
              >
                <div>
                  <img
                    role="presentation"
                    :alt="file.name"
                    :src="file.objectURL"
                    width="100"
                    height="50"
                  />
                </div>
                <span
                  class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                  >{{ file.name }}</span
                >
                <div>{{ formatSize(file.size) }}</div>
                <Badge value="Completed" class="mt-4" severity="success" />
                <Button
                  icon="pi pi-times"
                  variant="outlined"
                  rounded
                  severity="danger"
                  @click="removeUploadedFileCallback(index)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #empty>
        <div class="flex items-center justify-center flex-col">
          <i
            class="pi pi-cloud-upload border-2! rounded-full! p-8! text-4xl! text-muted-color!"
          />
          <p class="mt-6 mb-0">Drag and drop files to here to upload.</p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>
