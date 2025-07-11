import eslint from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  globalIgnores(['dist/**/*'], 'Ignore Build Directory'),
  globalIgnores(['node_modules/**/*'], 'Ignore Node Modules'),
  {
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: true,
        node: true,
        es6: true,
        jest: true,
      },
    },
    settings: {
      react: {
        pragma: 'React',
        version: 'detect',
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'simple-import-sort/imports': 'error', // Updated from simple-import-sort/sort
      'prettier/prettier': ['error'],
      'linebreak-style': 0,
      camelcase: 'off',
      // @typescript-eslint/camelcase is deprecated, replaced with naming-convention
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'property',
          format: null, // This allows any format for destructured properties
        },
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 0,
    },
  },
];
