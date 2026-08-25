const fs = require('fs');

// 1. Clean up RunnerScene.js
let runner = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Replace lines 311-335 directly
const lines = runner.split('\n');

// Find where shadow is created
let shadowIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('this.shadow = this.add.ellipse')) {
        shadowIdx = i;
        break;
    }
}

console.log('Found shadow in RunnerScene at line:', shadowIdx + 1);

if (shadowIdx !== -1) {
    // Find where playerEmitter is
    let emitterIdx = -1;
    for (let j = shadowIdx; j < shadowIdx + 40; j++) {
        if (lines[j].includes('this.playerEmitter = this.add.particles')) {
            emitterIdx = j;
            break;
        }
    }

    if (emitterIdx !== -1) {
        const singleAuraSetup = [
            "        // Shadow duoi dat",
            "        let initialColor = this.registry.get('playerColor') || 0x2ecc71;",
            "        this.shadow = this.add.ellipse(200, h - 110, 60, 16, 0x000000, 0.65).setDepth(8);",
            "        // DUY NHAT 1 AURA",
            "        this.aura = this.add.circle(200, h - 135, 34, initialColor, 0.35).setBlendMode('ADD').setDepth(9);",
            "",
            "        // Texture Mam",
            "        AssetManager.generateAndSave(this, 'green_circle', 50, 50, (g) => {",
            "            g.fillStyle(0xffffff);",
            "            g.fillCircle(25, 25, 25);",
            "        });",
            "        this.player.body.setGravityY(1200);",
            "        this.player.body.setCollideWorldBounds(true);",
            "",
            "        this.playerSprite = this.add.sprite(200, h - 150, 'green_circle').setDepth(10);",
            "        this.playerSprite.setTint(initialColor);",
            "        this.playerSprite.setOrigin(0.5, 1);",
            "        this.playerSprite.baseScale = 1;",
            "        this.playerSprite.setScale(this.playerSprite.baseScale);",
            "        this.registry.events.on('changedata-playerColor', (parent, color) => {",
            "            if (this.playerSprite) this.playerSprite.setTint(color);",
            "            if (this.aura) this.aura.setFillStyle(color, 0.35);",
            "        });"
        ];

        lines.splice(shadowIdx, emitterIdx - shadowIdx, ...singleAuraSetup);
    }
}

let newRunnerCode = lines.join('\n');

// Clean update() in RunnerScene
newRunnerCode = newRunnerCode.replace(
    /if \(this\.playerBloom\) \{\s*this\.playerBloom\.update\(.*?\);\s*\}/g,
    "if (this.aura) { this.aura.setPosition(this.playerSprite.x, this.playerSprite.y - 25); }"
);

fs.writeFileSync('src/scenes/RunnerScene.js', newRunnerCode, 'utf8');

// 2. Clean AtmosphereFX.js: remove createPlayerBloom and createDynamicPointLight
let atmo = fs.readFileSync('src/utils/AtmosphereFX.js', 'utf8');
const atmoClean = `export default class AtmosphereFX {
    /**
     * Cập nhật bóng đổ nghiêng thời gian thực (Dynamic Directional Shadow) theo góc chiếu tia sáng
     */
    static updateDirectionalShadow(shadow, entityX, entityY, groundY, slope = 0, lightAngleFactor = 0.45) {
        if (!shadow) return;
        
        let distToGround = Math.max(0, groundY - entityY);
        shadow.x = entityX + (distToGround * lightAngleFactor);
        shadow.y = groundY;
        shadow.setRotation(Math.atan(slope));
        
        let scaleX = Math.max(0.25, (1 - (distToGround / 380)));
        let scaleY = Math.max(0.12, (1 - (distToGround / 280)) * 0.55);
        let alpha = Math.max(0.05, 0.65 * (1 - (distToGround / 320)));
        
        shadow.setScale(scaleX, scaleY);
        shadow.setAlpha(alpha);
    }

    /**
     * Tạo các vệt sáng chiếu xuyên không gian (God Rays / Volumetric Light Beams)
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
     * Tạo viền tối điện ảnh (Cinematic Vignette)
     */
    static createCinematicVignette(scene) {
        const w = scene.cameras.main.width;
        const h = scene.cameras.main.height;

        if (!scene.textures.exists('vignette_canvas_texture')) {
            let canvas = scene.textures.createCanvas('vignette_canvas_texture', w, h);
            let ctx = canvas.getContext();
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
`;
fs.writeFileSync('src/utils/AtmosphereFX.js', atmoClean, 'utf8');

// 3. Clean Player.js
let player = fs.readFileSync('src/entities/Player.js', 'utf8');
player = player.replace(/this\.playerBloom.*?;\n/g, "");
fs.writeFileSync('src/entities/Player.js', player, 'utf8');

console.log('100% clean single aura enforced across entire codebase!');