import Phaser from 'phaser'
import PhaserRaycaster from 'phaser-raycaster'

export default {
	type: Phaser.AUTO,
	parent: 'game',
	backgroundColor: '#000000',
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
