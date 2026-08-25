export default class AtmosphereFX {
    /**
     * Tạo các vệt sáng chiếu xuyên không gian (God Rays / Volumetric Light Beams)
     * @param {Phaser.Scene} scene 
     * @param {Object} config { x, y, count, width, height, angle, color, alpha }
     */
    static createGodRays(scene, config = {}) {
        const {
            startX = 0,
            endX = scene.cameras.main.width * 6,
            topY = 0,
            bottomY = scene.cameras.main.height + 600,
            rayCount = 8,
            color = 0xfffae0,
            baseAlpha = 0.12,
            tilt = 350
        } = config;

        let container = scene.add.container(0, 0).setDepth(8).setScrollFactor(0.7);

        for (let i = 0; i < rayCount; i++) {
            let rx = Phaser.Math.Between(startX, endX);
            let topWidth = Phaser.Math.Between(60, 160);
            let bottomWidth = topWidth * Phaser.Math.FloatBetween(2.0, 3.5);

            let g = scene.add.graphics();
            g.fillStyle(color, baseAlpha * Phaser.Math.FloatBetween(0.7, 1.3));
            g.beginPath();
            g.moveTo(rx, topY);
            g.lineTo(rx + topWidth, topY);
            g.lineTo(rx + topWidth + tilt + bottomWidth, bottomY);
            g.lineTo(rx + tilt, bottomY);
            g.closePath();
            g.fillPath();
            g.setBlendMode('ADD');

            container.add(g);

            // Hoạt ảnh lung linh nhấp nhô của từng tia sáng
            scene.tweens.add({
                targets: g,
                alpha: { from: g.alpha * 0.5, to: g.alpha * 1.5 },
                x: { from: -15, to: 15 },
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: i * 400
            });
        }

        // Hạt bụi vàng lơ lửng trong luồng sáng (Dust Motes)
        let dustEmitter = scene.add.particles(0, 0, 'firefly', {
            x: { min: startX, max: endX },
            y: { min: topY, max: bottomY },
            speedX: { min: -15, max: 25 },
            speedY: { min: -10, max: -35 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 4500,
            blendMode: 'ADD',
            frequency: 180,
            tint: color
        }).setDepth(9).setScrollFactor(0.8);

        return { container, dustEmitter };
    }

    /**
     * Tạo vầng hào quang phát sáng 3 lớp (3-Tier Dynamic Bloom) cho nhân vật Mầm
     * @param {Phaser.Scene} scene 
     * @param {Phaser.GameObjects.Sprite} targetSprite 
     */
    static createPlayerBloom(scene, targetSprite) {
        let initialColor = scene.registry.get('playerColor') || 0x2ecc71;

        let container = scene.add.container(targetSprite.x, targetSprite.y).setDepth(targetSprite.depth - 1);

        // Lớp 1: Lõi sáng rực (Core Light)
        let coreLight = scene.add.circle(0, -25, 36, initialColor, 0.45).setBlendMode('ADD');
        // Lớp 2: Hào quang tỏa dịu (Ambient Aura)
        let midAura = scene.add.circle(0, -25, 80, initialColor, 0.2).setBlendMode('ADD');
        // Lớp 3: Vành nhật hoa huyền ảo (Faint Corona)
        let outerCorona = scene.add.circle(0, -25, 140, initialColor, 0.08).setBlendMode('ADD');

        container.add([outerCorona, midAura, coreLight]);

        // Hoạt ảnh "thở" (Breathing Pulse)
        scene.tweens.add({
            targets: [midAura, outerCorona],
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Lắng nghe thay đổi màu sắc trang phục
        let colorListener = (parent, color) => {
            coreLight.setFillStyle(color, 0.45);
            midAura.setFillStyle(color, 0.2);
            outerCorona.setFillStyle(color, 0.08);
        };
        scene.registry.events.on('changedata-playerColor', colorListener);

        return {
            container,
            update: (x, y) => {
                container.setPosition(x, y);
            },
            destroy: () => {
                scene.registry.events.off('changedata-playerColor', colorListener);
                container.destroy();
            }
        };
    }

    /**
     * Tạo viền tối điện ảnh (Cinematic Vignette) cho màn hình
     * @param {Phaser.Scene} scene 
     */
    static createCinematicVignette(scene) {
        const w = scene.cameras.main.width;
        const h = scene.cameras.main.height;

        let g = scene.add.graphics().setScrollFactor(0).setDepth(2450);
        
        // Vẽ 4 góc tối mềm mại
        let maxRadius = Math.sqrt(w*w + h*h) / 2;
        let ringCount = 12;
        for (let i = ringCount; i >= 0; i--) {
            let progress = i / ringCount; // 1 -> 0
            let r = maxRadius * (0.6 + progress * 0.4);
            let alpha = Math.pow(progress, 2.2) * 0.55;
            g.lineStyle(maxRadius * 0.08, 0x050811, alpha);
            g.strokeCircle(w / 2, h / 2, r);
        }

        return g;
    }
}
