import { defineConfig } from 'vite'
import replace from '@rollup/plugin-replace'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()
dotenv.config({ path: path.resolve(__dirname, '../share.env') })

export default defineConfig({
	plugins: [vue(), basicSsl()],
	build: {
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'index.html'),
				game: path.resolve(__dirname, 'game.html'),
			},
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
		host: '0.0.0.0',
		port: Number(process.env.CLIENT_PORT ?? 3000),
		https: true,
		headers: {
			'Content-Security-Policy': [
				"default-src 'self'",
				"script-src 'self' 'unsafe-eval'",
				"style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css",
				`connect-src 'self' ${process.env.VITE_WS_SERVER}`,
				"img-src 'self' data: blob:",
			].join('; '),
		},
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
