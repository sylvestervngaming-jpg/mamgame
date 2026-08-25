export default class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    
    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        this.add.text(w/2, h/3, 'MẦM: HÀNH TRÌNH TÌM NẮNG', { font: 'bold 60px Arial', fill: '#66ff66' }).setOrigin(0.5);
        
        let startBtn = this.add.text(w/2, h/2 - 40, 'BẮT ĐẦU TỪ MÀN 1', { font: 'bold 40px Arial', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        startBtn.on('pointerdown', () => {
            try {
                if (!this.scale.isFullscreen && this.scale.startFullscreen) {
                    this.scale.startFullscreen();
                }
            } catch (e) {}
            this.registry.set('health', 100);
            this.registry.set('water', 50);
            this.registry.set('sun', 50);
            this.registry.set('psyche', 100);
            this.scene.launch('UIScene');
            this.scene.start('RunnerScene');
        });
        startBtn.on('pointerover', () => startBtn.setFill('#ffff00'));
        startBtn.on('pointerout', () => startBtn.setFill('#fff'));

        let mapSelectBtn = this.add.text(w/2, h/2 + 40, 'CHỌN MÀN CHƠI', { font: 'bold 40px Arial', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        mapSelectBtn.on('pointerdown', () => {
            this.scene.start('MapSelectionScene');
        });
        mapSelectBtn.on('pointerover', () => mapSelectBtn.setFill('#00ffff'));
        mapSelectBtn.on('pointerout', () => mapSelectBtn.setFill('#fff'));

        let exitBtn = this.add.text(w/2, h/2 + 120, 'THOÁT GAME', { font: 'bold 40px Arial', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        exitBtn.on('pointerdown', () => window.close());
        exitBtn.on('pointerover', () => exitBtn.setFill('#ff0000'));
        exitBtn.on('pointerout', () => exitBtn.setFill('#fff'));
    }
}
