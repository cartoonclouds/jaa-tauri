<script setup lang="ts">
  import "quill/dist/quill.snow.css";
  import { marked } from "marked";
  import { ref, watch } from "vue";

  interface Props {
    modelValue: string;
    editorStyle?: string;
    placeholder?: string;
    readonly?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    editorStyle: "height: 14rem",
    placeholder: "Write notes in Markdown...",
    readonly: false,
  });

  const emit = defineEmits<{
    "update:modelValue": [value: string];
  }>();

  const htmlValue = ref("");
  let syncingFromModel = false;

  function markdownToHtml(markdown: string): string {
    return marked.parse(markdown || "", { async: false });
  }

  function htmlToMarkdown(html: string): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(html || "", "text/html");

    function renderNode(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? "";
      }

      if (!(node instanceof HTMLElement)) {
        return "";
      }

      const content = Array.from(node.childNodes)
        .map((childNode) => renderNode(childNode))
        .join("");

      switch (node.tagName.toLowerCase()) {
        case "strong":
        case "b":
          return `**${content}**`;
        case "em":
        case "i":
          return `*${content}*`;
        case "code":
          return `\`${content}\``;
        case "h1":
          return `# ${content}\n\n`;
        case "h2":
          return `## ${content}\n\n`;
        case "h3":
          return `### ${content}\n\n`;
        case "h4":
          return `#### ${content}\n\n`;
        case "h5":
          return `##### ${content}\n\n`;
        case "h6":
          return `###### ${content}\n\n`;
        case "a": {
          const href = node.getAttribute("href")?.trim();
          return href ? `[${content}](${href})` : content;
        }
        case "li":
          return `- ${content}\n`;
        case "ul":
        case "ol":
          return `${content}\n`;
        case "blockquote":
          return `> ${content}\n\n`;
        case "p":
          return `${content}\n\n`;
        case "br":
          return "\n";
        default:
          return content;
      }
    }

    return Array.from(document.body.childNodes)
      .map((node) => renderNode(node))
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  watch(
    () => props.modelValue,
    (nextMarkdown) => {
      const nextHtml = markdownToHtml(nextMarkdown);

      if (nextHtml === htmlValue.value) {
        return;
      }

      syncingFromModel = true;
      htmlValue.value = nextHtml;
      syncingFromModel = false;
    },
    { immediate: true },
  );

  watch(htmlValue, (nextHtml) => {
    if (syncingFromModel) {
      return;
    }

    const nextMarkdown = htmlToMarkdown(nextHtml);
    if (nextMarkdown !== props.modelValue) {
      emit("update:modelValue", nextMarkdown);
    }
  });
</script>

<template>
  <Editor
    v-model="htmlValue"
    :editor-style="editorStyle"
    :placeholder="placeholder"
    :readonly="readonly"
  />
</template>
