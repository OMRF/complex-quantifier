import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        include: ['exceljs'],
    },
	build: {
		commonjsOptions: {
		  include: [/exceljs/, /node_modules/],
		},
	  },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
})
