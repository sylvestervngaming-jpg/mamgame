import AssetManager from '../utils/AssetManager.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.add.text(640, 360, 'Đang tải...', { font: '32px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);
        AssetManager.preloadAll(this);
        
        // Nạp các Sprite Sheet hoạt ảnh của Mầm
        this.load.spritesheet('mam_idle_sheet', 'assets/sprites/mam_anim_idle.png', { frameWidth: 96, frameHeight: 128 });
        this.load.spritesheet('mam_run_sheet', 'assets/sprites/mam_anim_run.png', { frameWidth: 96, frameHeight: 128 });
        this.load.spritesheet('mam_jump_sheet', 'assets/sprites/mam_anim_jump.png', { frameWidth: 96, frameHeight: 128 });
    }

    create() {
        // Global State cho Sinh Tồn
                this.registry.set('playerColor', 0x2ecc71); // Mầm Xanh lá mặc định
        this.registry.set('inventory', {
            seed: 0,
            dewdrop: 0,
            sun_crystal: 0,
            mushroom: 0,
            coin: 0,
            potion: 0
        });
        this.registry.set('health', 100);
        this.registry.set('water', 50); 
        this.registry.set('sun', 50);   
        this.registry.set('psyche', 100); 
        this.registry.set('coins', 100);

        this.registry.set('affinity_map1', 50);
        this.registry.set('affinity_map2', 50);
        this.registry.set('affinity_map3', 50);
        this.registry.set('affinity_map4', 50);
        this.registry.set('affinity_map5', 50);

                // Khởi tạo các texture hạt phát sáng cốt lõi
        AssetManager.generateAndSave(this, 'firefly', 8, 8, (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 4);
        });
        AssetManager.generateAndSave(this, 'smoke', 16, 16, (g) => {
            g.fillStyle(0xffffff, 0.5);
            g.fillCircle(8, 8, 8);
        });
        
        AssetManager.generateAndSave(this, 'green_circle', 50, 50, (g) => {
            g.fillStyle(0x2ecc71, 1);
            g.fillCircle(25, 25, 25);
        });
        
        // Khởi tạo các Animation toàn cục của Mầm
        if (!this.anims.exists('mam_idle_anim')) {
            this.anims.create({
                key: 'mam_idle_anim',
                frames: this.anims.generateFrameNumbers('mam_idle_sheet', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        }
        if (!this.anims.exists('mam_run_anim')) {
            this.anims.create({
                key: 'mam_run_anim',
                frames: this.anims.generateFrameNumbers('mam_run_sheet', { start: 0, end: 7 }),
                frameRate: 14,
                repeat: -1
            });
        }
        if (!this.anims.exists('mam_jump_anim')) {
            this.anims.create({
                key: 'mam_jump_anim',
                frames: this.anims.generateFrameNumbers('mam_jump_sheet', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }
        this.scene.start('MenuScene');
    }
}