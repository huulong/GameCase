class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.05);
        this.speed = 100;
        this.body.velocity.y = this.speed;
        
        this.nextShootTime = scene.time.now + Phaser.Math.Between(1000, 3000);
        this.shootDelay = 2000;
    }

    shoot() {
        if (!this.active) return;

        // Tạo đạn
        const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
        bullet.setScale(0.05);
        
        // Tính hướng bắn về phía player
        const player = this.scene.player;
        if (player && player.active) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            const speed = 200;
            const velocityX = (dx / length) * speed;
            const velocityY = (dy / length) * speed;
            
            // Set velocity cho bullet body
            bullet.body.velocity.x = velocityX;
            bullet.body.velocity.y = velocityY;
            
            const angle = Math.atan2(dy, dx);
            bullet.setRotation(angle);
        } else {
            // Nếu không có player thì bắn thẳng xuống
            bullet.body.velocity.y = 200;
        }
        
        // Thêm vào group đạn
        this.scene.enemyBullets.add(bullet);
    }

    update() {
        if (!this.active) return;

        // Kiểm tra ra khỏi màn hình
        if (this.y > this.scene.game.config.height + 50) {
            this.destroy();
            return;
        }

        // Kiểm tra thời gian bắn
        const currentTime = this.scene.time.now;
        if (currentTime >= this.nextShootTime) {
            this.shoot();
            this.nextShootTime = currentTime + this.shootDelay;
        }
    }
}
