class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Khởi tạo biến
        this.score = 0;
        this.gameOver = false;
        this.bossSpawned = false;
        this.playerLives = 1;  // Chỉ có 1 mạng
        this.isPlayerInvincible = false;

        // Background
        this.add.image(0, 0, 'background')
            .setOrigin(0)
            .setDisplaySize(this.game.config.width, this.game.config.height);

        // Âm thanh
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.shootSound = this.sound.add('shoot', { volume: 0.3 });
        this.bgMusic.play();

        // Spawn player
        this.spawnPlayer();

        // Nhóm đạn
        this.playerBullets = this.add.group();
        this.enemyBullets = this.add.group();
        this.bossBullets = this.add.group();

        // Nhóm enemies
        this.enemies = this.add.group();

        // Boss
        this.boss = new Boss(
            this,
            this.game.config.width / 2,
            -100
        );
        this.boss.setVisible(false);
        this.boss.setActive(false);

        // UI
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff'
        });
        this.livesText = this.add.text(16, 56, 'Lives: ' + this.playerLives, {
            fontSize: '32px',
            fill: '#fff'
        });

        // Spawn enemies
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Input
        this.cursors = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            space: 'SPACE'
        });

        // Mouse click để bắn
        this.input.on('pointerdown', (pointer) => {
            if (!this.gameOver && this.player.active) {
                this.player.shoot(pointer);
            }
        });

        // Collision
        this.setupCollisions();

        // Khởi tạo hệ thống thành tựu
        this.achievements = {
            firstBlood: { 
                earned: false, 
                title: "First Blood",
                description: "Tiêu diệt enemy đầu tiên",
                condition: () => this.score >= 10
            },
            sharpshooter: {
                earned: false,
                title: "Xạ Thủ",
                description: "Đạt 100 điểm",
                condition: () => this.score >= 100
            },
            bossFighter: {
                earned: false,
                title: "Kẻ Thách Đấu",
                description: "Đối đầu với Boss",
                condition: () => this.bossSpawned
            },
            champion: {
                earned: false,
                title: "Nhà Vô Địch",
                description: "Tiêu diệt Boss",
                condition: () => this.boss && !this.boss.active && this.bossSpawned
            }
        };

        // Tạo animation cho explosion
        this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 11 }),
            frameRate: 20,
            repeat: 0
        });
    }

    spawnPlayer() {
        // Spawn player ở vị trí ban đầu
        this.player = new Player(
            this,
            this.game.config.width / 2,
            this.game.config.height - 100
        );

        // Chế độ bất khả xâm phạm
        this.isPlayerInvincible = true;
        this.player.alpha = 0.5;

        // Hiệu ứng nhấp nháy
        this.tweens.add({
            targets: this.player,
            alpha: 1,
            duration: 200,
            ease: 'Linear',
            repeat: 5,
            onComplete: () => {
                // Kết thúc chế độ bất khả xâm phạm sau 2 giây
                this.time.delayedCall(2000, () => {
                    this.isPlayerInvincible = false;
                    this.player.alpha = 1;
                });
            }
        });
    }

    setupCollisions() {
        // Player bullet hits enemy
        this.physics.add.overlap(
            this.playerBullets,
            this.enemies,
            (bullet, enemy) => {
                if (bullet.active && enemy.active) {
                    bullet.destroy();
                    enemy.destroy();
                    
                    // Hiệu ứng nổ
                    this.createExplosionEffect(enemy.x, enemy.y);
                    
                    this.score += 10;
                    this.scoreText.setText('Score: ' + this.score);
                    
                    // Check achievements
                    this.checkAchievements();
                }
            }
        );

        // Player bullet hits boss
        this.physics.add.overlap(
            this.playerBullets,
            this.boss,
            (bullet, boss) => {
                if (bullet.active && boss.active) {
                    bullet.destroy();
                    if (boss.hit()) {
                        this.score += 1000;
                        this.scoreText.setText('Score: ' + this.score);
                        this.gameWin();
                    }
                }
            }
        );

        // Enemy/Boss bullets hit player
        const hitPlayer = (bullet, player) => {
            if (bullet.active && player.active) {
                // Kiểm tra chế độ bất khả xâm phạm
                if (this.isPlayerInvincible) {
                    bullet.destroy();
                    player.alpha = 0.5;
                    this.time.delayedCall(100, () => {
                        player.alpha = 1;
                    });
                    return;
                }

                bullet.destroy();
                
                // Chỉ giảm mạng nếu mạng > 0
                if (this.playerLives > 0) {
                    this.playerLives--;
                    this.livesText.setText('Lives: ' + this.playerLives);
                }
                
                if (this.playerLives <= 0) {
                    this.gameOver = true;
                    player.destroy();
                    this.showGameOverScreen();
                }
            }
        };

        this.physics.add.overlap(
            this.player,
            this.enemyBullets,
            hitPlayer
        );

        this.physics.add.overlap(
            this.player,
            this.bossBullets,
            hitPlayer
        );
    }

    createExplosionEffect(x, y) {
        // Tạo sprite explosion
        const explosion = this.add.sprite(x, y, 'explosion');
        explosion.setScale(2);  // Điều chỉnh kích thước nếu cần
        
        // Phát animation
        explosion.play('explosion');
        
        // Tự động xóa sprite khi animation kết thúc
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
    }

    update() {
        if (this.gameOver) {
            if (this.cursors.space.isDown) {
                this.scene.restart();
            }
            return;
        }

        // Player movement
        if (this.player.active) {
            this.updatePlayerMovement();
        }

        
        if (this.score >= 200 && !this.bossSpawned) {
            this.spawnBoss();
        }

        // Update boss
        if (this.boss && this.boss.active) {
            this.boss.update();
        }

        // Update enemies
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                enemy.update();
            }
        });

        // Update bullets
        this.updateBullets();
    }

    updatePlayerMovement() {
        // WASD movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-300);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(300);
        } else {
            this.player.setVelocityY(0);
        }
    }

    spawnEnemy() {
        if (this.gameOver || this.bossSpawned) return;

        const x = Phaser.Math.Between(50, this.game.config.width - 50);
        const enemy = new Enemy(this, x, -50);
        this.enemies.add(enemy);
    }

    spawnBoss() {
        this.bossSpawned = true;
        
        // Thêm hiệu ứng thông báo
        const warningText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2,
            'BOSS BẢO VI\nXUẤT HIỆN!',
            {
                fontSize: '64px',
                fill: '#ff0000',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#ffffff',     
                strokeThickness: 4      
            }
        ).setOrigin(0.5);

       
        this.tweens.add({
            targets: warningText,
            alpha: { from: 1, to: 0 },
            duration: 500,
            repeat: 3,
            onComplete: () => {
                warningText.destroy();
                this.boss.activate();
            }
        });
    }

    updateBullets() {
        const bounds = {
            top: -50,
            bottom: this.game.config.height + 50,
            left: -50,
            right: this.game.config.width + 50
        };

        const isOutOfBounds = (bullet) => {
            return bullet.y < bounds.top || 
                   bullet.y > bounds.bottom ||
                   bullet.x < bounds.left || 
                   bullet.x > bounds.right;
        };

        // Update và xóa đạn
        [this.playerBullets, this.enemyBullets, this.bossBullets].forEach(group => {
            group.getChildren().forEach(bullet => {
                if (bullet.active) {
                    // Cập nhật vị trí đạn dựa trên vận tốc
                    if (bullet.body) {
                        bullet.x += bullet.body.velocity.x / 60;
                        bullet.y += bullet.body.velocity.y / 60;
                    }
                    
                    // Xóa đạn nếu ra khỏi màn hình
                    if (isOutOfBounds(bullet)) {
                        bullet.destroy();
                    }
                }
            });
        });
    }

    showGameOverScreen() {
        this.bgMusic.stop();
        
        // Tạo overlay tối
        const overlay = this.add.rectangle(
            0, 0,
            this.game.config.width,
            this.game.config.height,
            0x000000, 0.7
        ).setOrigin(0);

        // Text Game Over
        const gameOverText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 - 100,
            'Game Over\nScore: ' + this.score,
            {
                fontSize: '64px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Nút Play Again
        const playAgainButton = this.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height / 2 + 50,
            200, 50,
            0x00ff00
        ).setInteractive();

        const buttonText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 + 50,
            'Play Again',
            {
                fontSize: '32px',
                fill: '#000',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Hover effect
        playAgainButton.on('pointerover', () => {
            playAgainButton.setFillStyle(0x00dd00);
        });

        playAgainButton.on('pointerout', () => {
            playAgainButton.setFillStyle(0x00ff00);
        });

        // Click to restart
        playAgainButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    gameWin() {
        this.bgMusic.stop();
        
        // Tạo overlay tối
        const overlay = this.add.rectangle(
            0, 0,
            this.game.config.width,
            this.game.config.height,
            0x000000, 0.7
        ).setOrigin(0);

        // Text Win
        const winText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 - 100,
            'You Win!\nScore: ' + this.score,
            {
                fontSize: '64px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Nút Play Again
        const playAgainButton = this.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height / 2 + 50,
            200, 50,
            0x00ff00
        ).setInteractive();

        const buttonText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 + 50,
            'Play Again',
            {
                fontSize: '32px',
                fill: '#000',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Hover effect
        playAgainButton.on('pointerover', () => {
            playAgainButton.setFillStyle(0x00dd00);
        });

        playAgainButton.on('pointerout', () => {
            playAgainButton.setFillStyle(0x00ff00);
        });

        // Click to restart
        playAgainButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    checkAchievements() {
        Object.entries(this.achievements).forEach(([id, achievement]) => {
            if (!achievement.earned && achievement.condition()) {
                this.unlockAchievement(id, achievement);
            }
        });
    }

    unlockAchievement(id, achievement) {
        achievement.earned = true;
        
        // Tạo popup thành tựu
        const popup = this.add.container(this.game.config.width + 300, 20);
        
        // Background
        const bg = this.add.rectangle(0, 0, 280, 70, 0x000000, 0.8);
        bg.setStrokeStyle(2, 0xffff00);
        
        // Icon
        const icon = this.add.rectangle(-120, 0, 50, 50, 0xffff00);
        
        // Text
        const titleText = this.add.text(-90, -15, achievement.title, {
            fontSize: '20px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        
        const descText = this.add.text(-90, 10, achievement.description, {
            fontSize: '16px',
            fill: '#ffffff'
        });
        
        // Thêm vào container
        popup.add([bg, icon, titleText, descText]);
        
        // Animation slide in
        this.tweens.add({
            targets: popup,
            x: this.game.config.width - 300,
            duration: 1000,
            ease: 'Back.out',
            onComplete: () => {
                // Đợi 3 giây rồi slide out
                this.time.delayedCall(3000, () => {
                    this.tweens.add({
                        targets: popup,
                        x: this.game.config.width + 300,
                        duration: 1000,
                        ease: 'Back.in',
                        onComplete: () => {
                            popup.destroy();
                        }
                    });
                });
            }
        });
    }
}
