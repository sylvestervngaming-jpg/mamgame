const fs = require('fs');

// 1. Update AssetManager.js to preload mam_idle
let assetMgr = fs.readFileSync('src/utils/AssetManager.js', 'utf8');
if (!assetMgr.includes('mam_idle')) {
    assetMgr = assetMgr.replace(
        "{ key: 'sprout', file: 'assets/sprites/sprout.png' }",
        "{ key: 'sprout', file: 'assets/sprites/sprout.png' },\n            { key: 'mam_idle', file: 'assets/sprites/mam_idle.png' }"
    );
    fs.writeFileSync('src/utils/AssetManager.js', assetMgr, 'utf8');
}

// 2. Update RunnerScene.js
let runner = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Replace player sprite creation in RunnerScene.js
const oldRunnerPlayerCreation = `        this.playerSprite = this.add.sprite(200, h - 150, 'green_circle').setDepth(10);
        this.playerSprite.setTint(initialColor);
        this.playerSprite.setOrigin(0.5, 1);
        this.playerSprite.baseScale = 1;
        this.playerSprite.setScale(this.playerSprite.baseScale);`;

const newRunnerPlayerCreation = `        let playerTex = this.textures.exists('mam_idle') ? 'mam_idle' : 'green_circle';
        this.playerSprite = this.add.sprite(200, h - 150, playerTex).setDepth(10);
        this.playerSprite.setOrigin(0.5, 1);
        
        // Kích thước chuẩn tỉ lệ theo tranh vẽ của Artist
        this.playerBaseScaleX = 0.58;
        this.playerBaseScaleY = 0.58;
        this.playerSprite.setScale(this.playerBaseScaleX, this.playerBaseScaleY);
        this.playerSquashFactor = 1.0;
        this.playerWasGrounded = true;`;

runner = runner.replace(oldRunnerPlayerCreation, newRunnerPlayerCreation);

// Replace player animation update logic in RunnerScene.js
const oldRunnerUpdateStart = `    update() {
        // Sync sprite & DUY NHẤT 1 AURA đúng tâm Mầm
        this.playerSprite.x = this.player.x;
        this.playerSprite.y = this.player.y + 40;
        if (this.aura) {
            this.aura.setPosition(this.playerSprite.x, this.playerSprite.y - 25);
        }`;

const newRunnerUpdateStart = `    update(time, delta) {
        // Sync sprite & DUY NHẤT 1 AURA đúng tâm Mầm
        this.playerSprite.x = this.player.x;
        this.playerSprite.y = this.player.y + 40;
        if (this.aura) {
            this.aura.setPosition(this.playerSprite.x, this.playerSprite.y - 45);
        }

        // --- HỆ THỐNG HOẠT ẢNH VẬT LÝ CO DÃN & NHỊP THỞ (PROCEDURAL ANIMATIONS) ---
        let vx = this.player.body.velocity.x;
        let vy = this.player.body.velocity.y;
        let isGroundedNow = this.player.body.touching.down || this.player.body.blocked.down || this.player.body.onFloor();

        // Hiệu ứng tiếp đất đàn hồi (Land Squash)
        if (!this.playerWasGrounded && isGroundedNow && vy >= 0) {
            this.playerSquashFactor = 0.72;
            this.tweens.add({
                targets: this,
                playerSquashFactor: 1.0,
                duration: 200,
                ease: 'Back.easeOut'
            });
        }
        this.playerWasGrounded = isGroundedNow;

        if (isGroundedNow) {
            if (Math.abs(vx) > 20) {
                // Đang chạy: Chúi người về phía trước + nhún nhảy bước chân
                this.playerSprite.flipX = (vx < 0);
                let bounce = Math.sin(time * 0.016) * 0.08;
                this.playerSprite.setScale(
                    this.playerBaseScaleX * (1 - bounce) * (2 - this.playerSquashFactor),
                    this.playerBaseScaleY * (1 + bounce) * this.playerSquashFactor
                );
                let targetRot = (vx > 0 ? 0.12 : -0.12) + Math.sin(time * 0.016) * 0.05;
                this.playerSprite.setRotation(targetRot);
            } else {
                // Đứng yên (Idle): Phập phồng nhịp thở êm ái
                let breath = Math.sin(time * 0.0035) * 0.035;
                this.playerSprite.setScale(
                    this.playerBaseScaleX * (1 - breath * 0.5) * (2 - this.playerSquashFactor),
                    this.playerBaseScaleY * (1 + breath) * this.playerSquashFactor
                );
                this.playerSprite.setRotation(Math.sin(time * 0.0018) * 0.02);
            }
        } else {
            // Đang ở trên không: Nhảy vươn người hoặc Rơi căng gió
            if (vy < -50) {
                // Bật nhảy lên: Thân thuôn dài vươn lên
                this.playerSprite.setScale(this.playerBaseScaleX * 0.85, this.playerBaseScaleY * 1.18);
                this.playerSprite.setRotation(vx * 0.0003);
            } else if (vy > 50) {
                // Rơi xuống: Thân nở nhẹ
                this.playerSprite.setScale(this.playerBaseScaleX * 1.06, this.playerBaseScaleY * 0.94);
                this.playerSprite.setRotation(vx * 0.0002);
            }
        }`;

runner = runner.replace(oldRunnerUpdateStart, newRunnerUpdateStart);
fs.writeFileSync('src/scenes/RunnerScene.js', runner, 'utf8');

// 3. Update Player.js
let player = fs.readFileSync('src/entities/Player.js', 'utf8');
player = player.replace(
    "this.setTexture('green_circle');",
    "let pTex = scene.textures.exists('mam_idle') ? 'mam_idle' : 'green_circle';\n        this.setTexture(pTex);"
);
player = player.replace("this.baseScale = 1;", "this.baseScale = 0.58;");
fs.writeFileSync('src/entities/Player.js', player, 'utf8');

console.log('Successfully integrated real Artist Mầm artwork and procedural animation system!');