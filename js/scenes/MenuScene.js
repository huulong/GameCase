class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.dialogueActive = false;
    }

    startDialogue() {
        if (this.dialogueActive) return;
        
        this.dialogueActive = true;
        
        if (this.dialogueContainer) {
            this.dialogueContainer.destroy();
        }
        
        this.dialogueContainer = this.add.container(0, 0);
        
        const overlay = this.add.rectangle(
            0, 0,
            this.game.config.width,
            this.game.config.height,
            0x000000, 0.8
        ).setOrigin(0);
        
        this.dialogueContainer.add(overlay);
        const dialogues = [
            { 
                speaker: "Boss Bảo Vi", 
                text: "Khánh, ngươi nghĩ rằng chỉ vài ba lời hoa mỹ là có thể lay động được ta sao? Ta không phải loại người dễ bị cảm động bởi lời nói.", 
                options: ["Bảo Vi, ta nói thật lòng!", "Vì nàng, ta nguyện thay đổi tất cả!"] 
            },
            { 
                speaker: "Boss Bảo Vi", 
                text: "Thật lòng ư? Ngươi có biết bao kẻ trước ngươi đã quỳ gối tại đây, hứa hẹn cả trăm điều, nhưng cuối cùng lại là những kẻ hèn nhát không xứng đáng?", 
                options: ["Ta không giống họ!", "Ta sẽ chứng minh bằng hành động, không phải lời nói!"] 
            },
            { 
                speaker: "Khánh", 
                text: "Ta không quan tâm họ là ai. Ta chỉ biết một điều: trái tim ta luôn hướng về nàng, dù có phải đối mặt với thử thách gì đi nữa!", 
                options: ["Hãy tin ta, Bảo Vi!", "Đừng để quá khứ cản trở tương lai của chúng ta."] 
            },
            { 
                speaker: "Boss Bảo Vi", 
                text: "Khánh, ngươi đang đánh cược cả lòng tự tôn của mình vì ta sao? Được, ta sẽ cho ngươi một cơ hội. Nhưng hãy nhớ... chỉ một lần duy nhất. Thử thách này sẽ không dành cho những kẻ yếu đuối.", 
                options: ["Ta không sợ bất cứ điều gì!", "Vì nàng, ta chấp nhận tất cả!"] 
            },
            { 
                speaker: "Boss Bảo Vi", 
                text: "Rất tốt! Nhưng nếu ngươi thất bại, hãy quên ta đi. Vì trái tim ta chỉ thuộc về kẻ mạnh mẽ, đủ sức bảo vệ ta.", 
                options: ["Ta sẽ chứng minh rằng ta xứng đáng!", "Đợi ta, Bảo Vi. Ta sẽ không khiến nàng thất vọng!"] 
            },
            { 
                speaker: "Khánh", 
                text: "Ta đã chọn con đường này, và ta sẽ không dừng lại. Bảo Vi, nàng sẽ thấy, tình yêu của ta đủ sức vượt qua tất cả!", 
                options: ["Hãy chờ ta, Vi!", "Ta sẽ quay lại, mạnh mẽ hơn bao giờ hết!"] 
            }
        ];
        

        let currentDialogue = 0;

        const createDialogueBox = (dialogue) => {
            const box = this.add.container(this.game.config.width / 2, this.game.config.height - 200);
            
            const boxBg = this.add.rectangle(0, 0, 700, 150, 0x000000, 0.9)
                .setStrokeStyle(2, 0x00ff00);
            
            const speakerText = this.add.text(-300, -50, dialogue.speaker, {
                fontSize: '24px',
                fill: '#ff0000',
                fontStyle: 'bold'
            });
            
            const dialogueText = this.add.text(-300, -30, dialogue.text, {
                fontSize: '20px',
                fill: '#ffffff',
                wordWrap: { width: 600 }
            });

            box.add([boxBg, speakerText, dialogueText]);

            dialogue.options.forEach((option, index) => {
                const spacing = 300;
                const startX = -((dialogue.options.length - 1) * spacing) / 2;
                
                const optionButton = this.add.rectangle(
                    startX + index * spacing,
                    70,
                    280,
                    45,
                    0x4CAF50
                ).setInteractive();

                const optionText = this.add.text(
                    startX + index * spacing,
                    70,
                    option,
                    {
                        fontSize: '18px',
                        fill: '#ffffff',
                        wordWrap: { width: 260 },
                        align: 'center'
                    }
                ).setOrigin(0.5);

                optionButton.on('pointerover', () => {
                    optionButton.setFillStyle(0x45a049);
                });
                optionButton.on('pointerout', () => {
                    optionButton.setFillStyle(0x4CAF50);
                });

                optionButton.on('pointerdown', () => {
                    box.destroy();
                    currentDialogue++;
                    
                    if (currentDialogue < dialogues.length) {
                        createDialogueBox(dialogues[currentDialogue]);
                    } else {
                        this.dialogueContainer.destroy();
                        this.dialogueActive = false;
                        this.scene.start('GameScene');
                    }
                });

                box.add([optionButton, optionText]);
            });

            this.dialogueContainer.add(box);

            box.setAlpha(0);
            this.tweens.add({
                targets: box,
                alpha: 1,
                duration: 500
            });
        };

        createDialogueBox(dialogues[0]);
    }

    create() {
        // Background
        this.add.image(0, 0, 'background')
            .setOrigin(0)
            .setDisplaySize(this.game.config.width, this.game.config.height);

        // Title với hiệu ứng glow
        const title = this.add.text(this.game.config.width / 2, 150, 'SPACE SHOOTER', {
            fontSize: '64px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#0066ff',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Thêm hiệu ứng cho title
        this.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Container cho các buttons
        const buttonContainer = this.add.container(this.game.config.width / 2, 300);

        // Single Player button
        const singleButton = this.createButton('Single Player', 0);
        buttonContainer.add(singleButton);

        // Multiplayer button
        const multiButton = this.createButton('Multiplayer', 80);
        buttonContainer.add(multiButton);

        // Settings button
        const settingsButton = this.createButton('Settings', 160);
        buttonContainer.add(settingsButton);

        // Xử lý click cho Single Player
        singleButton.getAt(0).on('pointerdown', () => {
            if (!this.dialogueActive) {
                this.startDialogue();
            }
        });

        // Xử lý click cho Multiplayer
        multiButton.getAt(0).on('pointerdown', () => {
            // Tạo container cho popup
            const popupContainer = this.add.container(this.game.config.width / 2, -200);
            
            // Background cho popup
            const popupBg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.9)
                .setStrokeStyle(2, 0x00ff00);
            
            // Text thông báo
            const titleText = this.add.text(0, -50, 'MULTIPLAYER', {
                fontSize: '32px',
                fill: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            const messageText = this.add.text(0, 20, 'Bọn mày chờ gì với\ncon game này để có\nchức năng đó!', {
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            // Thêm vào container
            popupContainer.add([popupBg, titleText, messageText]);
            
            // Animation slide down
            this.tweens.add({
                targets: popupContainer,
                y: this.game.config.height / 2,
                duration: 500,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Sau 2 giây, slide up và destroy
                    this.time.delayedCall(2000, () => {
                        this.tweens.add({
                            targets: popupContainer,
                            y: -200,
                            duration: 500,
                            ease: 'Back.easeIn',
                            onComplete: () => {
                                popupContainer.destroy();
                            }
                        });
                    });
                }
            });
        });

        // Version text
        this.add.text(10, this.game.config.height - 30, 'Version 1.0', {
            fontSize: '16px',
            fill: '#ffffff'
        });
    }

    createButton(text, yOffset = 0) {
        const button = this.add.container(0, yOffset);

        // Button background
        const bg = this.add.rectangle(0, 0, 250, 50, 0x4CAF50)
            .setStrokeStyle(2, 0x45a049);
        
        // Button text
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        button.add([bg, buttonText]);

        // Make interactive
        bg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                bg.setFillStyle(0x45a049);
                this.tweens.add({
                    targets: button,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100
                });
            })
            .on('pointerout', () => {
                bg.setFillStyle(0x4CAF50);
                this.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });

        return button;
    }
}
