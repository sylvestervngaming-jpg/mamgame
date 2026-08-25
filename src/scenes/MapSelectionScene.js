

export default class MapSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapSelectionScene' });
    }

    
    create() {
        this.registry.set('showUI', false);
        this.registry.set('showSurvival', false);
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

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

        let g = this.add.graphics();
        g.lineStyle(4, 0xaaaaaa, 0.5);
        g.beginPath();
        g.moveTo(w/2 - 300, h/2);
        g.lineTo(w/2 - 100, h/2 - 150);
        g.lineTo(w/2 + 100, h/2 + 50);
        g.lineTo(w/2 + 300, h/2 - 100);
        g.lineTo(w/2 + 450, h/2 + 50);
        g.strokePath();

        // Map 1: RunnerScene
        let map1 = this.add.circle(w/2 - 300, h/2, 50, 0x005588).setStrokeStyle(6, 0x00aaff);
        this.add.text(w/2 - 300, h/2, '1', { font: 'bold 30px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(w/2 - 300, h/2 + 80, 'MAP 1\nVùng Xám', { font: 'bold 20px Arial', fill: '#00aaff', align: 'center' }).setOrigin(0.5);
        map1.setInteractive({ useHandCursor: true });
        this.tweens.add({ targets: map1, scale: 1.1, duration: 1000, yoyo: true, repeat: -1 });
        map1.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 255, 255, 255);
            this.time.delayedCall(500, () => this.scene.start('RunnerScene'));
        });

        // Map 2: Map2Scene (Original transition went through TransitionScene)
        let map2 = this.add.circle(w/2 - 100, h/2 - 150, 60, 0x008800).setStrokeStyle(6, 0x00ff00);
        this.add.text(w/2 - 100, h/2 - 150, '2', { font: 'bold 40px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(w/2 - 100, h/2 - 150 + 90, 'MAP 2\nCối Xay Gió', { font: 'bold 20px Arial', fill: '#00ff00', align: 'center' }).setOrigin(0.5);
        map2.setInteractive({ useHandCursor: true });
        this.tweens.add({ targets: map2, scale: 1.1, duration: 1000, yoyo: true, repeat: -1 });
        map2.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 255, 255, 255);
            this.time.delayedCall(500, () => this.scene.start('TransitionScene'));
        });

        // Map 3: Map3Scene
        let map3 = this.add.circle(w/2 + 100, h/2 + 50, 50, 0x0e5e77).setStrokeStyle(6, 0x0bc2e2);
        this.add.text(w/2 + 100, h/2 + 50, '3', { font: 'bold 30px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(w/2 + 100, h/2 + 50 + 80, 'MAP 3\nLàng Sen', { font: 'bold 20px Arial', fill: '#0bc2e2', align: 'center' }).setOrigin(0.5);
        map3.setInteractive({ useHandCursor: true });
        this.tweens.add({ targets: map3, scale: 1.1, duration: 1000, yoyo: true, repeat: -1 });
        map3.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 255, 255, 255);
            this.time.delayedCall(500, () => this.scene.start('Map3Scene'));
        });

        // Map 4: Map4Scene
        let map4 = this.add.circle(w/2 + 300, h/2 - 100, 50, 0x880000).setStrokeStyle(6, 0xff5555);
        this.add.text(w/2 + 300, h/2 - 100, '4', { font: 'bold 30px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(w/2 + 300, h/2 - 100 + 80, 'MAP 4\nThái Dương', { font: 'bold 20px Arial', fill: '#ff5555', align: 'center' }).setOrigin(0.5);
        map4.setInteractive({ useHandCursor: true });
        this.tweens.add({ targets: map4, scale: 1.1, duration: 1000, yoyo: true, repeat: -1 });
        map4.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 255, 255, 255);
            this.time.delayedCall(500, () => this.scene.start('Map4Scene'));
        });

        // Map 5: Map5Scene
        let map5 = this.add.circle(w/2 + 450, h/2 + 50, 50, 0x4a154b).setStrokeStyle(6, 0xd980fa);
        this.add.text(w/2 + 450, h/2 + 50, '5', { font: 'bold 30px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(w/2 + 450, h/2 + 50 + 80, 'MAP 5\nDạ Nấm', { font: 'bold 20px Arial', fill: '#d980fa', align: 'center' }).setOrigin(0.5);
        map5.setInteractive({ useHandCursor: true });
        this.tweens.add({ targets: map5, scale: 1.1, duration: 1000, yoyo: true, repeat: -1 });
        map5.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 255, 255, 255);
            this.time.delayedCall(500, () => this.scene.start('Map5Scene'));
        });

        let backContainer = this.add.container(130, 60);
        let backBg = this.add.rectangle(0, 0, 200, 46, 0x1e272e, 0.9)
            .setStrokeStyle(2, 0x00d2d3)
            .setInteractive({ useHandCursor: true });
        let backText = this.add.text(0, 0, '⬅ QUAY LẠI', { font: 'bold 18px Arial', fill: '#00d2d3' }).setOrigin(0.5);
        backContainer.add([backBg, backText]);

        backBg.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('MenuScene'));
        });
        backBg.on('pointerover', () => {
            backBg.setFillStyle(0x00d2d3);
            backText.setFill('#1e272e');
        });
        backBg.on('pointerout', () => {
            backBg.setFillStyle(0x1e272e);
            backText.setFill('#00d2d3');
        });
    }

}