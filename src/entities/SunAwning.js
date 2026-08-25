import AssetManager from '../utils/AssetManager.js';

export default class SunAwning extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width = 200, height = 180) {
        super(scene, x, y);
        scene.add.existing(this);

        this.awningWidth = width;
        this.awningHeight = height;

        // Sinh placeholder cho mái hiên
        AssetManager.generateAndSave(scene, 'sun_awning', width, 50, (g) => {
            // Mái vòm sọc cam / trắng phong cách sa mạc
            let seg = width / 6;
            for (let i = 0; i < 6; i++) {
                g.fillStyle(i % 2 === 0 ? 0xe67e22 : 0xf1c40f, 1);
                g.fillRect(i * seg, 0, seg, 40);
                g.fillEllipse(i * seg + seg / 2, 40, seg, 20);
            }
            g.lineStyle(2, 0xd35400, 1);
            g.strokeRect(0, 0, width, 40);
        });

        // Hình ảnh mái hiên
        this.roof = scene.add.image(0, 0, 'sun_awning').setOrigin(0.5, 0);
        
        // Cột chống
        this.pillarLeft = scene.add.rectangle(-width / 2 + 10, height / 2, 8, height, 0x8e44ad, 0.7);
        this.pillarRight = scene.add.rectangle(width / 2 - 10, height / 2, 8, height, 0x8e44ad, 0.7);

        // Vùng bóng râm mờ ảo bên dưới mái
        this.shadeGfx = scene.add.graphics();
        this.shadeGfx.fillStyle(0x000000, 0.25);
        this.shadeGfx.fillRect(-width / 2 + 5, 40, width - 10, height - 40);

        this.add([this.shadeGfx, this.pillarLeft, this.pillarRight, this.roof]);

        // Hitbox bóng râm để kiểm tra nhân vật đứng dưới
        this.shadeBounds = new Phaser.Geom.Rectangle(
            x - width / 2 + 5,
            y + 40,
            width - 10,
            height - 30
        );

        this.setDepth(4);
    }

    /**
     * Kiểm tra xem nhân vật có đang đứng trong vùng bóng râm của mái hiên này không
     */
    isUnder(player) {
        if (!player || !player.hitbox) return false;
        let px = player.hitbox.x;
        let py = player.hitbox.y;
        return this.shadeBounds.contains(px, py);
    }
}
