<script setup lang="ts">
  import { toErrorMessage } from "@shared/utils/error";
  import { usePrimeVue } from "primevue/config";
  import { useToast } from "primevue/usetoast";
  import { ref } from "vue";

  import { useFileSystem } from "@/composables/useFileSystem";

  interface FileUploadProps {
    uploadPath?: string;
  }

  const props = withDefaults(defineProps<FileUploadProps>(), {
    uploadPath: "uploads",
  });

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

  const updateTotalSizePercent = (files: UploadFile[]): void => {
    totalSize.value = files.reduce((size, file) => size + file.size, 0);

    if (!totalSize.value) {
      totalSizePercent.value = 0;
      return;
    }

    // Unlimited size mode: selection is always considered within bounds.
    totalSizePercent.value = 100;
  };

  const onRemoveTemplatingFile = (
    removeFileCallback: RemoveFileCallback,
    index: number,
  ): void => {
    removeFileCallback(index);

    const remainingFiles = selectedFiles.value.filter(
      (_, currentIndex) => currentIndex !== index,
    );
    selectedFiles.value = remainingFiles;
    updateTotalSizePercent(remainingFiles);
  };

  const onClearTemplatingUpload = (clear: ClearCallback): void => {
    clear();
    selectedFiles.value = [];
    totalSize.value = 0;
    totalSizePercent.value = 0;
  };

  const onSelectedFiles = (event: FileSelectEvent): void => {
    selectedFiles.value = event.files;
    updateTotalSizePercent(selectedFiles.value);
  };

  const uploadEvent = (callback: UploadCallback): void => {
    updateTotalSizePercent(selectedFiles.value);
    callback();
  };

  const onTemplatedUpload = async (): Promise<void> => {
    try {
      if (!selectedFiles.value.length) {
        return;
      }

      await writeBrowserFilesToAppLocalData(
        selectedFiles.value,
        props.uploadPath,
        {
          writeOptions: {
            create: true,
          },
        },
      );

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
        detail: toErrorMessage(error),
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
      url="/upload"
      :multiple="true"
      accept="image/*"
      @upload="onTemplatedUpload"
      @select="onSelectedFiles"
    >
      <template
        #header="{ chooseCallback, uploadCallback, clearCallback, files }"
      >
        <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
          <div class="flex gap-2">
            <Button
              rounded
              variant="outlined"
              severity="secondary"
              @click="chooseCallback()"
            >
              <Icon name="heroicons:photo" class="h-4 w-4" />
            </Button>
            <Button
              rounded
              variant="outlined"
              severity="success"
              :disabled="!files || files.length === 0"
              @click="uploadEvent(uploadCallback)"
            >
              <Icon name="heroicons:cloud-arrow-up" class="h-4 w-4" />
            </Button>
            <Button
              rounded
              variant="outlined"
              severity="danger"
              :disabled="!files || files.length === 0"
              @click="onClearTemplatingUpload(clearCallback)"
            >
              <Icon name="heroicons:x-mark" class="h-4 w-4" />
            </Button>
          </div>
          <ProgressBar
            :value="totalSizePercent"
            :show-value="false"
            class="md:w-20rem h-1 w-full md:ml-auto"
          >
            <span class="whitespace-nowrap">{{ formatSize(totalSize) }}</span>
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
                  variant="outlined"
                  rounded
                  severity="danger"
                  @click="
                    onRemoveTemplatingFile(removeFileCallback, Number(index))
                  "
                >
                  <Icon name="heroicons:x-mark" class="h-4 w-4" />
                </Button>
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
                  variant="outlined"
                  rounded
                  severity="danger"
                  @click="removeUploadedFileCallback(index)"
                >
                  <Icon name="heroicons:x-mark" class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #empty>
        <div class="flex items-center justify-center flex-col">
          <div class="border-2! rounded-full! p-8! text-muted-color!">
            <Icon name="heroicons:cloud-arrow-up" class="h-10 w-10" />
          </div>
          <p class="mt-6 mb-0">Drag and drop files to here to upload.</p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>
