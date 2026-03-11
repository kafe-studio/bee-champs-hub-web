// @ts-nocheck
import { fixupPluginRules } from '@eslint/compat'
import effectPlugin from '@codeforbreakfast/eslint-effect'
import functionalPlugin from 'eslint-plugin-functional'
import tseslint from 'typescript-eslint'

export default [
  // ── Global Ignores ─────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.wrangler/**',
      '**/.astro/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/*.d.ts',
      'apps/web/**',
      'scripts/**',
    ],
  },

  // ── Strict Effect TS (DB, Shared, API) ────────────────────────────
  {
    name: 'bee-champs/strict-effect',
    files: [
      'packages/db/src/**/*.ts',
      'packages/shared/src/**/*.ts',
      'apps/api/src/**/*.ts',
    ],
    ignores: ['**/*.test.ts', '**/*.spec.ts'],
    plugins: {
      effect: fixupPluginRules(effectPlugin),
      functional: functionalPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [
          './packages/*/tsconfig.json',
          './apps/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...effectPlugin.configs.recommended.rules,

      // Pure Effect Boundaries (runPromise only in runtime.ts)
      'effect/no-runPromise': 'error',
      'effect/no-runSync': 'error',

      // Safety
      'no-throw-literal': 'error',
      'effect/prefer-schema-validation-over-assertions': 'error',

      // Generators allowed (Effect.gen pattern)
      'effect/no-gen': 'off',

      // Logic: prefer Match over switch, ternary warn (ne error — jednoduche boolean checky)
      'effect/no-switch-statement': 'error',
      'effect/prefer-match-over-ternary': 'warn',

      // CF Workers pouzivaji nativni fetch — neni potreba @effect/platform
      'effect/prefer-effect-platform': 'off',

      // Eta-expansion: false positives na Response.text()/json() ktere vyzaduji this binding
      'effect/no-eta-expansion': 'warn',

      // Best Practices
      'effect/prefer-andThen': 'warn',
      'effect/no-unnecessary-pipe-wrapper': 'warn',
      'effect/no-intermediate-effect-variables': 'warn',

      // Functional
      'functional/no-let': 'warn',
      'functional/immutable-data': 'warn',
      'functional/prefer-readonly-type': 'warn',
    },
  },

  // ── Runtime boundary: Effect.runPromise povoleno ───────────────────
  {
    name: 'bee-champs/runtime-boundary',
    files: ['apps/api/src/runtime.ts'],
    rules: {
      'effect/no-runPromise': 'off',
    },
  },

  // ── DB schema: Drizzle, ne Effect kod ────────────────────────────
  {
    name: 'bee-champs/db-schema',
    files: ['packages/db/src/schema/**/*.ts'],
    rules: {
      'effect/no-eta-expansion': 'off',
    },
  },

]
