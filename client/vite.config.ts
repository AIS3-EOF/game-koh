import { defineConfig } from 'vite'
import replace from '@rollup/plugin-replace'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../share.env') })

export default defineConfig({
	plugins: [vue()],
	build: {
		rollupOptions: {
			plugins: [
				//  Toggle the booleans here to enable / disable Phaser 3 features:
				replace({
					'typeof CANVAS_RENDERER': "'true'",
					'typeof WEBGL_RENDERER': "'true'",
					'typeof EXPERIMENTAL': "'true'",
					'typeof PLUGIN_CAMERA3D': "'false'",
					'typeof PLUGIN_FBINSTANT': "'false'",
					'typeof FEATURE_SOUND': "'true'",
				}),
			],
		},
	},
	resolve: {
		preserveSymlinks: true,
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'~': path.resolve(__dirname, '../server/src'),
			parser: path.resolve(__dirname, '../parser'),
		},
	},
	server: {
		proxy: {
			'/api': {
				target: `http://localhost:${process.env.SERVER_PORT}`,
			},
			'/ws': {
				target: `ws://localhost:${process.env.WS_PORT}`,
				ws: true,
			},
		},
	},
})
