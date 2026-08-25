class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        let loadingText = this.add.text(640, 360, 'Đang tải...', { font: '32px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);
    }

    create() {
        // Khởi tạo Global State cho Sinh Tồn RPG
        this.registry.set('health', 100);
        this.registry.set('water', 50); // 0-100
        this.registry.set('sun', 50);   // 0-100
        this.registry.set('psyche', 100); // 0-100
        this.registry.set('coins', 100);

        // Hảo cảm NPC (0-100)
        this.registry.set('affinity_map1', 50);
        this.registry.set('affinity_map2', 50);
        this.registry.set('affinity_map3', 50);
        this.registry.set('affinity_map4', 50);
        this.registry.set('affinity_map5', 50);

        this.scene.start('MenuScene');
    }
}
