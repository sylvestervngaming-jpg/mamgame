const fs = require('fs');

// 1. Clean up RunnerScene.js: Keep ONLY ONE SINGLE AURA
let runnerCode = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Replace shadow and aura setup around lines 310-335
const oldRunnerSetup = `        // Player Shadow & Aura (Polish)
        this.shadow = this.add.ellipse(200, h - 110, 60, 16, 0x000000, 0.65).setDepth(9);
        this.playerGroundLight = AtmosphereFX.createDynamicPointLight(this, 200, h - 110, 140, 0x2ecc71, 0.22);
        this.registry.events.on('changedata-playerColor', (parent, color) => {
            if (this.playerGroundLight) this.playerGroundLight.setTint(color);
        });
        this.playerBloom = AtmosphereFX.createPlayerBloom(this, this.player);

        // TÃ¡ÂºÂ¡o texture hÃƒÂ¬nh trÃƒÂ²n xanh lÃƒÂ¡ nÃ¡ÂºÂ¿u chÃ†Â°a cÃƒÂ³
        AssetManager.generateAndSave(this, 'green_circle', 50, 50, (g) => {
            g.fillStyle(0xffffff);
            g.fillCircle(25, 25, 25);
        });
        this.player.body.setGravityY(1200);
        this.player.body.setCollideWorldBounds(true);

        // ThÃƒÂªm hÃƒÂ¬nh trÃƒÂ²n xanh lÃƒÂ¡ lÃƒÂ m Sprite tÃ¡ÂºÂ¡m thÃ¡Â»Â i
        let initialColor = this.registry.get('playerColor') || 0x2ecc71;
        if (this.aura) this.aura.setFillStyle(initialColor, 0.15);
        this.playerSprite = this.add.sprite(200, h - 150, 'green_circle').setDepth(10);
        this.playerSprite.setTint(initialColor);
        this.registry.events.on('changedata-playerColor', (parent, color) => {
            if (this.playerSprite) this.playerSprite.setTint(color);
            if (this.aura) this.aura.setFillStyle(color, 0.15);
        });`;

const newRunnerSetup = `        // Player Shadow & DUY NHẤT 1 AURA
        let initialColor = this.registry.get('playerColor') || 0x2ecc71;
        this.shadow = this.add.ellipse(200, h - 110, 60, 16, 0x000000, 0.65).setDepth(8);
        this.aura = this.add.circle(200, h - 150 - 25, 42, initialColor, 0.28).setBlendMode('ADD').setDepth(9);

        // Texture Mầm
        AssetManager.generateAndSave(this, 'green_circle', 50, 50, (g) => {
            g.fillStyle(0xffffff);
            g.fillCircle(25, 25, 25);
        });
        this.player.body.setGravityY(1200);
        this.player.body.setCollideWorldBounds(true);

        this.playerSprite = this.add.sprite(200, h - 150, 'green_circle').setDepth(10);
        this.playerSprite.setTint(initialColor);
        this.registry.events.on('changedata-playerColor', (parent, color) => {
            if (this.playerSprite) this.playerSprite.setTint(color);
            if (this.aura) this.aura.setFillStyle(color, 0.28);
        });`;

runnerCode = runnerCode.replace(oldRunnerSetup, newRunnerSetup);

// Clean up RunnerScene update sync
const oldRunnerUpdateSync = `        // Sync sprite to invisible physics body LUÃƒâ€ N LUÃƒâ€ N CHÃ¡ÂºÂ Y
        this.playerSprite.x = this.player.x;
        this.playerSprite.y = this.player.y + 40;
        if (this.playerBloom) {
            this.playerBloom.update(this.player.x, this.player.y + 40);
        }`;

const newRunnerUpdateSync = `        // Sync sprite & DUY NHẤT 1 AURA đúng tâm Mầm
        this.playerSprite.x = this.player.x;
        this.playerSprite.y = this.player.y + 40;
        if (this.aura) {
            this.aura.setPosition(this.playerSprite.x, this.playerSprite.y - 25);
        }`;

runnerCode = runnerCode.replace(oldRunnerUpdateSync, newRunnerUpdateSync);

// Clean up bottom of shadow update (remove playerGroundLight)
runnerCode = runnerCode.replace(
    "if (this.playerGroundLight) {\n            this.playerGroundLight.setPosition(this.player.x, groundY - 5);\n        }",
    ""
);

fs.writeFileSync('src/scenes/RunnerScene.js', runnerCode, 'utf8');

// 2. Clean up Player.js: Keep ONLY ONE SINGLE AURA
let playerCode = fs.readFileSync('src/entities/Player.js', 'utf8');

// Remove playerBloom from Player.js
playerCode = playerCode.replace("this.playerBloom = AtmosphereFX.createPlayerBloom(scene, this);", "this.aura = scene.add.circle(x, y - 25, 42, initialColor, 0.28).setBlendMode('ADD').setDepth(9);");
playerCode = playerCode.replace("if (this.playerBloom) this.playerBloom.update(this.x, this.y - 20);", "if (this.aura) this.aura.setPosition(this.x, this.y - 25);");
playerCode = playerCode.replace("this.setTint(color);", "this.setTint(color);\n            if (this.aura) this.aura.setFillStyle(color, 0.28);");

fs.writeFileSync('src/entities/Player.js', playerCode, 'utf8');

console.log('Cleaned up all duplicate aura objects! Exactly 1 single perfectly centered aura remains.');