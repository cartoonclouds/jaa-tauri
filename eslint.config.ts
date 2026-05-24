import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
import vue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default defineConfig(
  {
    ignores: [
      ".nuxt/**",
      ".output/**",
      ".nitro/**",
      ".turbo/**",
      ".idea/**",
      ".vscode/**",

      "dist/**",
      "coverage/**",

      "node_modules/**",

      "*.min.js",

      "scripts/dev-clear.mjs",

      "src-tauri/target/**",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  ...vue.configs["flat/recommended"],

  {
    files: ["**/*.{ts,tsx,vue}"],

    languageOptions: {
      parser: vueParser,

      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.eslint.json",
        extraFileExtensions: [".vue"],
        ecmaVersion: "latest",
        sourceType: "module",
      },

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      vue,
      perfectionist,
      "unused-imports": unusedImports,
    },

    rules: {
      /*
       |--------------------------------------------------------------------------
       | General TypeScript
       |--------------------------------------------------------------------------
       */

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends",
        },
      ],

      "@typescript-eslint/no-unused-vars": "off",

      "unused-imports/no-unused-imports": "error",

      "unused-imports/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-floating-promises": "error",

      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],

      "@typescript-eslint/explicit-function-return-type": "off",

      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/services/[A-Z]*Service"],
              message:
                "Do not import service classes directly. Import the associated use*Service composable instead.",
            },
          ],
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | Vue SFC consistency
       |--------------------------------------------------------------------------
       */

      "vue/block-order": [
        "error",
        {
          order: ["script", "template", "style"],
        },
      ],

      "vue/component-api-style": ["error", ["script-setup"]],

      "vue/define-macros-order": [
        "error",
        {
          order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"],
        },
      ],

      "vue/padding-line-between-blocks": ["error", "always"],

      "vue/multi-word-component-names": "off",

      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],

      "vue/component-name-in-template-casing": ["error", "PascalCase"],

      "vue/define-emits-declaration": ["error", "type-based"],

      "vue/define-props-declaration": ["error", "type-based"],

      "vue/no-undef-components": [
        "error",
        {
          // Nuxt and PrimeVue register PascalCase components globally.
          ignorePatterns: [
            "NuxtLink",
            "NuxtPage",
            "ClientOnly",
            "^[A-Z][A-Za-z0-9]*$",
          ],
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | Import sorting
       |--------------------------------------------------------------------------
       */

      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
          groups: [
            "type",

            ["builtin", "external"],

            "internal",

            ["parent", "sibling", "index"],

            "unknown",
          ],
        },
      ],

      "perfectionist/sort-named-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
        },
      ],

      "perfectionist/sort-exports": [
        "error",
        {
          type: "natural",
          order: "asc",
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | General code quality
       |--------------------------------------------------------------------------
       */

      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],

      "no-debugger": "warn",

      eqeqeq: ["error", "always"],

      curly: ["error", "all"],
    },
  },

  {
    files: ["**/*.spec.ts", "**/*.test.ts"],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    files: ["src/modules/**/services/use*Service.ts"],

    rules: {
      "no-restricted-imports": "off",
    },
  },

  prettier,
);
