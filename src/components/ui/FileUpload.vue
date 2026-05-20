<script setup>
  import { BaseDirectory, copyFile } from "@tauri-apps/plugin-fs";
  import { usePrimeVue } from "primevue/config";
  import { useToast } from "primevue/usetoast";
  import { ref } from "vue";

  const $primevue = usePrimeVue();
  const toast = useToast();

  const totalSize = ref(0);
  const totalSizePercent = ref(0);
  const files = ref([]);

  const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
    removeFileCallback(index);
    totalSize.value -= parseInt(formatSize(file.size));
    totalSizePercent.value = totalSize.value / 10;
  };

  const onClearTemplatingUpload = (clear) => {
    clear();
    totalSize.value = 0;
    totalSizePercent.value = 0;
  };

  const onSelectedFiles = (event) => {
    files.value = event.files;
    files.value.forEach((file) => {
      totalSize.value += parseInt(formatSize(file.size));
    });
  };

  const uploadEvent = (callback) => {
    totalSizePercent.value = totalSize.value / 10;
    callback();
  };

  const onTemplatedUpload = async () => {
    await copyFile(files, "", {
      fromPathBaseDir: BaseDirectory.AppLocalData,
      toPathBaseDir: BaseDirectory.Temp,
    });

    toast.add({
      severity: "info",
      summary: "Success",
      detail: "File Uploaded",
      life: 3000,
    });
  };

  const formatSize = (bytes) => {
    const k = 1024;
    const dm = 3;
    const sizes = $primevue.config.locale.fileSizeTypes;

    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  };
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
      @upload="onTemplatedUpload($event)"
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
              @click="clearCallback()"
            ></Button>
          </div>
          <ProgressBar
            :value="totalSizePercent"
            :show-value="false"
            class="md:w-20rem h-1 w-full md:ml-auto"
          >
            <span class="whitespace-nowrap">{{ totalSize }}B / 1Mb</span>
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
                    onRemoveTemplatingFile(file, removeFileCallback, index)
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
            class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color"
          />
          <p class="mt-6 mb-0">Drag and drop files to here to upload.</p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>
