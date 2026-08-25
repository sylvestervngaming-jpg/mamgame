export default class Map5Scene extends Phaser.Scene {
    constructor() {
        super('Map5Scene');
    }

    create() {
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;
        
        // Bầu trời đêm tím huyền bí của Vương Quốc Dạ Nấm
        this.cameras.main.setBackgroundColor('#1e0826');

        // Bụi phấn nấm phát quang bay lơ lửng
        this.add.particles(0, 0, 'firefly', {
            x: { min: 0, max: this.cameras.main.width },
            y: { min: 0, max: this.cameras.main.height },
            lifespan: 3500,
            speed: { min: 10, max: 25 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: 0xd980fa,
            quantity: 3,
            blendMode: 'ADD'
        });

        this.add.text(cx, cy - 60, '🍄 Vương Quốc Dạ Nấm', {
            font: 'bold 46px Arial',
            fill: '#d980fa',
            shadow: { offsetX: 0, offsetY: 0, color: '#9b59b6', blur: 15, stroke: true, fill: true }
        }).setOrigin(0.5);

        this.add.text(cx, cy + 10, '(Trạng thái đang phát triển...)', {
            font: 'italic 22px Arial',
            fill: '#bdc3c7'
        }).setOrigin(0.5);

        let backBtn = this.add.text(cx, cy + 100, '[ Quay lại Bản Đồ Thế Giới ]', {
            font: 'bold 22px Arial',
            fill: '#2ecc71',
            backgroundColor: '#000000aa',
            padding: { x: 24, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#f1c40f' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#2ecc71' }));
        backBtn.on('pointerdown', () => {
            this.scene.start('MapSelectionScene');
        });
    }
}
