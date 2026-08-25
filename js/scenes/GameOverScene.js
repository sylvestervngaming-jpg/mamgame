class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.reason = data.reason || 'Bạn đã chết.';
        this.win = data.win || false;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.setBackgroundColor(this.win ? '#003300' : '#880000');

        let title = this.win ? 'SỐNG SÓT' : 'GAME OVER';
        this.add.text(w/2, h/2 - 50, title, { font: 'bold 64px Arial', fill: '#fff' }).setOrigin(0.5);
        if (!this.win) {
            this.add.text(w/2, h/2 + 50, this.reason, { font: '32px Arial', fill: '#ffaaaa' }).setOrigin(0.5);
        }

        let btnText = this.win ? 'Rời đi' : 'Thử lại';
        this.add.text(w/2, h/2 + 150, btnText, { font: 'bold 32px Arial', fill: '#ffff00', backgroundColor: '#000000aa', padding: { x: 20, y: 10 } })
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.win) {
                    this.scene.start('MapSelectionScene');
                } else {
                    this.scene.start('RunnerScene');
                }
            });
    }
}
