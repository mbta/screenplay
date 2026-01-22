import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default defineConfig([
  globalIgnores(["coverage/"]),
  {
    settings: {
      react: { version: "detect" },
    },
    files: ["{js,test}/**/*.{ts,tsx}"],
    extends: [
      eslint.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    rules: {
      eqeqeq: "error",
      "@typescript-eslint/no-explicit-any": "off",
      "react/display-name": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/no-danger": "error",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/click-events-have-key-events": "off",
    },
  },
]);
