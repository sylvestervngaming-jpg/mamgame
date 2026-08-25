const fs = require('fs');

// 1. Update AtmosphereFX.js with Realtime Dynamic Lighting & Directional Shadow utilities
let atmosphereCode = fs.readFileSync('src/utils/AtmosphereFX.js', 'utf8');

const newLightingUtils = `
    /**
     * Cập nhật bóng đổ nghiêng thời gian thực (Dynamic Directional Shadow) theo góc chiếu tia sáng
     * @param {Phaser.GameObjects.Shape} shadow 
     * @param {number} entityX 
     * @param {number} entityY 
     * @param {number} groundY 
     * @param {number} slope 
     * @param {number} lightAngleFactor 
     */
    static updateDirectionalShadow(shadow, entityX, entityY, groundY, slope = 0, lightAngleFactor = 0.45) {
        if (!shadow) return;
        
        let distToGround = Math.max(0, groundY - entityY);
        
        // Tọa độ bóng trượt nghiêng theo độ cao khi nhảy
        shadow.x = entityX + (distToGround * lightAngleFactor);
        shadow.y = groundY;
        
        // Xoay bóng theo độ dốc mặt đất
        shadow.setRotation(Math.atan(slope));
        
        // Co dãn và làm mờ bóng theo độ cao
        let scaleX = Math.max(0.25, (1 - (distToGround / 380)));
        let scaleY = Math.max(0.12, (1 - (distToGround / 280)) * 0.55);
        let alpha = Math.max(0.05, 0.65 * (1 - (distToGround / 320)));
        
        shadow.setScale(scaleX, scaleY);
        shadow.setAlpha(alpha);
    }

    /**
     * Tạo nguồn sáng điểm động thời gian thực (Dynamic Realtime Point Light)
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {number} color 
     * @param {number} intensity 
     */
    static createDynamicPointLight(scene, x, y, radius = 220, color = 0xfffae0, intensity = 0.35) {
        if (!scene.textures.exists('point_light_texture')) {
            let canvas = scene.textures.createCanvas('point_light_texture', 256, 256);
            let ctx = canvas.getContext();
            let rad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
            rad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            rad.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
            rad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
            rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = rad;
            ctx.fillRect(0, 0, 256, 256);
            canvas.refresh();
        }

        let light = scene.add.image(x, y, 'point_light_texture')
            .setDisplaySize(radius * 2, radius * 2)
            .setTint(color)
            .setAlpha(intensity)
            .setBlendMode('ADD')
            .setDepth(7);

        return light;
    }
`;

atmosphereCode = atmosphereCode.replace(
    "export default class AtmosphereFX {",
    "export default class AtmosphereFX {" + newLightingUtils
);
fs.writeFileSync('src/utils/AtmosphereFX.js', atmosphereCode, 'utf8');

// 2. Update RunnerScene.js with Realtime Directional Shadows and Dynamic Realtime Lighting
let runnerCode = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Add shadow under box
const oldBoxCreation = `        this.boxVisuals = this.add.container(3100, h - 110);
        let boxImg = this.add.image(0, -30, 'map1_box').setOrigin(0.5, 0.5);
        this.boxVisuals.add(boxImg);`;

const newBoxCreation = `        this.boxShadow = this.add.ellipse(3112, h - 110, 70, 16, 0x000000, 0.55).setDepth(4);
        this.boxVisuals = this.add.container(3100, h - 110).setDepth(15);
        let boxImg = this.add.image(0, -30, 'map1_box').setOrigin(0.5, 0.5);
        this.boxVisuals.add(boxImg);`;

runnerCode = runnerCode.replace(oldBoxCreation, newBoxCreation);

// Update box shadow position in update
const oldBoxPosUpdate = "this.boxVisuals.setPosition(boxTargetX, this.boxOrigY);";
const newBoxPosUpdate = `this.boxVisuals.setPosition(boxTargetX, this.boxOrigY);
            if (this.boxShadow) this.boxShadow.setPosition(boxTargetX + 12, this.boxOrigY);`;
runnerCode = runnerCode.replace(oldBoxPosUpdate, newBoxPosUpdate);

// Add dynamic ground illumination light under player in create()
const oldPlayerShadowSetup = "this.shadow = this.add.ellipse(200, h - 110, 60, 15, 0x000000, 0.6).setDepth(9);";
const newPlayerShadowSetup = `this.shadow = this.add.ellipse(200, h - 110, 60, 16, 0x000000, 0.65).setDepth(9);
        this.playerGroundLight = AtmosphereFX.createDynamicPointLight(this, 200, h - 110, 140, 0x2ecc71, 0.22);
        this.registry.events.on('changedata-playerColor', (parent, color) => {
            if (this.playerGroundLight) this.playerGroundLight.setTint(color);
        });`;
runnerCode = runnerCode.replace(oldPlayerShadowSetup, newPlayerShadowSetup);

// Update shadow & ground light in update() with AtmosphereFX.updateDirectionalShadow
const oldShadowUpdate = `        // BÃƒÂ³ng Ã„â€˜Ã¡Â»â€¢ (Shadow) phÃ¡ÂºÂ£i nÃ¡ÂºÂ±m vÃ„Â©nh viÃ¡Â»â€¦n trÃƒÂªn mÃ¡ÂºÂ·t Ã„â€˜Ã¡ÂºÂ¥t, vÃƒÂ  nhÃ¡ÂºÂ¡t dÃ¡ÂºÂ§n khi nhÃ¡ÂºÂ£y cao
        let groundY = this.getTerrainY(this.player.x);
        this.shadow.x = this.player.x;
        this.shadow.y = groundY;
        let distToGround = groundY - (this.player.y + 40);
        if (distToGround < 0) distToGround = 0;
        let shadowScale = Math.max(0, 1 - (distToGround / 200));
        this.shadow.setScale(shadowScale);
        this.shadow.setAlpha(0.6 * shadowScale);`;

const newShadowUpdate = `        // --- BÓNG ĐỔ NGHIÊNG & CHIẾU SÁNG REALTIME ---
        let groundY = this.getTerrainY(this.player.x);
        let slope = this.getTerrainSlope(this.player.x);
        AtmosphereFX.updateDirectionalShadow(this.shadow, this.player.x, this.player.y + 40, groundY, slope, 0.45);
        if (this.playerGroundLight) {
            this.playerGroundLight.setPosition(this.player.x, groundY - 5);
        }`;

runnerCode = runnerCode.replace(oldShadowUpdate, newShadowUpdate);

fs.writeFileSync('src/scenes/RunnerScene.js', runnerCode, 'utf8');

// 3. Update Player.js with Realtime Directional Shadows
let playerCode = fs.readFileSync('src/entities/Player.js', 'utf8');
const oldPlayerUpdate = "this.shadow.x = this.x;\n        this.shadow.y = this.y + 20;";
const newPlayerUpdate = `let groundY = (this.scene.getTerrainY) ? this.scene.getTerrainY(this.x) : this.y + 20;
        let slope = (this.scene.getTerrainSlope) ? this.scene.getTerrainSlope(this.x) : 0;
        AtmosphereFX.updateDirectionalShadow(this.shadow, this.x, this.y, groundY, slope, 0.45);`;

playerCode = playerCode.replace(oldPlayerUpdate, newPlayerUpdate);
fs.writeFileSync('src/entities/Player.js', playerCode, 'utf8');

console.log('Successfully activated Realtime Lighting & Directional Shadows System!');