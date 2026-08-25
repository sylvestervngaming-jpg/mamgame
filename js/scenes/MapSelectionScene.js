class MapSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapSelectionScene' });
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Thêm hạt lấp lánh ở nền (stars/dust)
        let bgParticles = this.add.particles(0, 0, 'firefly', {
            x: { min: 0, max: w },
            y: { min: 0, max: h },
            lifespan: 3000,
            speed: { min: 10, max: 20 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.3, end: 0 },
            quantity: 2,
            blendMode: 'ADD'
        });

        this.add.text(w/2, 80, 'BẢN ĐỒ THẾ GIỚI', { font: 'bold 50px Arial', fill: '#ffffff', shadow: { offsetX: 2, offsetY: 2, color: '#00ff00', blur: 10, stroke: true, fill: true } }).setOrigin(0.5);

        // Vẽ đường nối các Map
        let g = this.add.graphics();
        g.lineStyle(4, 0xaaaaaa, 0.5);
        g.beginPath();
        g.moveTo(w/2 - 300, h/2);
        g.lineTo(w/2 - 100, h/2 - 150);
        g.lineTo(w/2 + 100, h/2 + 50);
        g.lineTo(w/2 + 300, h/2 - 100);
        g.lineTo(w/2 + 450, h/2 + 50);
        g.strokePath();

        // Node 1: Đã hoàn thành
        this.add.circle(w/2 - 300, h/2, 40, 0x555555).setStrokeStyle(4, 0xffffff);
        this.add.text(w/2 - 300, h/2, '1', { font: 'bold 30px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(w/2 - 300, h/2 + 70, 'MAP 1\nVùng Xám\nTro Tàn', { font: 'bold 20px Arial', fill: '#aaaaaa', align: 'center' }).setOrigin(0.5);

        // Node 2: Đang mở
        let map2 = this.add.circle(w/2 - 100, h/2 - 150, 60, 0x008800).setStrokeStyle(6, 0x00ff00);
        this.add.text(w/2 - 100, h/2 - 150, '2', { font: 'bold 40px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(w/2 - 100, h/2 - 150 + 100, 'MAP 2\nVương Quốc\nCối Xay Gió', { font: 'bold 26px Arial', fill: '#00ff00', align: 'center' }).setOrigin(0.5);
        this.add.text(w/2 - 100, h/2 - 150 + 150, '(Click để tới)', { font: '18px Arial', fill: '#ffff00', align: 'center' }).setOrigin(0.5);

        map2.setInteractive({ useHandCursor: true });

        // Hiệu ứng nhấp nháy cho map 2
        this.tweens.add({
            targets: map2,
            scale: 1.15,
            alpha: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Node 3, 4, 5: Khóa
        this.add.circle(w/2 + 100, h/2 + 50, 30, 0x222222).setStrokeStyle(2, 0x555555);
        this.add.text(w/2 + 100, h/2 + 50, '3', { font: 'bold 20px Arial', fill: '#555555' }).setOrigin(0.5);
        this.add.text(w/2 + 100, h/2 + 50 + 50, 'MAP 3\n(Khóa)', { font: '18px Arial', fill: '#555555', align: 'center' }).setOrigin(0.5);

        this.add.circle(w/2 + 300, h/2 - 100, 30, 0x222222).setStrokeStyle(2, 0x555555);
        this.add.text(w/2 + 300, h/2 - 100, '4', { font: 'bold 20px Arial', fill: '#555555' }).setOrigin(0.5);
        this.add.text(w/2 + 300, h/2 - 100 + 50, 'MAP 4\n(Khóa)', { font: '18px Arial', fill: '#555555', align: 'center' }).setOrigin(0.5);

        this.add.circle(w/2 + 450, h/2 + 50, 30, 0x222222).setStrokeStyle(2, 0x555555);
        this.add.text(w/2 + 450, h/2 + 50, '5', { font: 'bold 20px Arial', fill: '#555555' }).setOrigin(0.5);
        this.add.text(w/2 + 450, h/2 + 50 + 50, 'MAP 5\n(Khóa)', { font: '18px Arial', fill: '#555555', align: 'center' }).setOrigin(0.5);

        map2.on('pointerdown', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('TransitionScene');
            });
        });
    }
}
window.MapSelectionScene = MapSelectionScene;
