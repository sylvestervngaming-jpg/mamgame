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
            rayCount = 7,
            color = 0xfffae0,
            baseAlpha = 0.12,
            tilt = 350
        } = config;

        // Đảm bảo texture hạt firefly luôn tồn tại để tránh hiện ô vuông xanh lá
        if (!scene.textures.exists('firefly')) {
            let g = scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 4);
            g.generateTexture('firefly', 8, 8);
            g.destroy();
        }

        let container = scene.add.container(0, 0).setDepth(8).setScrollFactor(0.7);

        for (let i = 0; i < rayCount; i++) {
            let rx = Phaser.Math.Between(startX, endX);
            let topWidth = Phaser.Math.Between(70, 150);
            let bottomWidth = topWidth * Phaser.Math.FloatBetween(2.0, 3.0);

            let g = scene.add.graphics();
            g.fillStyle(color, baseAlpha * Phaser.Math.FloatBetween(0.8, 1.2));
            g.beginPath();
            g.moveTo(rx, topY);
            g.lineTo(rx + topWidth, topY);
            g.lineTo(rx + topWidth + tilt + bottomWidth, bottomY);
            g.lineTo(rx + tilt, bottomY);
            g.closePath();
            g.fillPath();
            g.setBlendMode('ADD');

            container.add(g);

            scene.tweens.add({
                targets: g,
                alpha: { from: g.alpha * 0.6, to: g.alpha * 1.4 },
                x: { from: -10, to: 10 },
                duration: Phaser.Math.Between(3500, 6000),
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
            speedX: { min: -10, max: 20 },
            speedY: { min: -5, max: -30 },
            scale: { start: 0.7, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 4000,
            blendMode: 'ADD',
            frequency: 200,
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

        // Tạo texture hào quang mờ radial gradient siêu mịn (Không có viền sắc cạnh)
        if (!scene.textures.exists('soft_radial_glow')) {
            let canvas = scene.textures.createCanvas('soft_radial_glow', 256, 256);
            let ctx = canvas.getContext();
            let rad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
            rad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            rad.addColorStop(0.25, 'rgba(255, 255, 255, 0.6)');
            rad.addColorStop(0.55, 'rgba(255, 255, 255, 0.2)');
            rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = rad;
            ctx.fillRect(0, 0, 256, 256);
            canvas.refresh();
        }

        let container = scene.add.container(targetSprite.x, targetSprite.y).setDepth(9);

        // Ảnh hào quang tỏa sáng mềm mại đa lớp
        let innerGlow = scene.add.image(0, 0, 'soft_radial_glow')
            .setDisplaySize(90, 90)
            .setTint(initialColor)
            .setAlpha(0.6)
            .setBlendMode('ADD');

        let outerGlow = scene.add.image(0, 0, 'soft_radial_glow')
            .setDisplaySize(180, 180)
            .setTint(initialColor)
            .setAlpha(0.3)
            .setBlendMode('ADD');

        container.add([outerGlow, innerGlow]);

        // Hoạt ảnh tỏa sáng nhịp thở (Breathing Pulse)
        scene.tweens.add({
            targets: outerGlow,
            scaleX: 1.25,
            scaleY: 1.25,
            alpha: 0.15,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Lắng nghe thay đổi màu sắc trang phục
        let colorListener = (parent, color) => {
            innerGlow.setTint(color);
            outerGlow.setTint(color);
        };
        scene.registry.events.on('changedata-playerColor', colorListener);

        return {
            container,
            update: (x, y) => {
                // Đặt hào quang đúng ngay trọng tâm cơ thể của Mầm
                container.setPosition(x, y - 25);
            },
            destroy: () => {
                scene.registry.events.off('changedata-playerColor', colorListener);
                container.destroy();
            }
        };
    }

    /**
     * Tạo viền tối điện ảnh (Cinematic Vignette) bằng Canvas Gradient siêu mượt không tạo ngấn viền
     * @param {Phaser.Scene} scene 
     */
    static createCinematicVignette(scene) {
        const w = scene.cameras.main.width;
        const h = scene.cameras.main.height;

        if (!scene.textures.exists('vignette_canvas_texture')) {
            let canvas = scene.textures.createCanvas('vignette_canvas_texture', w, h);
            let ctx = canvas.getContext();
            
            // Radial gradient từ trong suốt ra tối nhẹ ở 4 góc
            let radGradient = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, Math.max(w, h) * 0.7);
            radGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            radGradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.1)');
            radGradient.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
            
            ctx.fillStyle = radGradient;
            ctx.fillRect(0, 0, w, h);
            canvas.refresh();
        }

        return scene.add.image(w / 2, h / 2, 'vignette_canvas_texture')
            .setScrollFactor(0)
            .setDepth(2450)
            .setAlpha(0.65);
    }
}
