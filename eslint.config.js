import eslint from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const typedFiles = ['**/*.ts'];

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'src/generated/**', '*.tsbuildinfo'] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((config) => ({ ...config, files: typedFiles })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({ ...config, files: typedFiles })),
  {
    files: typedFiles,
    plugins: { 'import-x': importX },
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
    },
  },
  { files: ['*.config.cjs'], rules: { 'no-useless-escape': 'off' } },
  {
    files: ['src/**/*.module.ts'],
    rules: { '@typescript-eslint/no-extraneous-class': 'off' },
  },
  {
    files: ['src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/application/**'], message: 'Domain must not depend on application.' },
            {
              group: ['**/infrastructure/**'],
              message: 'Domain must not depend on infrastructure.',
            },
            { group: ['@nestjs/**'], message: 'Domain must remain framework-independent.' },
            {
              group: ['@prisma/**', '**/generated/prisma/**'],
              message: 'Domain must not depend on Prisma.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/*/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message: 'Application must not depend on infrastructure.',
            },
            {
              group: ['@prisma/**', '**/generated/prisma/**'],
              message: 'Application must not depend on Prisma.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
