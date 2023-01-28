import Phaser from 'phaser';

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('logo', 'assets/phaser3-logo.png');
  }

  create() {
    // TESTING start
    const logo = this.add.image(400, 70, 'logo');

    this.tweens.add({
      targets: logo,
      y: 350,
      duration: 1500,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
    // TESTING end

    // render the initial map
  }

  update(time: number, delta: number): void {
    // pop from event queue, then handle
    const event = window.events.shift();
    if(event !== undefined){
      console.log("update", event);
      // update all player

      // update map
    }
  }
}
