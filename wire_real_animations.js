const fs = require('fs');

// 1. BootScene.js: Preload spritesheets and create global animations
let boot = fs.readFileSync('src/scenes/BootScene.js', 'utf8');

const bootPreloadOld = `    preload() {
        this.add.text(640, 360, 'Đang tải...', { font: '32px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);
        AssetManager.preloadAll(this);
    }`;

const bootPreloadNew = `    preload() {
        this.add.text(640, 360, 'Đang tải...', { font: '32px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);
        AssetManager.preloadAll(this);
        
        // Nạp các Sprite Sheet hoạt ảnh của Mầm
        this.load.spritesheet('mam_idle_sheet', 'assets/sprites/mam_anim_idle.png', { frameWidth: 96, frameHeight: 128 });
        this.load.spritesheet('mam_run_sheet', 'assets/sprites/mam_anim_run.png', { frameWidth: 96, frameHeight: 128 });
        this.load.spritesheet('mam_jump_sheet', 'assets/sprites/mam_anim_jump.png', { frameWidth: 96, frameHeight: 128 });
    }`;

boot = boot.replace(bootPreloadOld, bootPreloadNew);

const bootAnimInit = `
        // Khởi tạo các Animation toàn cục của Mầm
        if (!this.anims.exists('mam_idle_anim')) {
            this.anims.create({
                key: 'mam_idle_anim',
                frames: this.anims.generateFrameNumbers('mam_idle_sheet', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        }
        if (!this.anims.exists('mam_run_anim')) {
            this.anims.create({
                key: 'mam_run_anim',
                frames: this.anims.generateFrameNumbers('mam_run_sheet', { start: 0, end: 7 }),
                frameRate: 14,
                repeat: -1
            });
        }
        if (!this.anims.exists('mam_jump_anim')) {
            this.anims.create({
                key: 'mam_jump_anim',
                frames: this.anims.generateFrameNumbers('mam_jump_sheet', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }
`;

boot = boot.replace("this.scene.start('MenuScene');", bootAnimInit + "        this.scene.start('MenuScene');");
fs.writeFileSync('src/scenes/BootScene.js', boot, 'utf8');

// 2. RunnerScene.js: Remove aura completely & wire up real Sprite Sheet animations
let runner = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Remove aura from create()
const oldRunnerPlayerBlock = /let initialColor = this\.registry\.get\('playerColor'\) \|\| 0x2ecc71;[\s\S]*?this\.playerEmitter = this\.add\.particles/m;

const newRunnerPlayerBlock = `// Shadow dưới chân Mầm
        this.shadow = this.add.ellipse(200, h - 110, 48, 14, 0x000000, 0.6).setDepth(8);

        this.player.body.setGravityY(1200);
        this.player.body.setCollideWorldBounds(true);

        // Đảm bảo Sprite Sheet đã sẵn sàng
        if (!this.anims.exists('mam_idle_anim')) {
            this.anims.create({
                key: 'mam_idle_anim',
                frames: this.anims.generateFrameNumbers('mam_idle_sheet', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'mam_run_anim',
                frames: this.anims.generateFrameNumbers('mam_run_sheet', { start: 0, end: 7 }),
                frameRate: 14,
                repeat: -1
            });
            this.anims.create({
                key: 'mam_jump_anim',
                frames: this.anims.generateFrameNumbers('mam_jump_sheet', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }

        // Tạo Sprite nhân vật Mầm với Animation Idle mặc định
        let startTex = this.textures.exists('mam_idle_sheet') ? 'mam_idle_sheet' : 'green_circle';
        this.playerSprite = this.add.sprite(200, h - 150, startTex).setDepth(10);
        this.playerSprite.setOrigin(0.5, 1);
        this.playerSprite.setScale(1.0);
        
        if (this.anims.exists('mam_idle_anim')) {
            this.playerSprite.play('mam_idle_anim');
        }

        this.playerEmitter = this.add.particles`;

runner = runner.replace(oldRunnerPlayerBlock, newRunnerPlayerBlock);

// Clean update() in RunnerScene.js
const oldUpdateStartBlock = /update\(time, delta\) \{[\s\S]*?\/\/ --- BÓNG ĐỔ NGHIÊNG/m;

const newUpdateStartBlock = `update(time, delta) {
        // Đồng bộ vị trí Sprite với Physics Body
        this.playerSprite.x = this.player.x;
        this.playerSprite.y = this.player.y + 40;

        // --- BÓNG ĐỔ NGHIÊNG`;

runner = runner.replace(oldUpdateStartBlock, newUpdateStartBlock);

// Remove old procedural scale animation and hook into State-based Animation playback
const oldAnimCodeInRunner = /\/\/ --- HỆ THỐNG HOẠT ẢNH VẬT LÝ CO DÃN & NHỊP THỞ[\s\S]*?if \(this\.aura\) \{[\s\S]*?\}/m;

const newAnimCodeInRunner = `// --- PHÁT HOẠT ẢNH (IDLE, RUN, JUMP) CHO MẦM ---
        let isGroundedNow = this.player.body.touching.down || this.player.body.blocked.down || this.player.body.onFloor();
        let isMovingNow = isMovingLeft || isMovingRight;

        if (!isGroundedNow) {
            // Đang nhảy trên không
            if (this.playerSprite.anims && this.playerSprite.anims.currentAnim?.key !== 'mam_jump_anim') {
                this.playerSprite.play('mam_jump_anim', true);
            }
        } else if (isMovingNow) {
            // Đang chạy bộ
            if (this.playerSprite.anims && this.playerSprite.anims.currentAnim?.key !== 'mam_run_anim') {
                this.playerSprite.play('mam_run_anim', true);
            }
        } else {
            // Đang đứng yên
            if (this.playerSprite.anims && this.playerSprite.anims.currentAnim?.key !== 'mam_idle_anim') {
                this.playerSprite.play('mam_idle_anim', true);
            }
        }

        // Quay mặt nhân vật theo hướng chạy
        if (isMovingLeft) {
            this.playerSprite.setFlipX(true);
        } else if (isMovingRight) {
            this.playerSprite.setFlipX(false);
        }`;

runner = runner.replace(oldAnimCodeInRunner, newAnimCodeInRunner);

// Remove any remaining aura references in RunnerScene
runner = runner.replace(/if \(this\.aura\)[\s\S]*?;\n/g, "");
runner = runner.replace(/this\.aura = .*?;\n/g, "");

fs.writeFileSync('src/scenes/RunnerScene.js', runner, 'utf8');

// 3. Clean Player.js
let player = fs.readFileSync('src/entities/Player.js', 'utf8');
player = player.replace(/this\.aura = .*?;\n/g, "");
player = player.replace(/if \(this\.aura\) .*?;\n/g, "");
fs.writeFileSync('src/entities/Player.js', player, 'utf8');

console.log('Successfully removed aura and wired real SpriteSheet animations (Idle, Run, Jump)!');