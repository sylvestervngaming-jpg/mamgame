const fs = require('fs');

// 1. Create MamPuppet.js
const puppetCode = `export default class MamPuppet extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.setDepth(10);

        // 1. Layer Áo choàng sau (Back Cloak)
        this.backCloak = scene.add.image(0, -41, 'mam_part_back_cloak').setOrigin(0.5, 0.5);
        
        // 2. Chân trái (Left Leg) - Pivot tại hông (0.5, 0)
        this.legLeft = scene.add.image(2.5, -32.5, 'mam_part_leg_left').setOrigin(0.5, 0);
        this.baseLegLeftY = -32.5;

        // 3. Chân phải (Right Leg) - Pivot tại hông (0.5, 0)
        this.legRight = scene.add.image(10.3, -31.7, 'mam_part_leg_right').setOrigin(0.5, 0);
        this.baseLegRightY = -31.7;

        // 4. Đầu và Khuôn mặt (Head & Face)
        this.head = scene.add.image(4.6, -82.0, 'mam_part_head_face').setOrigin(0.5, 0.5);
        this.baseHeadY = -82.0;

        // 5. Đọt mầm xoăn trên đầu (Sprout Antenna) - Pivot tại gốc cuống (0.5, 1)
        this.sprout = scene.add.image(9.6, -93.8, 'mam_part_sprout_top').setOrigin(0.5, 1);

        // 6. Áo choàng trước vạt trái (Left Cloak) - Pivot tại cổ (0.5, 0)
        this.leftCloak = scene.add.image(-8.5, -71.8, 'mam_part_left_cloak').setOrigin(0.5, 0);

        // 7. Áo choàng trước vạt phải (Right Cloak) - Pivot tại cổ (0.5, 0)
        this.rightCloak = scene.add.image(15.6, -69.7, 'mam_part_right_cloak').setOrigin(0.5, 0);

        this.add([
            this.backCloak,
            this.legLeft,
            this.legRight,
            this.head,
            this.sprout,
            this.leftCloak,
            this.rightCloak
        ]);

        scene.add.existing(this);

        this.squashY = 1.0;
        this.facingRight = true;
    }

    updateAnimation(time, vx, vy, isGrounded) {
        let isMoving = Math.abs(vx) > 15;

        if (vx > 15) this.facingRight = true;
        else if (vx < -15) this.facingRight = false;

        // Lật mặt theo hướng di chuyển
        this.setScale(this.facingRight ? 1 : -1, 1);

        if (!isGrounded) {
            // --- TRẠNG THÁI NHẢY (JUMP / FALL) ---
            if (vy < -50) {
                // Bật nhảy lên: Hai chân co lên cao, áo choàng bung nhẹ, đọt mầm cụp
                this.legLeft.setRotation(-0.35);
                this.legRight.setRotation(-0.35);
                this.legLeft.y = this.baseLegLeftY - 5;
                this.legRight.y = this.baseLegRightY - 5;

                this.leftCloak.setRotation(0.22);
                this.rightCloak.setRotation(-0.22);
                this.sprout.setRotation(this.facingRight ? -0.2 : 0.2);
                this.head.y = this.baseHeadY - 2;
            } else {
                // Rơi xuống: Hai chân duỗi chuẩn bị tiếp đất, áo choàng xòe dù
                this.legLeft.setRotation(0.1);
                this.legRight.setRotation(0.1);
                this.legLeft.y = this.baseLegLeftY;
                this.legRight.y = this.baseLegRightY;

                this.leftCloak.setRotation(0.15);
                this.rightCloak.setRotation(-0.15);
                this.sprout.setRotation(this.facingRight ? 0.15 : -0.15);
                this.head.y = this.baseHeadY;
            }
        } else if (isMoving) {
            // --- TRẠNG THÁI CHẠY BỘ (RUN WITH REAL LEGS) ---
            let runCycle = time * 0.016;

            // Chân trái & chân phải bước sải so le
            let stride = Math.sin(runCycle) * 0.65;
            this.legLeft.setRotation(stride);
            this.legRight.setRotation(-stride);

            // Nhấc chân lên khỏi mặt đất khi bước tới
            this.legLeft.y = this.baseLegLeftY - Math.max(0, Math.sin(runCycle) * 5);
            this.legRight.y = this.baseLegRightY - Math.max(0, -Math.sin(runCycle) * 5);

            // Tà áo choàng bay phấp phới theo quán tính
            this.leftCloak.setRotation(-0.18 + Math.sin(runCycle) * 0.12);
            this.rightCloak.setRotation(-0.12 - Math.sin(runCycle) * 0.12);

            // Đầu và đọt mầm nhấp nhô theo từng bước chạy
            this.head.y = this.baseHeadY + Math.abs(Math.sin(runCycle)) * 2.8;
            this.sprout.setRotation(-0.2 + Math.sin(runCycle) * 0.15);
        } else {
            // --- TRẠNG THÁI ĐỨNG YÊN (IDLE - NHỊP THỞ & ĐUNG ĐƯA) ---
            let breath = Math.sin(time * 0.0035);
            
            // Chân đứng thẳng chạm đất
            this.legLeft.setRotation(0);
            this.legRight.setRotation(0);
            this.legLeft.y = this.baseLegLeftY;
            this.legRight.y = this.baseLegRightY;

            // Đầu nhấp nhô theo nhịp thở
            this.head.y = this.baseHeadY + breath * 1.8;

            // Đọt mầm xoăn đung đưa qua lại theo gió
            this.sprout.setRotation(Math.sin(time * 0.0022) * 0.14);

            // Tà áo choàng phập phồng nhẹ nhàng
            this.leftCloak.setRotation(breath * 0.035);
            this.rightCloak.setRotation(-breath * 0.035);
        }
    }
}
`;
fs.writeFileSync('src/entities/MamPuppet.js', puppetCode, 'utf8');

