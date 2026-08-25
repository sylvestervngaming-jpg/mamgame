export default class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    create() {
        // Táº¯t UI trong cÃ¡c mÃ n Cutscene
        this.registry.set('showUI', false);

        // Reset stats khi báº¯t Ä‘áº§u láº¡i vÃ²ng láº·p má»›i
        this.registry.set('health', 100);
        this.registry.set('water', 50);
        this.registry.set('sun', 50);
        this.registry.set('psyche', 100);
        
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Khung video Cutscene giáº£ láº­p
        this.videoPlaceholder = this.add.rectangle(w/2, h/2 - 50, 1000, 500, 0x333333);
        this.videoText = this.add.text(w/2, h/2 - 50, '[ VIDEO CLIP ]\nCáº£nh bom Ä‘áº¡n -> Máº§m má»c lÃªn -> NÆ°á»›c Ã´ nhiá»…m', { font: '32px Arial', fill: '#ffffff', align: 'center' }).setOrigin(0.5);

        // NÃºt Skip video / Giáº£ láº­p video Ä‘Ã£ cháº¡y xong
        this.skipBtn = this.add.text(w/2, h - 100, '>> Bá» qua / HoÃ n thÃ nh Video', { font: '24px Arial', fill: '#ffff00', backgroundColor: '#000' })
            .setPadding(10).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.videoPlaceholder.setVisible(false);
                this.videoText.setVisible(false);
                this.skipBtn.setVisible(false);
                this.showChoice();
            });
    }

    showChoice() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.text(w/2, h/2 - 100, 'Báº¡n cÃ³ muá»‘n á»Ÿ láº¡i?', { font: '40px Arial', fill: '#ffffff' }).setOrigin(0.5);

        // [ X ] Rá»i Ä‘i
        this.add.text(w/2 - 200, h/2 + 50, '[ X ] Rá»i Ä‘i', { font: '32px Arial', fill: '#ff4444' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MapScene'));

        // [ V ] á»ž láº¡i
        this.add.text(w/2 + 200, h/2 + 50, '[ V ] á»ž láº¡i', { font: '32px Arial', fill: '#44ff44' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('GameOverScene', { reason: 'Máº§m bá»‹ nhiá»…m Ä‘á»™c cháº¿t ngay tá»« Ä‘áº§u.' }));
    }
}
