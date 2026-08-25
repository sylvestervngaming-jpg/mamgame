export default class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Video Ending
        this.videoPlaceholder = this.add.rectangle(w/2, h/2 - 100, 800, 450, 0x4444aa);
        this.add.text(w/2, h/2 - 100, '[ CUTSCENE VIDEO ]\nMáº§m Ä‘Æ°á»£c chÃ o Ä‘Ã³n trong mÃ´i trÆ°á»ng má»›i\nMáº§m nhÃ¬n tay mÃ¬nh bá»‘i rá»‘i.', { font: '28px Arial', fill: '#fff', align: 'center' }).setOrigin(0.5);

        // Chá»¯ xuáº¥t hiá»‡n sau Ä‘Ã³
        this.time.delayedCall(3000, () => {
            this.add.text(w/2, h - 100, 'TÃ”I LÃ€ AI?', { font: 'bold 64px Arial', fill: '#ffffff' }).setOrigin(0.5);
        });
    }
}
