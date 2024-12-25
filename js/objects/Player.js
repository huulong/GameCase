class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setScale(0.05);
        this.speed = 300;
    }

    shoot(pointer) {
        if (!this.active) return;

        // Tạo đạn
        const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
        bullet.setScale(0.05);
        
        // Tính góc và hướng bắn
        const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y);
        bullet.setRotation(angle);
        
        // Tính vector hướng và chuẩn hóa
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Tốc độ đạn
        const speed = 400;
        const velocityX = (dx / length) * speed;
        const velocityY = (dy / length) * speed;
        
        // Set velocity cho bullet body
        bullet.body.velocity.x = velocityX;
        bullet.body.velocity.y = velocityY;
        
        // Thêm vào group đạn
        this.scene.playerBullets.add(bullet);
        
        // Phát âm thanh
        this.scene.shootSound.play();
    }
}
