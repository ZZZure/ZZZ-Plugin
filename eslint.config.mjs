import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import process from 'node:process'
import globals from 'globals'
import js from '@eslint/js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.git/**',
      'node_modules/**',
      'dist/**',
      'resources/**',
      'src/**/*.d.ts',
      'src/model/damage/**/模板.js',
      'src/model/damage/**/模板/*.js',
      'src/model/damage/map',
    ],
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...js.configs.recommended.languageOptions?.globals,
        ...globals.node,
        Bot: true,
        logger: true,
        segment: true,
        redis: true,
        plugin: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-trailing-spaces': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'prefer-const': 'warn',
      'no-trailing-spaces': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
]