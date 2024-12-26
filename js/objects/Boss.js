class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.2);
        this.baseHealth = 500;
        this.health = this.baseHealth;
        this.active = false;
        this.attackPattern = 0;
        this.nextShootTime = 0;
        this.shootDelay = 2000;
        
        // Thêm các thuộc tính mới
        this.evolutionLevel = 0;
        this.maxEvolutionLevel = 3;
        this.canSplit = true;
        this.isClone = false;
        this.clones = [];
        this.absorbedEnemies = 0;
        
        // Health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    // Hấp thụ enemy để tiến hóa
    absorbEnemy(enemy) {
        if (this.evolutionLevel >= this.maxEvolutionLevel) return;
        
        this.absorbedEnemies++;
        
        // Hiệu ứng hấp thụ
        this.scene.tweens.add({
            targets: enemy,
            x: this.x,
            y: this.y,
            scale: 0,
            duration: 500,
            onComplete: () => {
                enemy.destroy();
                
                // Tiến hóa sau khi hấp thụ đủ enemies
                if (this.absorbedEnemies >= 3) {
                    this.evolve();
                }
            }
        });
        
        // Hồi máu khi hấp thụ
        this.health = Math.min(this.health + 50, this.baseHealth);
        this.updateHealthBar();
    }

    // Tiến hóa boss
    evolve() {
        this.evolutionLevel++;
        this.absorbedEnemies = 0;
        
        // Hiệu ứng tiến hóa
        this.scene.tweens.add({
            targets: this,
            scale: this.scale * 1.2,
            duration: 1000,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                // Tăng sức mạnh
                this.baseHealth += 200;
                this.health = this.baseHealth;
                this.shootDelay *= 0.8;
            }
        });
    }

    // Chia tách thành nhiều phần
    split() {
        if (!this.canSplit || this.isClone) return;
        
        this.canSplit = false;
        const numClones = 2;
        
        for (let i = 0; i < numClones; i++) {
            const offsetX = (i === 0) ? -100 : 100;
            const clone = new Boss(this.scene, this.x + offsetX, this.y);
            clone.setScale(this.scale * 0.7);
            clone.health = this.health * 0.5;
            clone.isClone = true;
            clone.evolutionLevel = this.evolutionLevel;
            this.clones.push(clone);
        }
        
        // Timer để có thể split lại
        this.scene.time.delayedCall(10000, () => {
            this.canSplit = true;
        });
    }

    // Đổi vị trí với enemy ngẫu nhiên
    swapWithEnemy() {
        const enemies = this.scene.enemies.getChildren();
        if (enemies.length === 0) return;
        
        const randomEnemy = Phaser.Utils.Array.GetRandom(enemies);
        
        // Lưu vị trí
        const bossX = this.x;
        const bossY = this.y;
        
        // Hiệu ứng teleport
        this.scene.tweens.add({
            targets: [this, randomEnemy],
            alpha: 0,
            duration: 200,
            onComplete: () => {
                // Swap vị trí
                this.x = randomEnemy.x;
                this.y = randomEnemy.y;
                randomEnemy.x = bossX;
                randomEnemy.y = bossY;
                
                // Hiệu ứng xuất hiện
                this.scene.tweens.add({
                    targets: [this, randomEnemy],
                    alpha: 1,
                    duration: 200
                });
            }
        });
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
        
        // Nếu là clone và hết máu
        if (this.isClone && this.health <= 0) {
            this.destroy();
            return false;
        }
        
        // Boss chính chỉ chết khi không còn clone và hết máu
        return !this.isClone && this.clones.length === 0 && this.health <= 0;
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
        if (!this.active) return;
        
        this.updateHealthBar();
        this.shoot();
        
        // Random sử dụng các khả năng đặc biệt
        if (Phaser.Math.Between(0, 1000) < 5) { // 0.5% mỗi frame
            const ability = Phaser.Math.Between(0, 2);
            switch(ability) {
                case 0:
                    if (this.scene.enemies.getChildren().length > 0) {
                        this.absorbEnemy(Phaser.Utils.Array.GetRandom(this.scene.enemies.getChildren()));
                    }
                    break;
                case 1:
                    if (this.health < this.baseHealth * 0.5) {
                        this.split();
                    }
                    break;
                case 2:
                    this.swapWithEnemy();
                    break;
            }
        }
        
        // Update các clone
        this.clones = this.clones.filter(clone => clone.active);
    }

    destroy() {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        super.destroy();
    }
}
