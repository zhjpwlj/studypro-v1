import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import reactRefresh from "eslint-plugin-react-refresh";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
      plugins: {
          'react-refresh': reactRefresh,
          'react-hooks': reactHooks,
      },
      rules: {
          'react-refresh/only-export-components': 'warn',
          'no-unused-vars': 'off',
          '@typescript-eslint/no-unused-vars': 'warn',
          '@typescript-eslint/no-explicit-any': 'warn',
          '@typescript-eslint/explicit-function-return-type': 'warn',
          'react-hooks/rules-of-hooks': 'error',
          'react-hooks/exhaustive-deps': 'warn',
          'react/prop-types': 'off',
          'react/react-in-jsx-scope': 'off'
      }
  },
  {ignores: ["dist", "node_modules", "vite.config.ts", "postcss.config.js", "tailwind.config.js", ".eslintrc.cjs", "eslint.config.js"]},
];
