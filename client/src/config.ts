import Phaser from 'phaser'
import PhaserRaycaster from 'phaser-raycaster'
import GameScene from '@/scenes/Game'

export default {
	type: Phaser.AUTO,
	parent: 'game',
	backgroundColor: '#000000',
	scene: [
		GameScene
	],
	scale: {
		width: window.innerWidth,
		height: window.innerHeight,
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }
		}
	},
    plugins: {
        scene: [
            {
                key: 'PhaserRaycaster',
                plugin: PhaserRaycaster,
                mapping: 'raycasterPlugin'
            }
        ]
    }
}
