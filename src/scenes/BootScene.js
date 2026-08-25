import AssetManager from '../utils/AssetManager.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.add.text(640, 360, 'Đang tải...', { font: '32px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);
        AssetManager.preloadAll(this);
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

        this.scene.start('MenuScene');
    }
}