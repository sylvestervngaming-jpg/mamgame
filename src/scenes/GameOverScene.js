export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.reason = data.reason || 'Bạn đã chết.';
        this.win = data.win || false;
        this.retryScene = data.retryScene || 'RunnerScene';
    }

    create() {
        this.scene.bringToTop();
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.setBackgroundColor(this.win ? '#003300' : '#880000');

        let title = this.win ? 'SỐNG SÓT' : 'GAME OVER';
        this.add.text(w/2, h/2 - 60, title, { 
            font: 'bold 64px Arial', 
            fill: '#ffffff' 
        }).setOrigin(0.5);

        if (!this.win) {
            this.add.text(w/2, h/2 + 20, this.reason, { 
                font: '28px Arial', 
                fill: '#ffcccc' 
            }).setOrigin(0.5);
        }

        let btnText = this.win ? 'Rời đi' : 'Thử lại';
        let btn = this.add.text(w/2, h/2 + 120, btnText, { 
            font: 'bold 32px Arial', 
            fill: '#ffff00', 
            backgroundColor: '#000000aa', 
            padding: { x: 30, y: 12 } 
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ fill: '#00ffcc' }));
        btn.on('pointerout', () => btn.setStyle({ fill: '#ffff00' }));
        btn.on('pointerdown', () => {
            if (this.win) {
                this.scene.start('MapSelectionScene');
            } else {
                this.scene.start(this.retryScene);
            }
        });
    }
}
