class PauseScene extends Phaser.Scene {
    constructor() { super('PauseScene'); }
    
    create(data) {
        this.pausedScene = data.scene;
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        this.add.rectangle(0, 0, w, h, 0x000000, 0.8).setOrigin(0);
        this.add.text(w/2, h/3 - 50, 'TẠM DỪNG', { font: 'bold 60px Arial', fill: '#fff' }).setOrigin(0.5);

        let resBtn = this.add.text(w/2, h/2, 'TIẾP TỤC', { font: 'bold 40px Arial', fill: '#fff' }).setOrigin(0.5).setInteractive();
        resBtn.on('pointerdown', () => {
            this.scene.resume(this.pausedScene);
            this.scene.stop();
        });
        resBtn.on('pointerover', () => resBtn.setFill('#ffff00'));
        resBtn.on('pointerout', () => resBtn.setFill('#fff'));

        let menuBtn = this.add.text(w/2, h/2 + 80, 'VỀ MENU CHÍNH', { font: 'bold 40px Arial', fill: '#fff' }).setOrigin(0.5).setInteractive();
        menuBtn.on('pointerdown', () => {
            this.scene.stop(this.pausedScene);
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
        menuBtn.on('pointerover', () => menuBtn.setFill('#ffff00'));
        menuBtn.on('pointerout', () => menuBtn.setFill('#fff'));

        let exitBtn = this.add.text(w/2, h/2 + 160, 'THOÁT GAME', { font: 'bold 40px Arial', fill: '#fff' }).setOrigin(0.5).setInteractive();
        exitBtn.on('pointerdown', () => window.close());
        exitBtn.on('pointerover', () => exitBtn.setFill('#ff0000'));
        exitBtn.on('pointerout', () => exitBtn.setFill('#fff'));

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.resume(this.pausedScene);
            this.scene.stop();
        });
    }
}
