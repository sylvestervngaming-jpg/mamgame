class Map3Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Map3Scene' });
    }
    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.add.text(w/2, h/2 - 50, 'MÀN 3\nLàng Sen (Việt Nam)', { font: 'bold 40px Arial', fill: '#00ff00', align: 'center' }).setOrigin(0.5);
        this.add.text(w/2, h/2 + 50, 'Đang phát triển...', { font: '24px Arial', fill: '#ffffff' }).setOrigin(0.5);
        let menuBtn = this.add.text(w/2, h/2 + 150, 'VỀ MENU CHÍNH', { font: 'bold 30px Arial', fill: '#ffff00', backgroundColor: '#333333', padding: { x: 20, y: 10 } })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}
window.Map3Scene = Map3Scene;
