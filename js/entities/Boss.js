class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss');
        // ... code khởi tạo khác ...
        
        this.thinhCooldown = 0;
        this.thinhInterval = 8000; // 8 giây một lần thả thính
    }

    update() {
        // ... code update hiện tại ...
        
        // Kiểm tra cooldown thả thính
        if (this.thinhCooldown <= 0) {
            this.thaThinh();
            this.thinhCooldown = this.thinhInterval;
        } else {
            this.thinhCooldown -= 16; // 16ms mỗi frame
        }
    }

    thaThinh() {
        // Tạo dải thính
        const thinh = this.scene.add.sprite(this.x, this.y, 'thinh_effect')
            .setScale(2);
        
        // Animation cho dải thính
        this.scene.tweens.add({
            targets: thinh,
            y: this.scene.game.config.height,
            alpha: { from: 0.8, to: 0 },
            angle: 360,
            duration: 2000,
            onComplete: () => thinh.destroy()
        });

        // Thêm physics cho dải thính
        this.scene.physics.add.existing(thinh);
        thinh.body.setVelocityY(300);

        // Collision với player
        this.scene.physics.add.overlap(thinh, this.scene.player, () => {
            if (!this.scene.player.isStunned) {
                this.scene.showThinhEffect();
            }
        });
    }
} 