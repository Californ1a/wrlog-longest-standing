import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src',
				import.meta.url)),
		}
	},
	base: './',
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: true,
	},
	optimizeDeps: {
		exclude: [
			'axios',
			'duration-js',
			'humanize-duration',
		],
	},
	define: {
		__BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
	}
});
