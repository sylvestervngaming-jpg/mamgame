import AssetManager from '../utils/AssetManager.js';

export default class Windmill extends Phaser.GameObjects.Container {
    constructor(scene, x, y, groundDepthY) {
        super(scene, x, y);
        this.speed = Phaser.Math.FloatBetween(0.01, 0.03);
        
        let bodyHeight = groundDepthY - y;
        
        // --- AUTO-EXPORT WINDMILL BODY ---
        AssetManager.generateAndSave(scene, 'windmill_body', 100, bodyHeight + 22, (g) => {
            // Draw relative to 0,0 
            // We want the roof at (50, 22) so it matches origin
            g.fillStyle(0xffffff, 0.9);
            g.beginPath();
            g.moveTo(0, bodyHeight + 22); 
            g.lineTo(100, bodyHeight + 22);
            g.lineTo(70, 22);
            g.lineTo(30, 22);
            g.fillPath();
            
            // Roof
            g.fillStyle(0xcc5500, 1);
            g.fillCircle(50, 22, 22);
        });

        // --- AUTO-EXPORT WINDMILL BLADE ---
        AssetManager.generateAndSave(scene, 'windmill_blade', 10, 100, (g) => {
            g.fillStyle(0xddcc99, 1);
            g.fillRect(0, 0, 10, 100);
        });

        // --- AUTO-EXPORT WINDMILL HUB ---
        AssetManager.generateAndSave(scene, 'windmill_hub', 20, 20, (g) => {
            g.fillStyle(0x8b4513, 1);
            g.fillCircle(10, 10, 10);
        });

        let body = scene.add.image(0, 0, 'windmill_body').setOrigin(0.5, 22 / (bodyHeight + 22));
        this.add(body);
        
        this.blades = scene.add.container(0, 0);
        for(let j=0; j<4; j++) {
            let blade = scene.add.image(0, 0, 'windmill_blade').setOrigin(0.5, 1);
            blade.rotation = (Math.PI / 2) * j;
            this.blades.add(blade);
        }
        
        let hub = scene.add.image(0, 0, 'windmill_hub').setOrigin(0.5, 0.5);
        this.blades.add(hub);
        
        this.add(this.blades);
        this.setScrollFactor(0.5);
        scene.add.existing(this);
    }

    updateLogic() {
        this.blades.rotation += this.speed;
    }
}