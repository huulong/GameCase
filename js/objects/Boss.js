class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.2);
        this.health = 500;
        this.active = false;
        this.attackPattern = 0;
        this.nextShootTime = 0;
        this.shootDelay = 2000; 
        
        // Health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    activate() {
        this.active = true;
        this.setVisible(true);
        this.y = 100;
        
        // Di chuyển qua lại
        this.scene.tweens.add({
            targets: this,
            x: { from: 100, to: this.scene.game.config.width - 100 },
            duration: 3000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    shoot() {
        if (!this.active) return;

        const currentTime = this.scene.time.now;
        if (currentTime < this.nextShootTime) return;

        this.nextShootTime = currentTime + this.shootDelay;

        const speed = 300;

        switch(this.attackPattern) {
            case 0: // Spread shot
                for (let i = -2; i <= 2; i++) {
                    const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
                    bullet.setScale(0.08);
                    const angle = Phaser.Math.DegToRad(90 + i * 30);
                    
                    // Set velocity cho bullet body
                    bullet.body.velocity.x = Math.cos(angle) * speed;
                    bullet.body.velocity.y = Math.sin(angle) * speed;
                    
                    bullet.setRotation(angle);
                    this.scene.bossBullets.add(bullet);
                }
                break;

            case 1: // Circular shot
                for (let i = 0; i < 8; i++) {
                    const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
                    bullet.setScale(0.08);
                    const angle = Phaser.Math.DegToRad(i * 45);
                    
                    // Set velocity cho bullet body
                    bullet.body.velocity.x = Math.cos(angle) * speed;
                    bullet.body.velocity.y = Math.sin(angle) * speed;
                    
                    bullet.setRotation(angle);
                    this.scene.bossBullets.add(bullet);
                }
                break;

            case 2: // Aimed shot
                const player = this.scene.player;
                if (player && player.active) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    
                    for (let i = -1; i <= 1; i++) {
                        const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
                        bullet.setScale(0.08);
                        const angle = Math.atan2(dy, dx) + i * Math.PI/12;
                        
                        // Set velocity cho bullet body
                        bullet.body.velocity.x = Math.cos(angle) * speed;
                        bullet.body.velocity.y = Math.sin(angle) * speed;
                        
                        bullet.setRotation(angle);
                        this.scene.bossBullets.add(bullet);
                    }
                }
                break;
        }

        // Đổi pattern sau mỗi lần bắn
        this.attackPattern = Phaser.Math.Between(0, 2);
    }

    hit() {
        this.health -= 10;
        this.updateHealthBar();
        return this.health <= 0;
    }

    updateHealthBar() {
        this.healthBar.clear();
        
        // Background (red)
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(this.x - 30, this.y - 30, 60, 5);
        
        // Health (green)
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(
            this.x - 30,
            this.y - 30,
            60 * (this.health / 500),
            5
        );
    }

    update() {
        if (this.active) {
            this.updateHealthBar();
            this.shoot();
        }
    }

    destroy() {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        super.destroy();
    }
}
