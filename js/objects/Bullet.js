class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    update() {
        // Destroy bullet if it's out of bounds
        if (this.y < -50 || this.y > this.scene.game.config.height + 50 ||
            this.x < -50 || this.x > this.scene.game.config.width + 50) {
            this.destroy();
        }
    }
}
