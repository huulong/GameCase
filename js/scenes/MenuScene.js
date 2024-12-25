class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Background
        this.add.image(0, 0, 'background')
            .setOrigin(0)
            .setDisplaySize(this.game.config.width, this.game.config.height);

        // Title
        this.add.text(this.game.config.width / 2, 200, 'SPACE SHOOTER', {
            fontSize: '64px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.text(this.game.config.width / 2, 400, 'Start Game', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Hover effect
        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#45a049' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#4CAF50' });
        });

        // Click to start game
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
