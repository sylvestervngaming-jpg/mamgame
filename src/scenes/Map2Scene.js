import CollectibleItem from '../entities/CollectibleItem.js';
import AssetManager from '../utils/AssetManager.js';
import Player from '../entities/Player.js';
import Windmill from '../entities/Windmill.js';
import TerrainGenerator from '../environment/TerrainGenerator.js';

/**
 * Scene for the second map (Windmill Kingdom).
 * @class
 * @extends Phaser.Scene
 */
export default class Map2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Map2Scene' });
    }

    preload() {}

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.mapW = w * 4;

        // Setup UI
        this.registry.set('showUI', true);
        this.registry.set('showSurvival', false);
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');

        this.physics.world.setBounds(0, 0, this.mapW, h);
        this.cameras.main.setBounds(0, 0, this.mapW, h);

        // --- BACKGROUND ---
        this.add.rectangle(0, 0, this.mapW, h, 0x87CEEB).setOrigin(0, 0);
        
        // Sun (Auto-Export)
        AssetManager.generateAndSave(this, 'sun', 120, 120, (g) => {
            g.fillStyle(0xFFDF00, 1);
            g.fillCircle(60, 60, 60);
        });
        this.add.image(w - 150, 150, 'sun').setScrollFactor(0.1);
        
        // Cloud (Auto-Export)
        AssetManager.generateAndSave(this, 'cloud', 140, 80, (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillCircle(70, 40, 40);
            g.fillCircle(110, 50, 30);
            g.fillCircle(30, 50, 30);
        });

        for(let i=0; i<20; i++) {
            let cx = Phaser.Math.Between(0, this.mapW);
            let cy = Phaser.Math.Between(50, 250);
            let alpha = Phaser.Math.FloatBetween(0.6, 0.9);
            let scale = Phaser.Math.FloatBetween(0.5, 1.2);
            
            let cloudImg = this.add.image(cx, cy, 'cloud').setAlpha(alpha).setScale(scale);
            
            this.tweens.add({
                targets: cloudImg,
                x: cx + Phaser.Math.Between(50, 150),
                duration: Phaser.Math.Between(10000, 20000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // --- CỐI XAY GIÓ (OOP Entities) ---
        this.windmills = [];
        for(let i = 0; i < 5; i++) {
            let wx = 400 + i * 800 + Phaser.Math.Between(-100, 100);
            let wy = h - 350;
            let wm = new Windmill(this, wx, wy, h + 500);
            this.windmills.push(wm);
        }

        // --- MẶT ĐẤT (Procedural Generator) ---
        this.groundGroup = TerrainGenerator.generateGrassTerrain(this, this.mapW, h);

        // Hoa cỏ (Auto-Export)
        AssetManager.generateAndSave(this, 'flower_stem', 2, 15, (g) => {
            g.fillStyle(0x006400, 1);
            g.fillRect(0, 0, 2, 15);
        });
        AssetManager.generateAndSave(this, 'flower_petal', 14, 14, (g) => {
            g.fillStyle(0xffffff, 1); // Màu trắng để dễ tint
            g.fillCircle(7, 7, 7);
        });

        let flowerColors = [0xff0000, 0xffff00, 0xff00ff, 0xffa500, 0xffffff];
        for(let i=0; i<200; i++) {
            let fx = Phaser.Math.Between(50, this.mapW - 50);
            let fy = TerrainGenerator.getGrassTerrainY(fx, this.mapW, h);
            
            let stem = this.add.image(fx, fy, 'flower_stem').setOrigin(0.5, 1);
            let fcolor = Phaser.Utils.Array.GetRandom(flowerColors);
            
            let petalSize = Phaser.Math.FloatBetween(0.5, 1.2);
            let petal = this.add.image(fx, fy - 15, 'flower_petal')
                .setOrigin(0.5, 0.5)
                .setTint(fcolor)
                .setScale(petalSize);
            
            this.tweens.add({
                targets: [stem, petal],
                x: fx + Phaser.Math.Between(-5, 5),
                duration: Phaser.Math.Between(1500, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Hạt bay
        AssetManager.generateAndSave(this, 'petal', 8, 4, (g) => {
            g.fillStyle(0xffc0cb, 1);
            g.fillEllipse(4, 2, 4, 2);
        });
        this.add.particles(0, 0, 'petal', {
            x: { min: 0, max: this.mapW },
            y: { min: h - 300, max: h - 50 },
            lifespan: 6000,
            speedX: { min: 50, max: 150 },
            speedY: { min: -20, max: 20 },
            scale: { start: 1, end: 0.5 },
            alpha: { start: 1, end: 0 },
            rotate: { start: 0, end: 360 },
            frequency: 150,
            quantity: 2
        }).setDepth(8);

        // --- PLAYER (OOP Entity) ---
        this.playerObj = new Player(this, 200, h - 250);
        this.physics.add.collider(this.playerObj.hitbox, this.groundGroup);

        // --- CÁC VẬT PHẨM THU THẬP TRÊN MAP 2 ---
        this.itemGroup = this.physics.add.staticGroup();
        const m2Items = [
            { x: 600, y: h - 260, type: 'dewdrop' },
            { x: 1200, y: h - 260, type: 'coin' },
            { x: 1800, y: h - 260, type: 'seed' },
            { x: 2400, y: h - 260, type: 'dewdrop' },
            { x: 2800, y: h - 260, type: 'potion' }
        ];
        m2Items.forEach(i => {
            let item = new CollectibleItem(this, i.x, i.y, i.type);
            this.itemGroup.add(item);
        });
        this.physics.add.overlap(this.playerObj.hitbox, this.itemGroup, (hitbox, item) => item.collect(hitbox));

        this.cameras.main.startFollow(this.playerObj.hitbox, true, 0.1, 0.1, -w/4, 100);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.endZone = this.add.rectangle(this.mapW - 100, h/2, 200, h, 0x00ff00, 0).setOrigin(0.5, 0.5);
        this.physics.add.existing(this.endZone, true);
        this.hasReachedEnd = false;
        
        this.add.text(400, h - 250, 'Vương quốc cối xay gió - Cứ thong thả tận hưởng gió mát', { font: 'bold 24px Arial', fill: '#ffffff', backgroundColor: '#000000aa', padding: {x: 10, y: 5}}).setOrigin(0.5).setDepth(15);
    }

    update(time, delta) {
        this.windmills.forEach(wm => wm.updateLogic());

        if (this.hasReachedEnd) return;

        let groundY = TerrainGenerator.getGrassTerrainY(this.playerObj.hitbox.x, this.mapW, this.cameras.main.height);
        this.playerObj.updateLogic(this.cursors, this.spaceKey, groundY);

        if (this.playerObj.hitbox.x > this.mapW - 200 && !this.hasReachedEnd) {
            this.hasReachedEnd = true;
            this.playerObj.hitbox.body.setVelocityX(0);
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.time.delayedCall(1500, () => {
                this.scene.stop('UIScene');
                this.scene.start('Map3Scene');
            });
        }
    }
}