class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Video Ending
        this.videoPlaceholder = this.add.rectangle(w/2, h/2 - 100, 800, 450, 0x4444aa);
        this.add.text(w/2, h/2 - 100, '[ CUTSCENE VIDEO ]\nMầm được chào đón trong môi trường mới\nMầm nhìn tay mình bối rối.', { font: '28px Arial', fill: '#fff', align: 'center' }).setOrigin(0.5);

        // Chữ xuất hiện sau đó
        this.time.delayedCall(3000, () => {
            this.add.text(w/2, h - 100, 'TÔI LÀ AI?', { font: 'bold 64px Arial', fill: '#ffffff' }).setOrigin(0.5);
        });
    }
}
