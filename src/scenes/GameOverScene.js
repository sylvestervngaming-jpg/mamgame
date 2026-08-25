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

        let title = this.win ? 'CHIẾN THẮNG' : 'GAME OVER';
        this.add.text(w/2, h/2 - 70, title, { 
            font: 'bold 60px "Segoe UI", Arial, sans-serif', 
            fill: '#ffffff',
            shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 10, fill: true }
        }).setOrigin(0.5);

        if (!this.win) {
            this.add.text(w/2, h/2 + 10, this.reason, { 
                font: 'bold 24px "Segoe UI", Arial, sans-serif', 
                fill: '#ffcccc',
                align: 'center',
                wordWrap: { width: 800 }
            }).setOrigin(0.5);
        }

        let btnText = this.win ? 'Tiếp tục ➔' : '🔄 Thử lại';
        let btn = this.add.text(w/2, h/2 + 100, btnText, { 
            font: 'bold 26px "Segoe UI", Arial, sans-serif', 
            fill: '#1e272e', 
            backgroundColor: '#00d2d3', 
            padding: { x: 32, y: 14 } 
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ fill: '#ffffff', backgroundColor: '#10ac84' }));
        btn.on('pointerout', () => btn.setStyle({ fill: '#1e272e', backgroundColor: '#00d2d3' }));
        btn.on('pointerdown', () => {
            if (this.win) {
                this.scene.start('MapSelectionScene');
            } else {
                this.scene.start(this.retryScene);
            }
        });
    }
}
