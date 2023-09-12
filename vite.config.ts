import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import { cjsInterop } from 'vite-plugin-cjs-interop'

export default defineConfig({
    plugins: [
        sveltekit(),
        cjsInterop({
            dependencies: ['exceljs'],
        }),
    ],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
})