// 2. Update AssetManager.js to preload all 7 parts
let assetMgr = fs.readFileSync('src/utils/AssetManager.js', 'utf8');
const partsToPreload = `
            { key: 'mam_part_back_cloak', file: 'assets/sprites/mam_parts/back_cloak.png' },
            { key: 'mam_part_leg_left', file: 'assets/sprites/mam_parts/leg_left.png' },
            { key: 'mam_part_leg_right', file: 'assets/sprites/mam_parts/leg_right.png' },
            { key: 'mam_part_sprout_top', file: 'assets/sprites/mam_parts/sprout_top.png' },
            { key: 'mam_part_head_face', file: 'assets/sprites/mam_parts/head_face.png' },
            { key: 'mam_part_left_cloak', file: 'assets/sprites/mam_parts/left_cloak.png' },
            { key: 'mam_part_right_cloak', file: 'assets/sprites/mam_parts/right_cloak.png' }`;

if (!assetMgr.includes('mam_part_back_cloak')) {
    assetMgr = assetMgr.replace(
        "{ key: 'mam_idle', file: 'assets/sprites/mam_idle.png' }",
        "{ key: 'mam_idle', file: 'assets/sprites/mam_idle.png' }," + partsToPreload
    );
    fs.writeFileSync('src/utils/AssetManager.js', assetMgr, 'utf8');
}

// 3. Update BootScene.js to preload parts as well
let boot = fs.readFileSync('src/scenes/BootScene.js', 'utf8');
if (!boot.includes('mam_part_back_cloak')) {
    const bootPartPreload = `
        const parts = ['back_cloak', 'leg_left', 'leg_right', 'sprout_top', 'head_face', 'left_cloak', 'right_cloak'];
        parts.forEach(p => {
            this.load.image('mam_part_' + p, 'assets/sprites/mam_parts/' + p + '.png');
        });\n`;
    boot = boot.replace("AssetManager.preloadAll(this);", "AssetManager.preloadAll(this);\n" + bootPartPreload);
    fs.writeFileSync('src/scenes/BootScene.js', boot, 'utf8');
}

// 4. Update RunnerScene.js to use MamPuppet
let runner = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Add import MamPuppet at top of RunnerScene.js
if (!runner.includes("import MamPuppet from '../entities/MamPuppet.js'")) {
    runner = "import MamPuppet from '../entities/MamPuppet.js';\n" + runner;
}

// Replace player creation with MamPuppet
const oldPlayerCreation = /this\.shadow = this\.add\.ellipse\(200, h - 110[\s\S]*?this\.playerEmitter = this\.add\.particles/m;

const newPlayerCreation = `// Shadow dưới chân Mầm
        this.shadow = this.add.ellipse(200, h - 110, 48, 14, 0x000000, 0.6).setDepth(8);

        this.player.body.setGravityY(1200);
        this.player.body.setCollideWorldBounds(true);

        // Khởi tạo Nhân vật Mầm ghép từ 7 layer tách rời (MamPuppet)
        this.playerPuppet = new MamPuppet(this, 200, h - 110);

        this.playerEmitter = this.add.particles`;

runner = runner.replace(oldPlayerCreation, newPlayerCreation);

// Replace RunnerScene update animation call
const oldAnimUpdate = /\/\/ --- PHÁT HOẠT ẢNH \(IDLE, RUN, JUMP\) CHO MẦM ---[\s\S]*?if \(isMovingRight\) \{[\s\S]*?\}/m;

const newAnimUpdate = `// --- CẬP NHẬT HOẠT ẢNH ĐA LAYER (CHÂN BƯỚC, ÁO CHOÀNG BAY, ĐỌT MẦM ĐUNG ĐƯA) ---
        let isGroundedNow = this.player.body.touching.down || this.player.body.blocked.down || this.player.body.onFloor();
        if (this.playerPuppet) {
            this.playerPuppet.setPosition(this.player.x, this.player.y + 40);
            this.playerPuppet.updateAnimation(time, this.player.body.velocity.x, this.player.body.velocity.y, isGroundedNow);
        }`;

runner = runner.replace(oldAnimUpdate, newAnimUpdate);

// Clean up sprite references in RunnerScene
runner = runner.replace(/this\.playerSprite\.x = .*?;\n/g, "");
runner = runner.replace(/this\.playerSprite\.y = .*?;\n/g, "");
runner = runner.replace(/this\.playerSprite/g, "this.playerPuppet");

fs.writeFileSync('src/scenes/RunnerScene.js', runner, 'utf8');

console.log('Successfully created MamPuppet using 7 separated layers from mầm.psd and wired full skeletal animation!');