import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import globals from "globals";
import prettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import boundaries from "eslint-plugin-boundaries";

export default tseslint.config(
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
        project: "./tsconfig.json",
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
      boundaries,
    },

    settings: {
      "boundaries/elements": [
        {
          type: "module-public-api",
          pattern: "index.ts",
          mode: "file",
          basePattern: "src/modules/*",
          baseCapture: ["moduleName"],
        },
        {
          type: "module-domain",
          pattern: "domain/*",
          basePattern: "src/modules/*",
          baseCapture: ["moduleName"],
        },
        {
          type: "module-application",
          pattern: "application/*",
          basePattern: "src/modules/*",
          baseCapture: ["moduleName"],
        },
        {
          type: "module-presentation",
          pattern: "presentation/*",
          basePattern: "src/modules/*",
          baseCapture: ["moduleName"],
        },
        {
          type: "module-internal",
          pattern: "*",
          mode: "file",
          basePattern: "src/modules/*",
          baseCapture: ["moduleName"],
        },
        {
          type: "shared",
          pattern: "src/shared/*",
          mode: "full",
        },
        {
          type: "infrastructure",
          pattern: "src/infrastructure/*",
          mode: "full",
        },
      ],
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

      "@typescript-eslint/no-unused-vars": [
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
          ignorePatterns: ["NuxtLink", "NuxtPage", "ClientOnly"],
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
       | DDD and module boundaries
       |--------------------------------------------------------------------------
       */

      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          message:
            "Invalid DDD dependency: {{from.type}} cannot import {{to.type}} ({{dependency.source}})",
          rules: [
            {
              from: { type: "module-domain" },
              disallow: {
                to: {
                  type: [
                    "module-application",
                    "module-presentation",
                    "infrastructure",
                  ],
                },
              },
              message:
                "Domain layer must remain pure and cannot depend on application, presentation, or infrastructure.",
            },
            {
              from: { type: "module-application" },
              disallow: {
                to: {
                  type: ["module-presentation"],
                },
              },
              message:
                "Application layer cannot depend on presentation layer.",
            },
            {
              from: { type: "module-internal" },
              disallow: {
                to: {
                  type: [
                    "module-domain",
                    "module-application",
                    "module-presentation",
                    "module-internal",
                  ],
                  captured: {
                    moduleName: "!{{from.captured.moduleName}}",
                  },
                },
              },
              message:
                "Cross-module internals are forbidden. Import other modules through their public API (index.ts).",
            },
          ],
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

  prettier,
);
