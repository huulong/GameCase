class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load tất cả assets
        this.load.image('background', 'assets/images/sky-background.jpg');
        this.load.image('player', 'assets/images/spaceship.png');
        this.load.image('enemy', 'assets/images/ufo.png');
        this.load.image('boss', 'assets/images/boss.png');
        this.load.image('bullet', 'assets/images/shoot.png');
        this.load.image('particle', 'assets/particle.png');
        
        // Load âm thanh
        this.load.audio('bgMusic', 'assets/sounds/nhacnen.mp3');
        this.load.audio('shoot', 'assets/sounds/shoot.mp3');
        this.load.audio('achievement', 'assets/sounds/achievement.mp3');

        // Loading bar
        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        });

        this.load.on('progress', (percent) => {
            loadingBar.fillRect(0, this.game.renderer.height / 2, 
                this.game.renderer.width * percent, 50);
        });

        this.load.on('complete', () => {
            this.scene.start('MenuScene');
        });

        this.load.spritesheet('explosion', 
            'assets/images/Red Effect Bullet Impact Explosion 32x32.png',
            { frameWidth: 32, frameHeight: 32 }
        );

        // Load warning sound
        this.load.audio('bossWarning', 'assets/sounds/BossVi.mp3');
    }
}
