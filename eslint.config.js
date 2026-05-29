import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig([
  {
    files: ['**/*.{ts,js}'],
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
])
