const fs = require('fs');

// 1. Create src/utils/AtmosphereFX.js
const atmosphereCode = `export default class AtmosphereFX {
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
`;
fs.writeFileSync('src/utils/AtmosphereFX.js', atmosphereCode, 'utf8');

// 2. Integrate AtmosphereFX into UIScene.js (Vignette)
let uiCode = fs.readFileSync('src/scenes/UIScene.js', 'utf8');
if (!uiCode.includes('AtmosphereFX')) {
    uiCode = "import AtmosphereFX from '../utils/AtmosphereFX.js';\n" + uiCode;
    uiCode = uiCode.replace(
        "this.toastContainer = this.add.container(0, 0).setDepth(2600).setScrollFactor(0);",
        "this.toastContainer = this.add.container(0, 0).setDepth(2600).setScrollFactor(0);\n        AtmosphereFX.createCinematicVignette(this);"
    );
    fs.writeFileSync('src/scenes/UIScene.js', uiCode, 'utf8');
}

// 3. Integrate God Rays & Bloom into Map 1 (RunnerScene.js)
let runnerCode = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');
if (!runnerCode.includes('AtmosphereFX')) {
    runnerCode = "import AtmosphereFX from '../utils/AtmosphereFX.js';\n" + runnerCode;
    
    // Add God Rays right after background in create()
    const bgPattern = "for (let bi = 0; bi < 6; bi++) {";
    const godRaysCode = `// --- ÁNH SÁNG ĐIỆN ẢNH (GOD RAYS) ---
        AtmosphereFX.createGodRays(this, {
            startX: 0,
            endX: w * 6,
            color: 0xffeaa7,
            baseAlpha: 0.14,
            tilt: 400
        });\n\n        for (let bi = 0; bi < 6; bi++) {`;
    runnerCode = runnerCode.replace(bgPattern, godRaysCode);

    // Replace old single-circle aura with 3-tier dynamic bloom
    const oldAura = `this.shadow = this.add.ellipse(200, h - 110, 60, 15, 0x000000, 0.6);
        this.aura = this.add.circle(200, h - 150, 70, 0x88ff88, 0.15);
        this.aura.setBlendMode('ADD');`;
    const newAura = `this.shadow = this.add.ellipse(200, h - 110, 60, 15, 0x000000, 0.6);
        this.playerBloom = AtmosphereFX.createPlayerBloom(this, this.player);`;
    runnerCode = runnerCode.replace(oldAura, newAura);

    // Update playerBloom position in update() loop
    runnerCode = runnerCode.replace(
        "if (this.aura) { this.aura.x = pX; this.aura.y = pY; }",
        "if (this.playerBloom) { this.playerBloom.update(pX, pY); }"
    );

    fs.writeFileSync('src/scenes/RunnerScene.js', runnerCode, 'utf8');
}

// 4. Integrate Bloom & Item Glow into Player.js and CollectibleItem.js
let playerCode = fs.readFileSync('src/entities/Player.js', 'utf8');
if (!playerCode.includes('AtmosphereFX')) {
    playerCode = "import AtmosphereFX from '../utils/AtmosphereFX.js';\n" + playerCode;
    playerCode = playerCode.replace(
        "this.shadow = scene.add.ellipse(x, y + 20, 60, 15, 0x000000, 0.6).setDepth(9);",
        `this.shadow = scene.add.ellipse(x, y + 20, 60, 15, 0x000000, 0.6).setDepth(9);
        this.playerBloom = AtmosphereFX.createPlayerBloom(scene, this);`
    );
    playerCode = playerCode.replace(
        "this.x = this.hitbox.x;",
        "this.x = this.hitbox.x;\n        if (this.playerBloom) this.playerBloom.update(this.x, this.y - 20);"
    );
    fs.writeFileSync('src/entities/Player.js', playerCode, 'utf8');
}

// 5. CollectibleItem glow
let itemCode = fs.readFileSync('src/entities/CollectibleItem.js', 'utf8');
if (!itemCode.includes('glowRing')) {
    const itemGlowCode = `        // Hào quang tỏa sáng của vật phẩm
        this.glowRing = scene.add.circle(x, y, 22, 0xffffff, 0.25).setBlendMode('ADD').setDepth(11);
        scene.tweens.add({
            targets: this.glowRing,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.45,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });`;

    itemCode = itemCode.replace(
        "this.setDepth(12);",
        "this.setDepth(12);\n" + itemGlowCode
    );
    itemCode = itemCode.replace(
        "this.destroy();",
        "if (this.glowRing) this.glowRing.destroy();\n        this.destroy();"
    );
    fs.writeFileSync('src/entities/CollectibleItem.js', itemCode, 'utf8');
}

// 6. Integrate God Rays into Map 2, Map 3, Map 4
let map2Code = fs.readFileSync('src/scenes/Map2Scene.js', 'utf8');
if (!map2Code.includes('AtmosphereFX')) {
    map2Code = "import AtmosphereFX from '../utils/AtmosphereFX.js';\n" + map2Code;
    map2Code = map2Code.replace(
        "this.cameras.main.fadeIn(1000, 0, 0, 0);",
        `this.cameras.main.fadeIn(1000, 0, 0, 0);
        AtmosphereFX.createGodRays(this, { startX: 0, endX: w * 6, color: 0x55efc4, baseAlpha: 0.12, tilt: 350 });`
    );
    fs.writeFileSync('src/scenes/Map2Scene.js', map2Code, 'utf8');
}

let map3Code = fs.readFileSync('src/scenes/Map3Scene.js', 'utf8');
if (!map3Code.includes('AtmosphereFX')) {
    map3Code = "import AtmosphereFX from '../utils/AtmosphereFX.js';\n" + map3Code;
    map3Code = map3Code.replace(
        "this.cameras.main.fadeIn(1000, 0, 0, 0);",
        `this.cameras.main.fadeIn(1000, 0, 0, 0);
        AtmosphereFX.createGodRays(this, { startX: 0, endX: 4000, color: 0x81ecec, baseAlpha: 0.15, tilt: 250 });`
    );
    fs.writeFileSync('src/scenes/Map3Scene.js', map3Code, 'utf8');
}

let map4Code = fs.readFileSync('src/scenes/Map4Scene.js', 'utf8');
if (!map4Code.includes('AtmosphereFX')) {
    map4Code = "import AtmosphereFX from '../utils/AtmosphereFX.js';\n" + map4Code;
    map4Code = map4Code.replace(
        "this.cameras.main.fadeIn(1000, 0, 0, 0);",
        `this.cameras.main.fadeIn(1000, 0, 0, 0);
        AtmosphereFX.createGodRays(this, { startX: 0, endX: 5000, color: 0xfdcb6e, baseAlpha: 0.18, tilt: 420 });`
    );
    fs.writeFileSync('src/scenes/Map4Scene.js', map4Code, 'utf8');
}

console.log('Successfully integrated AtmosphereFX God Rays, Bloom, and Vignette across all scenes!');