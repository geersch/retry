import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import vitest from "@vitest/eslint-plugin";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
      globals: {
        // https://eslint.org/docs/latest/use/configure/language-options#specifying-globals
        // https://github.com/sindresorhus/globals
        ...globals.node,
        ...globals.es2022,
        ...globals.vitest
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }]
    }
  },
  {
    files: ["**/*.spec.ts"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/padding-around-all": "error",
      "vitest/no-alias-methods": "error",
      "vitest/no-focused-tests": "error",
      "vitest/prefer-comparison-matcher": "error",
      "vitest/prefer-to-have-length": "error",
      "vitest/prefer-to-be-object": "error",
      "vitest/consistent-test-filename": [
        "error",
        { pattern: ".*\\.spec\\.[tj]sx?$", allTestPattern: ".*\\.spec\\.[tj]sx?$" },
      ],
      "vitest/require-top-level-describe": "error",
      "vitest/no-standalone-expect": "error",
      "vitest/no-duplicate-hooks": "error",
    },
  }
);
