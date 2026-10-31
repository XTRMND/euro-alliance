import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    // CommonJS config files (Lighthouse CI loads them with require).
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'next-env.d.ts',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    '.lighthouseci/**',
    'lighthouse-reports/**',
    'docs/reference/**',
  ]),
])
