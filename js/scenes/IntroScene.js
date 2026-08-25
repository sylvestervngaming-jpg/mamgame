class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    create() {
        // Tắt UI trong các màn Cutscene
        this.registry.set('showUI', false);

        // Reset stats khi bắt đầu lại vòng lặp mới
        this.registry.set('health', 100);
        this.registry.set('water', 50);
        this.registry.set('sun', 50);
        this.registry.set('psyche', 100);
        
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Khung video Cutscene giả lập
        this.videoPlaceholder = this.add.rectangle(w/2, h/2 - 50, 1000, 500, 0x333333);
        this.videoText = this.add.text(w/2, h/2 - 50, '[ VIDEO CLIP ]\nCảnh bom đạn -> Mầm mọc lên -> Nước ô nhiễm', { font: '32px Arial', fill: '#ffffff', align: 'center' }).setOrigin(0.5);

        // Nút Skip video / Giả lập video đã chạy xong
        this.skipBtn = this.add.text(w/2, h - 100, '>> Bỏ qua / Hoàn thành Video', { font: '24px Arial', fill: '#ffff00', backgroundColor: '#000' })
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

        this.add.text(w/2, h/2 - 100, 'Bạn có muốn ở lại?', { font: '40px Arial', fill: '#ffffff' }).setOrigin(0.5);

        // [ X ] Rời đi
        this.add.text(w/2 - 200, h/2 + 50, '[ X ] Rời đi', { font: '32px Arial', fill: '#ff4444' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MapScene'));

        // [ V ] Ở lại
        this.add.text(w/2 + 200, h/2 + 50, '[ V ] Ở lại', { font: '32px Arial', fill: '#44ff44' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('GameOverScene', { reason: 'Mầm bị nhiễm độc chết ngay từ đầu.' }));
    }
}
