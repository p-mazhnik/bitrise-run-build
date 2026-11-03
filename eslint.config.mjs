import js from '@eslint/js'
import github from 'eslint-plugin-github'
import jest from 'eslint-plugin-jest'
import prettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'lib/**',
      'coverage/**',
      '__tests__/runner/**'
    ]
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['**/*.ts'],
    extends: [
      ...tseslint.configs.recommended,
      github.getFlatConfigs().recommended
    ],
    languageOptions: {
      parserOptions: {
        project: './.github/linters/tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      camelcase: 'off',
      'no-console': 'off',
      'eslint-comments/no-use': 'off',
      'eslint-comments/no-unused-disable': 'off',
      'i18n-text/no-en': 'off',
      'import/no-namespace': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public' }
      ],
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-function-type': 'warn',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/unbound-method': 'error'
    }
  },
  {
    files: ['__tests__/**/*.ts'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error'
    }
  },
  prettier
)
