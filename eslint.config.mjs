import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/src-tauri/target/**",
      "**/my rnd/**",
      "**/._*",
    ],
  },
  // TypeScript files config
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // JavaScript files config
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        __dirname: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
        TextDecoder: "readonly",
        TextEncoder: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        alert: "readonly",
        // for tests
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
    },
  },
];
