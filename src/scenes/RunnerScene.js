import MamPuppet from '../entities/MamPuppet.js';
import AtmosphereFX from '../utils/AtmosphereFX.js';
import CollectibleItem from '../entities/CollectibleItem.js';
import AssetManager from '../utils/AssetManager.js';
export default class RunnerScene extends Phaser.Scene {
    constructor() {
        super('RunnerScene');
    }

    preload() {
        AssetManager.preloadAll(this);
    }

    create() {
        this.hasReachedEnd = false;
        this.isGameOvering = false;
        this.hasTriggeredArtillery = false;
        AssetManager.generateAndSave(this, 'map1_stump', 30, 50, (g) => {
            g.fillStyle(0x553311, 1);
            g.fillRect(0, 0, 30, 50); // Trunk
            g.fillStyle(0x442200, 1);
            g.fillRect(10, 35, 4, 15); // Bark1
            g.fillRect(21, 42, 3, 10); // Bark2
            g.fillStyle(0x664422, 1);
            g.fillRect(27, 10, 15, 3); // Branch
        });
        
        AssetManager.generateAndSave(this, 'map1_leaf', 20, 20, (g) => {
            g.fillStyle(0x4fc26d, 1);
            g.fillEllipse(10, 10, 10, 20); // Leaf
        });

        AssetManager.generateAndSave(this, 'map1_vine_bridge', 750, 100, (g) => {
            let vines = [
                { color: 0x3da35d, thick: 8, sag: 25 },
                { color: 0x2d8a4e, thick: 6, sag: 40 },
                { color: 0x1a6633, thick: 12, sag: 15 }
            ];
            vines.forEach((vine, vi) => {
                g.lineStyle(vine.thick, vine.color, 1);
                g.beginPath();
                g.moveTo(0, 20 + vi * 3);
                for (let bx = 0; bx <= 750; bx += 20) {
                    let progress = bx / 750;
                    let curveY = Math.sin(progress * Math.PI) * vine.sag;
                    g.lineTo(bx, 20 + vi * 3 + curveY);
                }
                g.strokePath();
            });
        });

        this.cratersCreated = false;
        this.isCinematic = false;
        
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.registry.set('showUI', true);
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
        this.registry.set('showSurvival', false);

        // Backgrounds (Seamless repeating)
        // --- ÁNH SÁNG ĐIỆN ẢNH (GOD RAYS) ---
        AtmosphereFX.createGodRays(this, {
            startX: 0,
            endX: w * 6,
            color: 0xffeaa7,
            baseAlpha: 0.14,
            tilt: 400
        });

        for (let bi = 0; bi < 6; bi++) {
            this.add.image(w * bi, 0, 'war_bg').setOrigin(0, 0).setDisplaySize(w, h).setScrollFactor(0.2).setDepth(-10);
        }
        
        // NÃ¡Â»Ân Ã„â€˜en thÃ¡ÂºÂ³m che lÃ¡ÂºÂ¥p toÃƒÂ n bÃ¡Â»â„¢ thÃ¡ÂºÂ¿ giÃ¡Â»â€ºi ngÃ¡ÂºÂ§m bÃƒÂªn dÃ†Â°Ã¡Â»â€ºi mÃƒÂ n hÃƒÂ¬nh (dÃƒÂ nh cho cÃƒÂ¡i dÃ¡Â»â€˜c sÃƒÂ¢u 1000px)
        // Removed underground rect

        // --- TÀN TÍCH NHÀ CỬA & CỘT BÊ TÔNG ĐỔ NÁT Ở XA (MIDGROUND RUINS - PARALLAX 0.38) ---
        let mgGraphics = this.add.graphics().setScrollFactor(0.38).setDepth(-5);
        mgGraphics.fillStyle(0x151720, 0.92);

        for (let x = -200; x < w * 6; x += Phaser.Math.Between(200, 380)) {
            let width = Phaser.Math.Between(80, 170);
            let height = Phaser.Math.Between(220, 460);
            
            // Khối cột bê tông / thân nhà đổ nát
            mgGraphics.fillRect(x, h - height, width, height + 1500);
            
            // Đỉnh bê tông gãy vỡ tự nhiên
            mgGraphics.beginPath();
            mgGraphics.moveTo(x, h - height);
            let segments = 4;
            let segW = width / segments;
            for (let s = 1; s <= segments; s++) {
                let jaggedY = h - height + Phaser.Math.Between(-15, 20);
                mgGraphics.lineTo(x + s * segW, jaggedY);
            }
            mgGraphics.lineTo(x + width, h - height);
            mgGraphics.fillPath();

            // Khung cửa sổ / lỗ thủng chiến tranh
            mgGraphics.fillStyle(0x090a0f, 0.95);
            for (let wy = h - height + 45; wy < h - 40; wy += 50) {
                if (Math.random() > 0.25) {
                    mgGraphics.fillRect(x + 14, wy, 18, 25);
                }
                if (width > 110 && Math.random() > 0.3) {
                    mgGraphics.fillRect(x + width - 35, wy, 18, 25);
                }
            }
            mgGraphics.fillStyle(0x151720, 0.92);

            // Cột ăng-ten / cốt thép lòi ra trên nóc
            if (Math.random() > 0.4) {
                mgGraphics.lineStyle(2, 0x0a0b10, 0.9);
                mgGraphics.beginPath();
                let poleX = x + Phaser.Math.Between(15, width - 15);
                mgGraphics.moveTo(poleX, h - height);
                mgGraphics.lineTo(poleX + Phaser.Math.Between(-8, 8), h - height - Phaser.Math.Between(30, 70));
                mgGraphics.strokePath();
            }
        }

        // --- NƯỚC ĐỘC ---
// HÃ¡Â»â€˜ nÃ†Â°Ã¡Â»â€ºc Ã„â€˜Ã¡Â»â„¢c Ã¡Â»Å¸ giÃ¡Â»Â¯a (1536 -> 2048)
        this.add.rectangle(1536, h - 30, 512, 1500, 0x1a0022, 0.95).setOrigin(0, 0); // KÃƒÂ©o sÃƒÂ¢u xuÃ¡Â»â€˜ng 1500
        this.add.rectangle(1536, h - 45, 512, 40, 0x33004d, 0.7).setOrigin(0, 0);
        AssetManager.generateAndSave(this, 'toxic_lake', 512, 20, (g) => {
            g.fillStyle(0x8800aa, 0.4);
            g.fillRect(0, 2, 512, 15);
            g.fillStyle(0xaa33cc, 0.25);
            g.fillRect(0, 0, 512, 6);
        });
        let surfaceG1 = this.add.image(1536, h - 57, 'toxic_lake').setOrigin(0, 0);
        for (let rx = 1550; rx < 2030; rx += Phaser.Math.Between(30, 70)) {
            let shimmer = this.add.ellipse(rx, h - 53, Phaser.Math.Between(15, 40), 3, 0xcc66ff, 0.3);
            this.tweens.add({ targets: shimmer, alpha: 0.05, duration: Phaser.Math.Between(1000, 2000), yoyo: true, repeat: -1 });
        }
        
        // HÃ¡ÂºÂ¡t ÃƒÂ¡nh sÃƒÂ¡ng Ã„â€˜om Ã„â€˜ÃƒÂ³m (Particle textures)
        AssetManager.generateAndSave(this, 'smoke', 16, 16, (g) => {
            g.fillStyle(0xaa00ff, 0.5);
            g.fillCircle(8, 8, 8);
        });
        AssetManager.generateAndSave(this, 'firefly', 8, 8, (g) => {
            g.fillStyle(0x00ff00, 1);
            g.fillCircle(4, 4, 4);
        });
        
        // BÃ¡Â»Ât khÃƒÂ­ sÃ¡Â»Â§i lÃƒÂªn tÃ¡Â»Â« hÃ¡Â»â€˜ giÃ¡Â»Â¯a
        this.add.particles(0, 0, 'smoke', {
            x: { min: 1560, max: 2020 },
            y: h - 60,
            speedY: { min: -15, max: -35 },
            scale: { start: 0.3, end: 0.1 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 2000,
            frequency: 400,
            tint: 0xaa44cc
        });
        this.toxicPit = this.add.rectangle(1536, h - 55, 512, 200, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(this.toxicPit, true);
        

        // --- Ã„ÂÃ¡ÂºÂ¤T (CUSTOM TERRAIN) ---
        this.groundGroup = this.add.group();
        
        // TÃ¡ÂºÂ¡o cÃƒÂ¡c bÃ¡ÂºÂ­c thang vÃ¡ÂºÂ­t lÃƒÂ½ Ã¡ÂºÂ©n dÃ¡Â»Âc theo Ã„â€˜Ã¡Â»â€œ thÃ¡Â»â€¹ terrain Ã„â€˜Ã¡Â»Æ’ Arcade xÃ¡Â»Â­ lÃƒÂ½ va chÃ¡ÂºÂ¡m chuÃ¡ÂºÂ©n
        for (let x = 0; x <= w * 6; x += 20) { // MÃ¡Â»â€”i bÃ†Â°Ã¡Â»â€ºc 20px
            let ty = this.getTerrainY(x);
            if (!(x > 1536 && x <= 2048)) { // BÃ¡Â»Â qua khÃƒÂºc hÃ¡Â»â€˜ nÃ†Â°Ã¡Â»â€ºc Ã„â€˜Ã¡Â»â„¢c Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn
                // TÃ¡ÂºÂ¡o mÃ¡Â»â„¢t hÃƒÂ¬nh chÃ¡Â»Â¯ nhÃ¡ÂºÂ­t tÃƒÂ ng hÃƒÂ¬nh Ã¡Â»Å¸ Ã„â€˜ÃƒÂ¢y, kÃƒÂ©o dÃƒÂ i thÃ¡ÂºÂ³ng xuÃ¡Â»â€˜ng Ã„â€˜ÃƒÂ¡y vÃ¡Â»Â±c
                let rect = this.add.rectangle(x, ty, 20, (h + 1500) - ty, 0x000000, 0).setOrigin(0, 0);
                this.physics.add.existing(rect, true); // true = static
                this.groundGroup.add(rect);
            }
        }

        // VÃ¡ÂºÂ½ Ã„â€˜Ã¡Â»â€œ thÃ¡Â»â€¹ Ã„â€˜Ã¡Â»â€¹a hÃƒÂ¬nh
        this.groundGraphics = this.make.graphics({x: 0, y: 0});
        this.groundGraphics.fillStyle(0xffffff, 1);
        this.groundGraphics.beginPath();
        this.groundGraphics.moveTo(0, h + 1500); // MÃ¡Â»Å¸ rÃ¡Â»â„¢ng xuÃ¡Â»â€˜ng Ã„â€˜ÃƒÂ¡y vÃ¡Â»Â±c

        for (let x = 0; x <= w * 6; x += 10) {
            let ty = this.getTerrainY(x);
            // Ã„ÂÃ¡Â»Â«ng vÃ¡ÂºÂ½ mÃ¡ÂºÂ·t nÃ¡ÂºÂ¡ cho hÃ¡Â»â€˜ (Ã„â€˜Ã¡Â»Æ’ hÃ¡Â»â€˜ khÃƒÂ´ng hiÃ¡Â»â€¡n Ã„â€˜Ã¡ÂºÂ¥t)
            // HÃ¡Â»â€˜ Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn (1536 -> 2048)
            if (x > 1536 && x <= 2048) {
                this.groundGraphics.lineTo(x, h + 1500);
            } else {
                this.groundGraphics.lineTo(x, ty);
            }
        }
        this.groundGraphics.lineTo(w * 6, h + 1500);
        this.groundGraphics.fillPath();

        // TÃ¡ÂºÂ¡o Mask tÃ¡Â»Â« Graphics
        let groundMask = this.groundGraphics.createGeometryMask();

        // VÃ¡ÂºÂ½ texture Ã„â€˜Ã¡ÂºÂ¥t Ã„â€˜ÃƒÂ¨ lÃƒÂªn nÃ†Â°Ã¡Â»â€ºc Ã„â€˜Ã¡Â»â„¢c
        for (let x = 0; x <= w * 6; x += 512) {
            if (x === 1536) continue; // BÃ¡Â»Â qua khÃƒÂºc hÃ¡Â»â€˜ Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn
            // LÃ¡ÂºÂ·p theo chiÃ¡Â»Âu dÃ¡Â»Âc Ã„â€˜Ã¡Â»Æ’ trÃ¡ÂºÂ£i texture xuÃ¡Â»â€˜ng vÃ¡Â»Â±c sÃƒÂ¢u, yOffset += 145 Ã„â€˜Ã¡Â»Æ’ khÃƒÂ´ng bÃ¡Â»â€¹ hÃ¡Â»Å¸ sÃ¡Â»Âc ngang
            for (let yOffset = 0; yOffset <= 1500; yOffset += 145) {
                let groundImg = this.add.image(x, h + 322 + yOffset, 'toxic_ground').setOrigin(0, 1).setScale(0.5).setDepth(5);
                // Crop lÃ¡ÂºÂ¡i giÃ¡Â»â€˜ng bÃ¡ÂºÂ£n cÃ…Â© Ã„â€˜Ã¡Â»Æ’ cÃƒÂ¡i bÃ¡Â»Â mÃ¡ÂºÂ·t Ã„â€˜Ã†Â°Ã¡Â»Âng bÃ¡ÂºÂ±ng phÃ¡ÂºÂ³ng nÃ¡ÂºÂ±m ngay mÃƒÂ©p trÃƒÂªn
                groundImg.setCrop(0, 160, 1024, 300);
                groundImg.setMask(groundMask);
                groundImg.setDepth(5);
                // groundImg.setFlipX(true);
            }
        }
        
        // TÃ¡ÂºÂ¡o Ã„â€˜Ã†Â°Ã¡Â»Âng viÃ¡Â»Ân nÃƒÂ©t Ã„â€˜en trÃƒÂªn mÃ¡ÂºÂ·t Ã„â€˜Ã¡ÂºÂ¥t cho rÃƒÂµ rÃƒÂ ng
        this.borderGraphics = this.add.graphics();
        this.borderGraphics.lineStyle(4, 0x1a1a22, 1);
        this.borderGraphics.beginPath();
        let firstBorder = true;
        for (let x = 0; x <= w * 6; x += 20) {
            let ty = this.getTerrainY(x);
            if (x > 1536 && x <= 2048) {
                firstBorder = true;
            } else {
                if (firstBorder) { this.borderGraphics.moveTo(x, ty); firstBorder = false; }
                else this.borderGraphics.lineTo(x, ty);
            }
        }
        this.borderGraphics.strokePath();
        this.borderGraphics.setDepth(6);

        // Death zone dÃ†Â°Ã¡Â»â€ºi cÃƒÂ¹ng
        this.deathZone = this.add.rectangle(0, h + 1500, w * 6, 200, 0xff0000, 0).setOrigin(0,0);
        this.physics.add.existing(this.deathZone, true);

        // KhÃƒÂ³i Ã„â€˜Ã¡Â»â„¢c cuÃ¡Â»â€˜i map
        this.add.particles(0, 0, 'smoke', {
            x: { min: w * 6, max: w * 6 + 800 },
            y: { min: h - 100, max: h },
            lifespan: 4000,
            speedY: { min: -20, max: -50 },
            scale: { start: 1, end: 3 },
            alpha: { start: 0.8, end: 0 },
            frequency: 100
        });
        // KhÃƒÂ³i/hÃ†Â¡i Ã„â€˜Ã¡Â»â„¢c nhÃ¡ÂºÂ¹ tÃ¡Â»Â« hÃ¡Â»â€˜ giÃ¡Â»Â¯a map
        this.add.particles(0, 0, 'smoke', {
            x: { min: 1560, max: 2020 },
            y: h - 80,
            lifespan: 3000,
            speedY: { min: -10, max: -30 },
            scale: { start: 0.5, end: 2 },
            alpha: { start: 0.4, end: 0 },
            frequency: 300
        });

        // --- TÃ†Â¯Ã†Â NG TÃƒÂC THIÃƒÅ N NHIÃƒÅ N (HOA) ---
        this.flowers = [];
        for (let fx = 500; fx < w * 6; fx += 300) {
            if (fx > 1400 && fx < 2100) continue;
            let ty = this.getTerrainY(fx);
            let flowerContainer = this.add.container(fx, ty).setDepth(6);
            // ThÃƒÂ¢n cÃƒÂ¢y (Ã„â€˜ÃƒÂ¡y tÃ¡ÂºÂ¡i y=0 = mÃ¡ÂºÂ·t Ã„â€˜Ã¡ÂºÂ¥t)
            let stem = this.add.rectangle(0, 0, 3, 30, 0x444433).setOrigin(0.5, 1);
            // NÃ¡Â»Â¥ hoa (ngay trÃƒÂªn Ã„â€˜Ã¡Â»â€°nh thÃƒÂ¢n)
            let bud = this.add.circle(0, -30, 6, 0x666655);
            // CÃƒÂ¡nh hoa (Ã¡ÂºÂ©n, sÃ¡ÂºÂ½ hiÃ¡Â»â€¡n khi nÃ¡Â»Å¸)
            let petal1 = this.add.ellipse(-7, -33, 8, 5, 0xff88aa).setAlpha(0).setAngle(-30);
            let petal2 = this.add.ellipse(7, -33, 8, 5, 0xff88aa).setAlpha(0).setAngle(30);
            let petal3 = this.add.ellipse(0, -38, 5, 8, 0xff88aa).setAlpha(0);
            flowerContainer.add([stem, bud, petal1, petal2, petal3]);
            flowerContainer.stem = stem;
            flowerContainer.bud = bud;
            flowerContainer.petals = [petal1, petal2, petal3];
            flowerContainer.isBloomed = false;
            this.flowers.push(flowerContainer);
        }

        // GÃ¡Â»â€˜c cÃƒÂ¢y bÃ¡ÂºÂ¯c cÃ¡ÂºÂ§u 1 (Scene 5)
        this.fKey = this.input.keyboard.addKey('F');
        this.stumps = [];
        this.createStump(1480, 1536, 512);

        // Hai trÃ¡Â»Â¥ silhouette Ã„â€˜en tuyÃ¡Â»Ân (nhÃ†Â° parallax)
        // CÃ¡Â»â„¢t 1: TÃ¡Â»Â« trÃƒÂªn nÃƒÂ³c (y=0) rÃ¡Â»Â§ xuÃ¡Â»â€˜ng, chÃ¡Â»Â«a 150px khoÃ¡ÂºÂ£ng trÃ¡Â»â€˜ng Ã¡Â»Å¸ dÃ†Â°Ã¡Â»â€ºi (y=460)
        let pillar1Bottom = h - 260; // 720 - 260 = 460
        this.wallJumpLeft = this.add.rectangle(5100, 0, 80, pillar1Bottom, 0x050508, 1).setOrigin(0,0);
        
        // CÃ¡Â»â„¢t 2: TÃ¡Â»Â« dÃ†Â°Ã¡Â»â€ºi Ã„â€˜Ã¡ÂºÂ¥t (h-110) trÃ¡Â»â€œi lÃƒÂªn, chÃ¡Â»Â«a 150px khoÃ¡ÂºÂ£ng trÃ¡Â»â€˜ng Ã¡Â»Å¸ trÃƒÂªn
        let pillar2Top = 150;
        let pillar2Height = (h - 110) - pillar2Top; // 610 - 150 = 460
        // KhoÃ¡ÂºÂ£ng cÃƒÂ¡ch 120px (5180 -> 5300)
        this.wallJumpRight = this.add.rectangle(5300, pillar2Top, 80, pillar2Height, 0x050508, 1).setOrigin(0,0);
        
        this.physics.add.existing(this.wallJumpLeft, true);
        this.physics.add.existing(this.wallJumpRight, true);


        // Player Physics Body (Invisible)
        this.player = this.add.rectangle(200, h - 150, 40, 80, 0x000000, 0);
        this.physics.add.existing(this.player);
        this.player.body.setDragX(800);
        this.player.body.setMaxVelocity(400, 800);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.groundGroup);
        this.physics.add.collider(this.player, this.wallJumpLeft);
        this.physics.add.collider(this.player, this.wallJumpRight);

        // Player Shadow & Aura (Polish)
        // Shadow duoi dat
        // Shadow dưới chân Mầm
        // Shadow dưới chân Mầm
        this.shadow = this.add.ellipse(200, h - 110, 48, 14, 0x000000, 0.6).setDepth(8);

        this.player.body.setGravityY(1200);
        this.player.body.setCollideWorldBounds(true);

        // Khởi tạo Nhân vật Mầm ghép từ 7 layer tách rời (MamPuppet)
        this.playerPuppet = new MamPuppet(this, 200, h - 110);

        this.playerEmitter = this.add.particles(0, 0, 'firefly', {
            speed: { min: -15, max: 15 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 2000,
            blendMode: 'ADD',
            frequency: 300
        });
        this.playerEmitter.startFollow(this.player);

        // --- CÁC VẬT PHẨM THU THẬP TRÊN MAP 1 ---
        this.itemGroup = this.physics.add.staticGroup();
        const rItems = [
            { x: 650, y: h - 160, type: 'seed' },
            { x: 1250, y: h - 160, type: 'coin' },
            { x: 2350, y: h - 160, type: 'seed' },
            { x: 3150, y: h - 160, type: 'potion' },
            { x: 4300, y: h - 160, type: 'coin' },
            { x: 5240, y: 190, type: 'sun_crystal' }
        ];
        rItems.forEach(i => {
            let item = new CollectibleItem(this, i.x, i.y, i.type);
            this.itemGroup.add(item);
        });
        this.physics.add.overlap(this.player, this.itemGroup, (player, item) => item.collect(player));

        this.physics.world.setBounds(0, 0, w * 6, h + 1500);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.isCinematic = true;
        this.playerState = 'none';
        this.playerTween = null;
        this.cameras.main.setBounds(0, 0, w * 6, h + 1500);
        this.cameras.main.scrollX = 0;

        // Cinematic (Camera Pan Only, MÃ¡ÂºÂ§m xuÃ¡ÂºÂ¥t hiÃ¡Â»â€¡n ngay tÃ¡Â»Â« Ã„â€˜Ã¡ÂºÂ§u)
        this.tweens.add({
            targets: this.cameras.main,
            scrollX: 800,
            duration: 4000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.tweens.add({
                    targets: this.cameras.main,
                    scrollX: 0,
                    duration: 3000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        let msg = this.add.text(this.player.x, this.player.y - 80, '...tôi là ai?', { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0.5);
                        this.tweens.add({ 
                            targets: msg, 
                            alpha: 0, 
                            delay: 2000, 
                            duration: 1000,
                            onComplete: () => {
                                this.isCinematic = false;
                                this.registry.set('showUI', true);
                                this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -w/4, 200);
                                
                                let tutContainer = this.add.container(this.player.x + 300, this.player.y - 120);
                                let tutBg = this.add.rectangle(0, 0, 500, 100, 0x000000, 0.7).setStrokeStyle(2, 0x00ff00);
                                let isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                                let line1 = isMobile ? 'Dùng nút ◄ ► bên trái để đi lại' : 'Dùng các phím A, D (Mũi tên) để đi lại';
                                let line2 = isMobile ? 'Dùng nút ⬆ bên phải để Nhảy' : 'Dùng phím Space hoặc W để Nhảy';
                                let tutText1 = this.add.text(0, -20, line1, { font: 'bold 20px Arial', fill: '#ffffff', align: 'center' }).setOrigin(0.5);
                                let tutText2 = this.add.text(0, 20, line2, { font: 'bold 20px Arial', fill: '#00d2d3', align: 'center' }).setOrigin(0.5);
                                tutContainer.add([tutBg, tutText1, tutText2]);
                                tutContainer.setAlpha(0);
                                this.tweens.add({ targets: tutContainer, alpha: 1, duration: 1000, yoyo: true, hold: 6000 });
                            }
                        });
                    }
                });
            }
        });

        // Sinh ra cÃƒÂ¡c bÃ¡Â»Â¥i cÃ¡Â»Â khÃƒÂ´ tÃ†Â°Ã†Â¡ng tÃƒÂ¡c (vÃ¡ÂºÂ½ chi tiÃ¡ÂºÂ¿t hÃ†Â¡n)
        this.grassClumps = [];
        for (let i = 200; i < w * 6; i += Phaser.Math.Between(120, 280)) {
            if (i > 1480 && i < 2100) continue; // BÃ¡Â»Â qua hÃ¡Â»â€˜ Ã„â€˜Ã¡Â»â„¢c
            
            let ty = this.getTerrainY(i);
            let clump = this.add.container(i, ty);
            let bladeCount = Phaser.Math.Between(3, 5);
            let blades = [];
            for (let b = 0; b < bladeCount; b++) {
                let bx = Phaser.Math.Between(-8, 8);
                let bh = Phaser.Math.Between(12, 25);
                let bw = Phaser.Math.Between(3, 5);
                let colors = [0x334433, 0x223322, 0x443344, 0x333333, 0x2a3a2a];
                let color = colors[Phaser.Math.Between(0, colors.length - 1)];
                let blade = this.add.triangle(bx, 0, 0, bh, bw, bh, bw/2, 0, color).setOrigin(0.5, 1);
                blade.origAngle = Phaser.Math.Between(-10, 10);
                blade.setAngle(blade.origAngle);
                blades.push(blade);
            }
            clump.add(blades);
            clump.blades = blades;
            clump.isSwaying = false;
            clump.hasBeenTouched = false;
            this.grassClumps.push(clump);
        }

        // Footstep dust
        this.dustEmitter = this.add.particles(0, 0, 'smoke', {
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.5, end: 0 },
            speedY: { min: -10, max: -30 },
            speedX: { min: -10, max: 10 },
            lifespan: 500,
            tint: 0x555555
        });
        this.dustEmitter.stop(); // Stop auto emission


        // XÃ¡Â»Â­ lÃƒÂ½ game over khi chÃ¡ÂºÂ¡m nÃ†Â°Ã¡Â»â€ºc Ã„â€˜Ã¡Â»â„¢c hoÃ¡ÂºÂ·c rÃ†Â¡i khÃ¡Â»Âi map
        this.triggerGameOver = () => {
            if (this.isGameOvering || this.hasReachedEnd) return;
            this.isGameOvering = true;
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('GameOverScene', { reason: 'Mầm đã rơi xuống hố nước độc và tan biến...', retryScene: 'RunnerScene' });
            });
        };
        this.physics.add.overlap(this.player, this.toxicPit, this.triggerGameOver);
        this.physics.add.overlap(this.player, this.toxicWater, this.triggerGameOver);
        this.physics.add.overlap(this.player, this.deathZone, this.triggerGameOver);

        // BÃ¡Â»Â©c tÃ†Â°Ã¡Â»Âng cao (Ã„â€˜Ã¡Â»â€¹a hÃƒÂ¬nh khÃƒÂ´ng thÃ¡Â»Æ’ nhÃ¡ÂºÂ£y qua) lÃƒÂ¹i xa hÃ†Â¡n
        this.highWall = this.add.rectangle(3500, h - 280, 400, 180, 0x000000, 0).setOrigin(0,0);
        this.physics.add.existing(this.highWall, true);
        this.physics.add.collider(this.player, this.highWall);

        // VÃ¡ÂºÂ½ visuals cho bÃ¡Â»Â©c tÃ†Â°Ã¡Â»Âng (bÃƒÂª tÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢ nÃƒÂ¡t, cÃƒÂ³ cÃ¡Â»â€˜t thÃƒÂ©p vÃƒÂ  sÃ¡Â»Âc cÃ¡ÂºÂ£nh bÃƒÂ¡o)
        
        // --- AUTO-EXPORT WALL ---
        AssetManager.generateAndSave(this, 'map1_wall', 400, 250, (g) => {
            // translate drawing logic to start at 0, 0
            g.fillStyle(0x4a4f54, 1);
            g.fillRect(0, 50, 400, 180); // n?n b? t?ng (offset 50 for top spikes)
            g.fillStyle(0x6a7076, 1);
            g.fillRect(0, 50, 400, 8); // vi?n s?ng

            // s?c c?nh b?o
            g.fillStyle(0xffa500, 1);
            for(let sx = 0; sx < 400; sx += 40) {
                g.beginPath();
                g.moveTo(sx, 50 + 10);
                g.lineTo(sx + 20, 50 + 10);
                g.lineTo(sx - 10, 50 + 180);
                g.lineTo(sx - 30, 50 + 180);
                g.fillPath();
            }

            // v?t n?t
            g.lineStyle(2, 0x222528, 0.8);
            g.beginPath();
            g.moveTo(40, 50);
            g.lineTo(50, 90);
            g.lineTo(35, 130);
            g.lineTo(60, 180);
            g.moveTo(180, 50);
            g.lineTo(170, 100);
            g.lineTo(190, 150);
            g.lineTo(175, 200);
            g.strokePath();

            // c?t th?p g? s?t
            g.lineStyle(3, 0x8b4513, 1);
            g.beginPath();
            g.moveTo(100, 50);
            g.lineTo(95, 30);
            g.lineTo(105, 15);
            g.moveTo(250, 50);
            g.lineTo(260, 35);
            g.lineTo(255, 10);
            g.moveTo(320, 50);
            g.lineTo(315, 25);
            g.strokePath();
        });
        
        let wallX = 3500;
        let wallY = h - 280;
        this.add.image(wallX, wallY - 50, 'map1_wall').setOrigin(0,0);
        

        AssetManager.generateAndSave(this, 'map1_box', 60, 60, (g) => {
            g.fillStyle(0x5c4033, 1);
            g.fillRect(0, 0, 60, 60);
            g.fillStyle(0x704f3f, 1);
            g.fillRect(2, 2, 56, 12);
            g.fillRect(2, 22, 56, 12);
            g.fillRect(2, 42, 56, 12);
            // We can skip the rotation cross for generated graphics since it's hard in primitive graphics without transforms, but we can do lines
            g.lineStyle(6, 0x4a3227, 1);
            g.beginPath();
            g.moveTo(2, 2);
            g.lineTo(58, 58);
            g.strokePath();
            g.lineStyle(4, 0x3a271c, 1);
            g.strokeRect(0, 0, 60, 60);
            g.fillStyle(0x111111, 1);
            g.fillCircle(7, 7, 2);
            g.fillCircle(53, 7, 2);
            g.fillCircle(7, 53, 2);
            g.fillCircle(53, 53, 2);
        });
        
        
        this.box = this.add.rectangle(3100, h - 110, 60, 60, 0x000000, 0).setOrigin(0.5, 1);
        this.physics.add.existing(this.box);
        this.box.body.setImmovable(true);
        this.box.body.setAllowGravity(false);
        this.boxCollider = this.physics.add.collider(this.player, this.box);
        
        this.boxShadow = this.add.ellipse(3112, h - 110, 70, 16, 0x000000, 0.55).setDepth(4);
        this.boxVisuals = this.add.container(3100, h - 110).setDepth(15);
        let boxImg = this.add.image(0, -30, 'map1_box').setOrigin(0.5, 0.5);
        this.boxVisuals.add(boxImg);

        this.boxPrompt = this.add.text(0, 0, '', { font: 'bold 18px Arial', fill: '#00d2d3', backgroundColor: '#1e272e', padding: { x: 10, y: 6 } }).setOrigin(0.5).setAlpha(0).setDepth(200);
        this.boxPrompt.setInteractive({ useHandCursor: true });
        this.boxPrompt.on('pointerdown', () => {
            if (this.isAttachedToBox) {
                // Buông hộp ra
                this.isAttachedToBox = false;
                this.player.body.setMaxVelocityX(400);
                this.boxCollider.active = true;
                this.box.body.reset(this.box.x, this.boxOrigY);
            } else if (this.player.body.onFloor()) {
                // Cầm hộp vào
                this.isAttachedToBox = true;
                this.boxSide = (this.box.x > this.player.x) ? 'right' : 'left';
                this.boxCollider.active = false;
            }
        });
        this.isAttachedToBox = false;
        this.boxOrigY = h - 110;
        
        // Foreground (TiÃ¡Â»Ân cÃ¡ÂºÂ£nh che khuÃ¡ÂºÂ¥t mÃƒÂ n hÃƒÂ¬nh) - Parallax 1.3
        
        // --- AUTO-EXPORT FOREGROUND PARALLAX ---
        AssetManager.generateAndSave(this, 'map1_fg', 5500, h + 1500, (fgGraphics) => {
            fgGraphics.fillStyle(0x050508, 0.95);
            // Copy logic

        
         
        
        
        
        for(let x = 600; x < 5500; x += Phaser.Math.Between(400, 800)) {
            
            fgGraphics.beginPath();
            fgGraphics.moveTo(x, h + 1500); 
            fgGraphics.lineTo(x, h);
            fgGraphics.lineTo(x + Phaser.Math.Between(20, 60), h - Phaser.Math.Between(30, 80));
            fgGraphics.lineTo(x + Phaser.Math.Between(80, 150), h - Phaser.Math.Between(20, 50));
            fgGraphics.lineTo(x + 200, h);
            fgGraphics.lineTo(x + 200, h + 1500); 
            fgGraphics.fillPath();
            
            
            if (Math.random() > 0.5) {
                fgGraphics.lineStyle(5, 0x050508, 0.95);
                fgGraphics.beginPath();
                let poleStartX = x + 50;
                let poleEndX = x + Phaser.Math.Between(20, 80);
                let poleEndY = h - Phaser.Math.Between(100, 150);
                
                fgGraphics.moveTo(poleStartX + (poleStartX - poleEndX) * 10, h + 1500);
                fgGraphics.lineTo(poleEndX, poleEndY);
                fgGraphics.strokePath();
            }
        }

        
        fgGraphics.lineStyle(4, 0x050508, 0.9);
        for(let x = 200; x < w * 6; x += Phaser.Math.Between(500, 1000)) {
            fgGraphics.beginPath();
            fgGraphics.moveTo(x, 0);
            let endX = x + Phaser.Math.Between(150, 400);
            
            let sagY = Phaser.Math.Between(50, 200);
            fgGraphics.lineTo(x + (endX - x)*0.25, sagY * 0.75);
            fgGraphics.lineTo(x + (endX - x)*0.5, sagY);
            fgGraphics.lineTo(x + (endX - x)*0.75, sagY * 0.75);
            fgGraphics.lineTo(endX, 0);
            fgGraphics.strokePath();

            
            if (Math.random() > 0.5) {
                fgGraphics.beginPath();
                fgGraphics.moveTo(x + 50, 0);
                fgGraphics.lineTo(x + 50 + Phaser.Math.Between(-30, 30), Phaser.Math.Between(100, 300));
                fgGraphics.strokePath();
            }
        }
        });
        // this.add.image(0, 0, 'map1_fg').setOrigin(0, 0).setScrollFactor(1.3).setDepth(100);

        
        // BÃ¡Â»Æ’ nÃ†Â°Ã¡Â»â€ºc Ã„â€˜Ã¡Â»â„¢c khÃ¡Â»â€¢ng lÃ¡Â»â€œ Ã¡Â»Å¸ Ã„â€˜ÃƒÂ¡y vÃ¡Â»Â±c (bÃ¡ÂºÂ¯t Ã„â€˜Ã¡ÂºÂ§u tÃ¡Â»Â« x=7250, nÃ†Â¡i dÃ¡Â»â€˜c chÃ¡ÂºÂ¡m mÃ¡ÂºÂ·t nÃ†Â°Ã¡Â»â€ºc)
        // DÃ¡Â»â€˜c tÃ¡Â»Â« h-110 xuÃ¡Â»â€˜ng tÃ¡ÂºÂ­n h+890. MÃ¡ÂºÂ·t nÃ†Â°Ã¡Â»â€ºc Ã¡Â»Å¸ mÃ¡Â»Â©c h+800.
        this.toxicWater = this.add.rectangle(7250, h + 800, 2000, 1500, 0x000000, 0).setOrigin(0, 0); 
        this.physics.add.existing(this.toxicWater, true); 
        let endLake = this.add.container(6500, h + 800).setDepth(3);
        let el1 = this.add.rectangle(0, -70, 3000, 1500, 0x1a0022, 0.95).setOrigin(0, 0);
        let el2 = this.add.rectangle(0, -85, 3000, 30, 0x33004d, 0.7).setOrigin(0, 0);
        
        AssetManager.generateAndSave(this, 'end_lake_surface', 3000, 18, (g) => {
            g.fillStyle(0x8800aa, 0.4);
            g.fillRect(0, 0, 3000, 18);
        });
        let elG = this.add.image(0, -100, 'end_lake_surface').setOrigin(0, 0);
        endLake.add([el1, el2, elG]);
        
        // ThÃƒÂªm vÃƒÂ i hÃ¡ÂºÂ¡t bÃ¡Â»Â¥i mÃ¡Â»Â (fog/dust) bay Ã¡Â»Å¸ tiÃ¡Â»Ân cÃ¡ÂºÂ£nh
        this.add.particles(0, 0, 'smoke', {
            x: { min: 0, max: w * 6 },
            y: { min: 0, max: h },
            speedX: { min: -20, max: 20 },
            speedY: { min: -10, max: 10 },
            scale: { start: 3, end: 5 },
            alpha: { start: 0, end: 0.1, yoyo: true },
            lifespan: 8000,
            frequency: 300,
            tint: 0x333333
        }).setScrollFactor(1.1).setDepth(99);
    }

    update() {
        // Sync sprite to invisible physics body LUÃƒâ€N LUÃƒâ€N CHÃ¡ÂºÂ Y
                        

        // --- BÓNG ĐỔ NGHIÊNG & CHIẾU SÁNG REALTIME ---
        let groundY = this.getTerrainY(this.player.x);
        let slope = this.getTerrainSlope(this.player.x);
        AtmosphereFX.updateDirectionalShadow(this.shadow, this.player.x, this.player.y + 40, groundY, slope, 0.45);
        

        if (this.isCinematic) return;
        
        let pX = this.player.x;
        let pY = this.player.y;

        // SÃ¡Â»Â­ dÃ¡Â»Â¥ng Arcade Physics Ã„â€˜Ã¡Â»Æ’ kiÃ¡Â»Æ’m tra Ã„â€˜Ã¡Â»Â©ng trÃƒÂªn Ã„â€˜Ã¡ÂºÂ¥t (hoÃ¡ÂºÂ·c hÃ¡Â»â„¢p)
        let isGrounded = this.player.body.touching.down || this.player.body.blocked.down || this.player.body.onFloor();
        let touch = this.registry.get("touchControls");
        let isTouchLeft = !!(touch && touch.isLeft);
        let isTouchRight = !!(touch && touch.isRight);
        let isTouchJump = !!(touch && touch.isJump);
        if (touch && touch.isJump) { touch.isJump = false; }

        let isMovingLeft = (this.cursors.left && this.cursors.left.isDown) || (this.keyA && this.keyA.isDown) || isTouchLeft;
        let isMovingRight = (this.cursors.right && this.cursors.right.isDown) || (this.keyD && this.keyD.isDown) || isTouchRight;

        let isMoving = false;
        let isJumping = false;

        
        let isJumpPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
                             Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                             Phaser.Input.Keyboard.JustDown(this.keyW) || 
                             isTouchJump;
        let isSpacePressed = isJumpPressed;
        
        // Khu vÃ¡Â»Â±c hÃ¡Â»â€˜ tÃ†Â°Ã¡Â»Âng (tÃ¡Â»Â« x=5180 Ã„â€˜Ã¡ÂºÂ¿n x=5300, y > 150)
        let inWallJumpZone = (this.player.x > 5160 && this.player.x < 5320 && this.player.y > 150);

        if (isSpacePressed && !this.isAttachedToBox) {
            if (isGrounded) {
                // NhÃ¡ÂºÂ£y thÃ†Â°Ã¡Â»Âng
                this.player.body.setVelocityY(-650);
                isJumping = true;
                this.dustEmitter.explode(10, this.player.x, this.player.y + 40);
                this.lastWallJump = null;
            } else if (inWallJumpZone) {
                // TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng hÃƒÂ³a hoÃƒÂ n toÃƒÂ n viÃ¡Â»â€¡c nhÃ¡ÂºÂ£y tÃ†Â°Ã¡Â»Âng! KhÃƒÂ´ng cÃ¡ÂºÂ§n bÃ¡ÂºÂ¥m phÃƒÂ­m ngang hay bÃƒÂ¡m sÃƒÂ¡t tÃ†Â°Ã¡Â»Âng.
                if (this.player.x < 5240 && this.lastWallJump !== 'left') {
                    // Ã„Âang Ã¡Â»Å¸ nÃ¡Â»Â­a trÃƒÂ¡i -> BÃ¡ÂºÂ­t sang phÃ¡ÂºÂ£i
                    this.player.body.setVelocity(400, -600);
                    this.lastWallJump = 'left';
                    isJumping = true;
                    this.dustEmitter.explode(10, this.player.x - 20, this.player.y);
                } else if (this.player.x >= 5240 && this.lastWallJump !== 'right') {
                    // Ã„Âang Ã¡Â»Å¸ nÃ¡Â»Â­a phÃ¡ÂºÂ£i -> BÃ¡ÂºÂ­t sang trÃƒÂ¡i
                    this.player.body.setVelocity(-400, -600);
                    this.lastWallJump = 'right';
                    isJumping = true;
                    this.dustEmitter.explode(10, this.player.x + 20, this.player.y);
                }
            }
        }

        // HÃ¡Â»Â§y khÃƒÂ³a di chuyÃ¡Â»Æ’n nÃ¡ÂºÂ¿u Ã„â€˜ÃƒÂ£ bay lÃƒÂªn tÃ¡Â»â€ºi Ã„â€˜Ã¡Â»â€°nh hÃ¡Â»â€˜ (Ã„â€˜Ã¡Â»Æ’ ngÃ†Â°Ã¡Â»Âi chÃ†Â¡i cÃƒÂ³ thÃ¡Â»Æ’ Ã„â€˜iÃ¡Â»Âu khiÃ¡Â»Æ’n sang phÃ¡ÂºÂ£i)
        let topOfTower = 160; 
        if (this.player.y <= topOfTower) {
            this.lastWallJump = null;
        }

        // XÃ¡Â»Â­ lÃƒÂ½ di chuyÃ¡Â»Æ’n ngang
        // KHÃƒâ€œA di chuyÃ¡Â»Æ’n ngang hoÃƒÂ n toÃƒÂ n khi Ã„â€˜ang bay trong hÃ¡Â»â€˜ tÃ†Â°Ã¡Â»Âng Ã„â€˜Ã¡Â»Æ’ tÃ¡ÂºÂ¡o cÃ¡ÂºÂ£m giÃƒÂ¡c tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng rÃ†Â¡i & nÃ¡ÂºÂ£y
        if (inWallJumpZone && !isGrounded && this.player.y > topOfTower) {
            // KhÃƒÂ´ng setVelocityX() Ã¡Â»Å¸ Ã„â€˜ÃƒÂ¢y Ã„â€˜Ã¡Â»Æ’ giÃ¡Â»Â¯ nguyÃƒÂªn quÃƒÂ¡n tÃƒÂ­nh bay
            // QuÃƒÂ¡n tÃƒÂ­nh bÃ¡ÂºÂ­t tÃ†Â°Ã¡Â»Âng sÃ¡ÂºÂ½ tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng Ã„â€˜Ã¡ÂºÂ©y ngÃ†Â°Ã¡Â»Âi chÃ†Â¡i Ã„â€˜Ã¡ÂºÂ­p vÃƒÂ o mÃ¡ÂºÂ·t tÃ†Â°Ã¡Â»Âng Ã„â€˜Ã¡Â»â€˜i diÃ¡Â»â€¡n
        } else {
            // ChÃ¡ÂºÂ¿ Ã„â€˜Ã¡Â»â„¢ di chuyÃ¡Â»Æ’n bÃƒÂ¬nh thÃ†Â°Ã¡Â»Âng
            if (isMovingLeft) {
                this.player.body.setVelocityX(-350);
                isMoving = true;
                if (this.playerPuppet.setFlipX) this.playerPuppet.setFlipX(true);
            } else if (isMovingRight) {
                this.player.body.setVelocityX(350);
                isMoving = true;
                if (this.playerPuppet.setFlipX) this.playerPuppet.setFlipX(false);
            } else {
                this.player.body.setVelocityX(0);
            }
        }
        // (Cleaned up old wall jump logic)

        // --- XÃ¡Â»Â­ lÃƒÂ½ trÃ†Â°Ã¡Â»Â£t dÃ¡Â»â€˜c (Slope Physics) ---
        if (isGrounded) {
            let slope = this.getTerrainSlope(pX);
            
            // NÃ¡ÂºÂ¿u Ã„â€˜i lÃƒÂªn dÃ¡Â»â€˜c, giÃ¡ÂºÂ£m tÃ¡Â»â€˜c Ã„â€˜Ã¡Â»â„¢
            if (slope < -0.1 && isMovingRight) {
                this.player.body.velocity.x *= 0.5; // DÃ¡Â»â€˜c lÃƒÂªn bÃƒÂªn phÃ¡ÂºÂ£i
            } else if (slope > 0.1 && isMovingLeft) {
                this.player.body.velocity.x *= 0.5; // DÃ¡Â»â€˜c lÃƒÂªn bÃƒÂªn trÃƒÂ¡i
            }
            
            // NÃ¡ÂºÂ¿u khÃƒÂ´ng bÃ¡ÂºÂ¥m nÃƒÂºt di chuyÃ¡Â»Æ’n mÃƒÂ  Ã„â€˜Ã¡Â»Â©ng trÃƒÂªn dÃ¡Â»â€˜c thÃƒÂ¬ trÃ†Â°Ã¡Â»Â£t xuÃ¡Â»â€˜ng
            if (!isMovingLeft && !isMovingRight) {
                if (slope > 0.1) {
                    this.player.body.velocity.x += slope * 15; // TrÃ†Â°Ã¡Â»Â£t phÃ¡ÂºÂ£i
                } else if (slope < -0.1) {
                    this.player.body.velocity.x += slope * 15; // TrÃ†Â°Ã¡Â»Â£t trÃƒÂ¡i
                }
            } else {
                // NÃ¡ÂºÂ¿u Ã„â€˜i xuÃ¡Â»â€˜ng dÃ¡Â»â€˜c, Ã„â€˜i nhanh hÃ†Â¡n chÃƒÂºt
                if (slope > 0.1 && isMovingRight) {
                    this.player.body.velocity.x += 100;
                } else if (slope < -0.1 && isMovingLeft) {
                    this.player.body.velocity.x -= 100;
                }
            }
        }

        if (isMoving && isGrounded) {
            if (!this.lastDustTime || this.time.now - this.lastDustTime > 150) {
                this.dustEmitter.emitParticleAt(this.player.x, this.player.y + 40);
                this.lastDustTime = this.time.now;
            }
        }

// Old conflicting tween removed to eliminate NaN flickering

        // --- LOGIC TÃ†Â¯Ã†Â NG TÃƒÂC THIÃƒÅ N NHIÃƒÅ N ---
        // CÃ¡Â»Â lay Ã„â€˜Ã¡Â»â„¢ng
        let px = this.player.x;
        let py = this.player.y + 40; // TÃ¡Â»Âa Ã„â€˜Ã¡Â»â„¢ Ã„â€˜ÃƒÂ¡y cÃ¡Â»Â§a MÃ¡ÂºÂ§m
        let vx = this.player.body.velocity.x;
        let hitRadius = this.player.body.width / 2; // NÃ¡Â»Â­a chiÃ¡Â»Âu rÃ¡Â»â„¢ng hitbox (20px)

        this.grassClumps.forEach(clump => {
            if (!clump.isSwaying && Math.abs(px - clump.x) <= hitRadius && Math.abs(py - clump.y) < 30 && Math.abs(vx) > 5) {
                clump.isSwaying = true;
                
                // ChÃ¡ÂºÂ¡m vÃƒÂ o Ã¢â€ â€™ Ã„â€˜Ã¡Â»â€¢i mÃƒÂ u xanh vÃ„Â©nh viÃ¡Â»â€¦n
                if (!clump.hasBeenTouched) {
                    clump.hasBeenTouched = true;
                    clump.blades.forEach(b => b.setFillStyle(0x00aa00));
                }

                // Animation TÃ¡Â»ÂªNG LÃƒÂ CÃ¡Â»Å½ uÃ¡Â»â€˜n lÃ†Â°Ã¡Â»Â£n theo hÃ†Â°Ã¡Â»â€ºng di chuyÃ¡Â»Æ’n
                let swayDir = vx > 0 ? 1 : -1;
                clump.blades.forEach((blade, idx) => {
                    let delay = idx * 50; // LÃ¡Â»â€¡ch thÃ¡Â»Âi gian giÃ¡Â»Â¯a cÃƒÂ¡c lÃƒÂ¡
                    let swayAngle = blade.origAngle + swayDir * Phaser.Math.Between(25, 45);
                    this.tweens.add({
                        targets: blade,
                        angle: swayAngle,
                        duration: 150,
                        delay: delay,
                        ease: 'Quad.easeOut',
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => {
                            blade.setAngle(blade.origAngle);
                            if (idx === clump.blades.length - 1) {
                                clump.isSwaying = false;
                            }
                        }
                    });
                });
            }
        });

        // NÃ¡Â»Å¸ hoa
        this.flowers.forEach(flower => {
            if (!flower.isBloomed && Math.abs(px - flower.x) <= hitRadius && Math.abs(py - flower.y) < 30) {
                flower.isBloomed = true;
                // ThÃƒÂ¢n cÃƒÂ¢y hÃƒÂ³a xanh
                flower.stem.setFillStyle(0x228833);
                // NÃ¡Â»Â¥ hoa Ã„â€˜Ã¡Â»â€¢i mÃƒÂ u
                flower.bud.setFillStyle(0xffcc00);
                // CÃƒÂ¡nh hoa nÃ¡Â»Å¸ ra vÃ¡Â»â€ºi animation
                flower.petals.forEach((petal, idx) => {
                    this.tweens.add({
                        targets: petal,
                        alpha: 1,
                        scaleX: 1.5,
                        scaleY: 1.5,
                        duration: 400,
                        delay: idx * 100,
                        ease: 'Back.easeOut'
                    });
                });
                // BÃ¡ÂºÂ¯n hÃ¡ÂºÂ¡t Ã„â€˜om Ã„â€˜ÃƒÂ³m
                let emitter = this.add.particles(flower.x, flower.y - 30, 'firefly', {
                    speed: { min: -50, max: 50 },
                    scale: { start: 1, end: 0 },
                    lifespan: 2000,
                    blendMode: 'ADD'
                });
                emitter.explode(10);
            }
        });

        // TÃ†Â°Ã†Â¡ng tÃƒÂ¡c hÃ¡Â»â„¢p carton (giÃ¡ÂºÂ£i Ã„â€˜Ã¡Â»â€˜ Ã„â€˜Ã¡ÂºÂ©y thÃƒÂ¹ng)
        let distToBox = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.box.x, this.box.y - 30);
        let isNearBox = distToBox < 100;

        if (this.isAttachedToBox) {
            // TÃ¡ÂºÂ¯t collider Ã„â€˜Ã¡Â»Æ’ player Ã„â€˜i xuyÃƒÂªn qua hÃ¡Â»â„¢p (Ã„â€˜Ã¡ÂºÂ©y Ã„â€˜Ã†Â°Ã¡Â»Â£c)
            this.boxCollider.active = false;
            // GiÃ¡ÂºÂ£m tÃ¡Â»â€˜c Ã„â€˜Ã¡Â»â„¢ khi Ã„â€˜ang kÃƒÂ©o/Ã„â€˜Ã¡ÂºÂ©y hÃ¡Â»â„¢p (sÃ¡Â»Â©c trÃƒÂ¬, cÃ¡ÂºÂ£m giÃƒÂ¡c nÃ¡ÂºÂ·ng)
            this.player.body.setMaxVelocityX(150);

            // TÃƒÂ­nh giÃ¡Â»â€ºi hÃ¡ÂºÂ¡n hÃ¡Â»â„¢p: mÃƒÂ©p phÃ¡ÂºÂ£i hÃ¡Â»â„¢p khÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c chÃ¡ÂºÂ¡m mÃƒÂ©p trÃƒÂ¡i tÃ†Â°Ã¡Â»Âng
            // TÃ†Â°Ã¡Â»Âng tÃ¡ÂºÂ¡i x=3500, hÃ¡Â»â„¢p rÃ¡Â»â„¢ng 60 origin(0.5,1) Ã¢â€ â€™ mÃƒÂ©p phÃ¡ÂºÂ£i = box.x + 30
            let wallLeftEdge = 3500;
            let boxHalfW = 30;
            let playerHalfW = 20; // player rÃ¡Â»â„¢ng 40

            // HÃ¡Â»â„¢p luÃƒÂ´n nÃ¡ÂºÂ±m bÃƒÂªn cÃ¡ÂºÂ¡nh player
            let boxTargetX;
            if (this.boxSide === 'right') {
                boxTargetX = this.player.x + 50;
            } else {
                boxTargetX = this.player.x - 50;
            }

            // Clamp hÃ¡Â»â„¢p: khÃƒÂ´ng vÃ†Â°Ã¡Â»Â£t qua tÃ†Â°Ã¡Â»Âng vÃƒÂ  khÃƒÂ´ng ra ngoÃƒÂ i map
            let boxMaxX = wallLeftEdge - boxHalfW; // 3470
            let boxMinX = boxHalfW; // 30
            boxTargetX = Phaser.Math.Clamp(boxTargetX, boxMinX, boxMaxX);

            this.box.setPosition(boxTargetX, this.boxOrigY);
            this.box.body.reset(boxTargetX, this.boxOrigY);
            this.boxVisuals.setPosition(boxTargetX, this.boxOrigY);
            if (this.boxShadow) this.boxShadow.setPosition(boxTargetX + 12, this.boxOrigY);

            // Clamp player: khÃƒÂ´ng Ã„â€˜i chÃ¡Â»â€œng lÃƒÂªn hÃ¡Â»â„¢p khi hÃ¡Â»â„¢p Ã„â€˜ÃƒÂ£ chÃ¡ÂºÂ¡m tÃ†Â°Ã¡Â»Âng
            if (this.boxSide === 'right' && this.player.x > boxTargetX - 50) {
            this.player.x = boxTargetX - 50;
                this.player.body.setVelocityX(0);
            } else if (this.boxSide === 'left' && this.player.x < boxTargetX + 50) {
                this.player.x = boxTargetX + 50;
                this.player.body.setVelocityX(0);
            }

            let isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            this.boxPrompt.x = this.box.x;
            this.boxPrompt.y = this.box.y - 80;
            this.boxPrompt.setText(isMobile ? '📦 Chạm để Buông ra' : '📦 Bấm F để Buông ra');
            this.boxPrompt.setAlpha(1);

            // BuÃƒÂ´ng ra khi bÃ¡ÂºÂ¥m F
            if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
                this.isAttachedToBox = false;
                this.player.body.setMaxVelocityX(400);
                this.boxCollider.active = true;
                this.box.body.reset(this.box.x, this.boxOrigY);
            }
        } else if (isNearBox) {
            let isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            this.boxPrompt.x = this.box.x;
            this.boxPrompt.y = this.box.y - 80;
            this.boxPrompt.setText(isMobile ? '📦 Chạm để Cầm hộp' : '📦 Bấm F để Cầm hộp');
            this.boxPrompt.setAlpha(1);

            if (Phaser.Input.Keyboard.JustDown(this.fKey) && this.player.body.onFloor()) {
                this.isAttachedToBox = true;
                // XÃƒÂ¡c Ã„â€˜Ã¡Â»â€¹nh hÃ¡Â»â„¢p nÃ¡ÂºÂ±m bÃƒÂªn nÃƒÂ o so vÃ¡Â»â€ºi player
                this.boxSide = (this.box.x > this.player.x) ? 'right' : 'left';
            }
        } else {
            this.boxPrompt.setAlpha(0);
        }

        // HÃ¡Â»â€œi sinh gÃ¡Â»â€˜c cÃƒÂ¢y bÃ¡ÂºÂ¯c cÃ¡ÂºÂ§u bÃ¡ÂºÂ±ng nÃƒÂºt F
        if (this.stumps) {
            this.stumps.forEach(stumpObj => {
                let stump = stumpObj.container;
                let prompt = stumpObj.prompt;
                
                let isNearStump = !stump.isBloomed && Math.abs(px - stump.x) <= hitRadius * 3 && Math.abs(py - stump.y) < 40;
                if (isNearStump) {
                    prompt.setAlpha(1);
                    if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
                        this.reviveStump(stump, prompt);
                        
                        // HÃ¡Â»â€œi sinh gÃ¡Â»â€˜c cÃƒÂ¢y: thÃƒÂªm rÃƒÂªu + lÃƒÂ¡ mÃ¡Â»Âc tÃ¡Â»Â± nhiÃƒÂªn
                        let moss1 = this.add.ellipse(-6, -18, 14, 7, 0x1a6633, 0.5);
                        let moss2 = this.add.ellipse(8, -30, 10, 5, 0x227744, 0.4);
                        let leaf1 = this.add.triangle(18, -45, 0, 14, 16, 7, 8, 0, 0x2d8a4e).setOrigin(0.5, 1).setAngle(25);
                        let leaf2 = this.add.triangle(-12, -48, 0, 12, 14, 6, 7, 0, 0x3da35d).setOrigin(0.5, 1).setAngle(-20);
                        stump.add([moss1, moss2, leaf1, leaf2]);
                        [moss1, moss2, leaf1, leaf2].forEach((item, i) => {
                            item.setScale(0);
                            this.tweens.add({ targets: item, scale: 1, duration: 500, delay: i * 120, ease: 'Back.easeOut' });
                        });
                        
                        // CÃ¡ÂºÂ§u dÃƒÂ¢y leo bÃ¡ÂºÂ¯c qua hÃ¡Â»â€˜ - dÃƒÂ¹ng Graphics vÃ¡ÂºÂ½ tÃ¡Â»Â± nhiÃƒÂªn
                        let bridgeY = this.cameras.main.height - 112;
                        let bridgeImg = this.add.image(stump.bridgeStartX, bridgeY - 20, 'map1_vine_bridge').setOrigin(0, 0);
                        bridgeImg.setCrop(0, 0, 0, 100);
                        // Scale the image width to match the bridge length perfectly so the sine wave ends at 0
                        bridgeImg.setDisplaySize(stump.bridgeLength, 100);
                        
                        let drawObj = { w: 0 };
                        this.tweens.add({
                            targets: drawObj,
                            w: stump.bridgeLength,
                            duration: 1500,
                            ease: 'Linear',
                            onUpdate: () => {
                                // reveal the bridge progressively by adjusting crop based on the UN-SCALED original width
                                let progress = drawObj.w / stump.bridgeLength;
                                bridgeImg.setCrop(0, 0, 750 * progress, 100);
                            },
                            onComplete: () => {
                                allLeaves.forEach((leaf, i) => {
                                    this.tweens.add({
                                        targets: leaf,
                                        alpha: 0.85,
                                        scale: 1,
                                        duration: 300,
                                        delay: i * 30,
                                        ease: 'Back.easeOut'
                                    });
                                });
                            }
                        });
                        
                        // LÃƒÂ¡ treo lÃ¡Â»Â§ng lÃ¡ÂºÂ³ng dÃ†Â°Ã¡Â»â€ºi dÃƒÂ¢y leo (Ã¡ÂºÂ©n ban Ã„â€˜Ã¡ÂºÂ§u)
                        let allLeaves = [];
                        for (let lx = 50; lx < stump.bridgeLength; lx += Phaser.Math.Between(30, 70)) {
                            let progress = lx / stump.bridgeLength;
                            // TÃƒÂ­nh toÃƒÂ¡n y theo Ã„â€˜Ã†Â°Ã¡Â»Âng vÃƒÂµng (lÃ¡ÂºÂ¥y Ã„â€˜Ã¡Â»â„¢ vÃƒÂµng trung bÃƒÂ¬nh lÃƒÂ  25)
                            let curveY = Math.sin(progress * Math.PI) * 25;
                            let leaf = this.add.ellipse(stump.bridgeStartX + lx, bridgeY + curveY + 5 + Phaser.Math.Between(0, 15), 10, 20, 0x4fc26d).setOrigin(0.5, 0).setAlpha(0);
                            if (Math.random() > 0.5) leaf.setAngle(Phaser.Math.Between(-30, 30));
                            allLeaves.push(leaf);
                        }
                        
                        // Physics body tÃƒÂ ng hÃƒÂ¬nh
                        let bridgePhysics = this.add.rectangle(stump.bridgeStartX, bridgeY + 2, stump.bridgeLength, 200, 0x000000, 0).setOrigin(0, 0);
                        this.physics.add.existing(bridgePhysics, true);
                        this.physics.add.collider(this.player, bridgePhysics);

                        let emitter = this.add.particles(stump.bridgeStartX, bridgeY + 2, 'firefly', {
                            speed: { min: -80, max: 80 },
                            scale: { start: 0.8, end: 0 },
                            lifespan: 2500,
                            blendMode: 'ADD'
                        });
                        emitter.explode(25);
                    }
                } else {
                    prompt.setAlpha(0);
                }
            });
        }

        // --- TRIGGER PHÃƒÂO KÃƒÂCH ---
        if (this.player.x > 3950 && this.player.body.touching.down && !this.hasTriggeredArtillery) {
            this.hasTriggeredArtillery = true;
            this.isCinematic = true;
            this.player.body.setAccelerationX(0);
            this.player.body.setVelocityX(0);
            this.player.body.setVelocityY(0);
            
            // Pan camera tÃ¡Â»â€ºi trÃ†Â°Ã¡Â»â€ºc mÃ¡ÂºÂ·t mÃ¡Â»â„¢t chÃƒÂºt
            this.cameras.main.stopFollow();
            this.tweens.add({
                targets: this.cameras.main,
                scrollX: 4200 - this.cameras.main.width / 2,
                duration: 1000,
                ease: 'Quad.easeInOut',
                onComplete: () => {
                    this.triggerArtilleryStrike();
                }
            });
        }

        const w = this.cameras.main.width;
        if (this.player.x > 7250 && !this.hasReachedEnd && this.cratersCreated) {
            this.hasReachedEnd = true;
            this.isCinematic = true;
            this.player.body.setAccelerationX(0);
            this.player.body.setVelocityX(0);
            this.showChoiceUI();
        }
    }

    showChoiceUI() {
        const cx = this.cameras.main.scrollX + this.cameras.main.width / 2;
        const cy = this.cameras.main.scrollY + this.cameras.main.height / 2;

        let bg = this.add.rectangle(cx, cy, 500, 250, 0x000000, 0.8).setStrokeStyle(2, 0xffffff);
        let text = this.add.text(cx, cy - 50, 'Quê hương đã ô nhiễm nặng nề...\nBạn có muốn ở lại?', { font: 'bold 24px Arial', fill: '#ffffff', align: 'center' }).setOrigin(0.5);

        let btnNo = this.add.rectangle(cx - 100, cy + 50, 120, 50, 0xaa0000).setInteractive();
        let txtNo = this.add.text(cx - 100, cy + 50, 'RỜI ĐI', { font: 'bold 20px Arial', fill: '#ffffff' }).setOrigin(0.5);
        btnNo.on('pointerdown', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('MapSelectionScene');
            });
        });

        let btnYes = this.add.rectangle(cx + 100, cy + 50, 120, 50, 0x00aa00).setInteractive();
        let txtYes = this.add.text(cx + 100, cy + 50, 'Ở LẠI', { font: 'bold 20px Arial', fill: '#ffffff' }).setOrigin(0.5);
        btnYes.on('pointerdown', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('GameOverScene', { reason: 'Mầm đã bị nước độc ăn mòn và chết cùng quê hương.', retryScene: 'RunnerScene' });
            });
        });
    }

    triggerArtilleryStrike() {
        let h = this.cameras.main.height;
        let w = this.cameras.main.width;
        let p1X = 4300;
        let p2X = 4600;
        
        // 1. Rung lÃ¡ÂºÂ¯c nhÃ¡ÂºÂ¹ & CÃƒÂ¢u thoÃ¡ÂºÂ¡i "CÃƒÂ¡i gÃƒÂ¬ vÃ¡ÂºÂ­y?"
        this.cameras.main.shake(1000, 0.005);
        let msg = this.add.text(this.player.x, this.player.y - 80, 'Cái gì vậy?', { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0.5);
        
        this.time.delayedCall(1500, () => {
            msg.destroy();
            
            // 2. Hai quÃ¡ÂºÂ£ Ã„â€˜Ã¡ÂºÂ¡n phÃƒÂ¡o rÃ†Â¡i
            let shell1 = this.add.rectangle(p1X, -100, 10, 30, 0xffaa00);
            let shell2 = this.add.rectangle(p2X, -200, 10, 30, 0xffaa00);
            
            this.tweens.add({
                targets: shell1,
                y: h - 110,
                duration: 500,
                ease: 'Linear',
                onComplete: () => {
                    shell1.destroy();
                    this.cameras.main.shake(500, 0.02);
                    this.dustEmitter.explode(50, p1X, h - 110);
                }
            });
            
            this.tweens.add({
                targets: shell2,
                y: h - 110,
                duration: 600,
                ease: 'Linear',
                onComplete: () => {
                    shell2.destroy();
                    this.cameras.main.shake(800, 0.03);
                    this.dustEmitter.explode(80, p2X, h - 110);
                    
                    // KÃƒÂ­ch hoÃ¡ÂºÂ¡t hÃ¡Â»â€˜ bom khÃ¡Â»â€¢ng lÃ¡Â»â€œ vÃƒÂ  vÃ¡ÂºÂ½ lÃ¡ÂºÂ¡i Ã„â€˜Ã¡Â»â€¹a hÃƒÂ¬nh
                    this.cratersCreated = true;
                    
        
        
        
        
        

        // Add them to the scene visually as placeholders
        
        
        
        
        
        
        
        
        

        // Add them to the scene visually
        
        
        
        this.rebuildTerrain();
                    this.createStump(4050, 4100, 750);
                    
                    // 3. NÃ†Â°Ã¡Â»â€ºc Ã„â€˜Ã¡Â»â„¢c chÃ¡ÂºÂ¥t lÃ†Â°Ã¡Â»Â£ng cao trÃƒÂ n vÃƒÂ o tÃ¡Â»Â« dÃ†Â°Ã¡Â»â€ºi lÃƒÂªn
                    // Ã„ÂÃ¡ÂºÂ·t nÃ†Â°Ã¡Â»â€ºc nÃ¡ÂºÂ±m cÃ¡Â»â€˜ Ã„â€˜Ã¡Â»â€¹nh ngay hÃ¡Â»â€˜ (4150) nhÃ†Â°ng bÃ¡ÂºÂ¯t Ã„â€˜Ã¡ÂºÂ§u tÃ¡Â»Â« y sÃƒÂ¢u bÃƒÂªn dÃ†Â°Ã¡Â»â€ºi (h + 200)
                    let floodContainer = this.add.container(4150, h + 200).setDepth(3);
                    
                    let w1 = this.add.rectangle(0, -70, 1000, 400, 0x1a0022, 0.95).setOrigin(0, 0); // KÃƒÂ©o dÃƒÂ i chiÃ¡Â»Âu cao xuÃ¡Â»â€˜ng dÃ†Â°Ã¡Â»â€ºi
                    let w2 = this.add.rectangle(0, -85, 1000, 30, 0x33004d, 0.7).setOrigin(0, 0);
                    let wG = this.add.graphics();
                    wG.fillStyle(0x8800aa, 0.4);
                    wG.fillRect(0, -100, 1000, 18);
                    wG.fillStyle(0xaa33cc, 0.25);
                    wG.fillRect(0, -102, 1000, 6);
                    
                    floodContainer.add([w1, w2, wG]);
                    
                    // Shimmers
                    for (let rx = 20; rx < 980; rx += Phaser.Math.Between(30, 70)) {
                        let shimmer = this.add.ellipse(rx, -96, Phaser.Math.Between(15, 40), 3, 0xcc66ff, 0.3);
                        this.tweens.add({ targets: shimmer, alpha: 0.05, duration: Phaser.Math.Between(1000, 2000), yoyo: true, repeat: -1 });
                        floodContainer.add(shimmer);
                    }
                    
                    // Tween nÃ¡Â»â€¢i lÃƒÂªn trÃƒÂªn thay vÃƒÂ¬ di chuyÃ¡Â»Æ’n ngang
                    this.tweens.add({
                        targets: floodContainer,
                        y: h + 40, // Di chuyÃ¡Â»Æ’n y sao cho bÃ¡Â»Â mÃ¡ÂºÂ·t nÃ†Â°Ã¡Â»â€ºc nÃ¡ÂºÂ±m Ã¡Â»Å¸ h - 60
                        duration: 3500,
                        ease: 'Sine.easeOut',
                        onComplete: () => {
                            // TÃ¡ÂºÂ¡o physics collider Ã„â€˜Ã¡Â»Æ’ game over nÃ¡ÂºÂ¿u chÃ¡ÂºÂ¡m nÃ†Â°Ã¡Â»â€ºc
                            // LÃƒÂºc nÃƒÂ y y cÃ¡Â»Â§a container lÃƒÂ  h+40. BÃ¡Â»Â mÃ¡ÂºÂ·t nÃ†Â°Ã¡Â»â€ºc nÃ¡Â»â„¢i bÃ¡Â»â„¢ lÃƒÂ  -100, tÃ¡Â»Â©c h - 60 thÃ¡Â»Â±c tÃ¡ÂºÂ¿.
                            // Ã„ÂÃ¡Â»Æ’ trÃƒÂ¡nh cÃ¡ÂºÂ§u bÃ¡Â»â€¹ ngÃ¡ÂºÂ­p, ta hÃ¡ÂºÂ¡ physics xuÃ¡Â»â€˜ng 1 chÃƒÂºt (h - 40).
                            this.floodZone = this.add.rectangle(4150, h - 40, 1000, 200, 0, 0).setOrigin(0, 0);
                            this.physics.add.existing(this.floodZone, true);
                            this.physics.add.overlap(this.player, this.floodZone, this.triggerGameOver);
                            
                            // 4. TrÃ¡ÂºÂ£ lÃ¡ÂºÂ¡i control
                            this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -this.cameras.main.width/4, 200);
                            this.isCinematic = false;
                        }
                    });
                }
            });
        });
    }

    rebuildTerrain() {
        let h = this.cameras.main.height;
        let w = this.cameras.main.width;
        
        // VÃ¡ÂºÂ½ lÃ¡ÂºÂ¡i mask
        this.groundGraphics.clear();
        this.groundGraphics.fillStyle(0xffffff, 1);
        this.groundGraphics.beginPath();
        this.groundGraphics.moveTo(0, h + 1500);
        for (let x = 0; x <= w * 6; x += 10) {
            let ty = this.getTerrainY(x);
            if (x > 1536 && x <= 2048) this.groundGraphics.lineTo(x, h + 1500);
            else this.groundGraphics.lineTo(x, ty);
        }
        this.groundGraphics.lineTo(w * 6, h + 1500);
        this.groundGraphics.fillPath();
        
        // VÃ¡ÂºÂ½ lÃ¡ÂºÂ¡i viÃ¡Â»Ân
        this.borderGraphics.clear();
        this.borderGraphics.lineStyle(4, 0x1a1a22, 1);
        this.borderGraphics.beginPath();
        let firstBorder = true;
        for (let x = 0; x <= w * 6; x += 20) {
            let ty = this.getTerrainY(x);
            if (x > 1536 && x <= 2048) {
                firstBorder = true;
            } else {
                if (firstBorder) { this.borderGraphics.moveTo(x, ty); firstBorder = false; }
                else this.borderGraphics.lineTo(x, ty);
            }
        }
        this.borderGraphics.strokePath();
        
        // VÃ¡ÂºÂ½ lÃ¡ÂºÂ¡i physics
        this.groundGroup.clear(true, true);
        for (let x = 0; x <= w * 6; x += 20) {
            let ty = this.getTerrainY(x);
            if (!(x > 1536 && x <= 2048)) {
                let rect = this.add.rectangle(x, ty, 20, (h + 1500) - ty, 0x000000, 0).setOrigin(0, 0);
                this.physics.add.existing(rect, true);
                this.groundGroup.add(rect);
            }
        }
        
        // XÃƒÂ³a cÃ¡Â»Â cÃƒÂ¢y Ã¡Â»Å¸ khu vÃ¡Â»Â±c bÃ¡Â»â€¹ nÃ¡Â»â€¢
        if (this.grassClumps) {
            this.grassClumps.forEach(clump => {
                if (clump.x > 4000 && clump.x < 4800) {
                    clump.destroy();
                }
            });
            this.grassClumps = this.grassClumps.filter(c => c.active);
        }
        if (this.flowers) {
            this.flowers.forEach(clump => {
                if (clump.x > 4000 && clump.x < 4800) {
                    clump.destroy();
                }
            });
            this.flowers = this.flowers.filter(c => c.active);
        }
    }

    getTerrainY(x) {
        let h = this.cameras.main.height;
        let w = this.cameras.main.width;
        let baseY = h - 110;
        
        // HÃ¡Â»â€˜ nÃ†Â°Ã¡Â»â€ºc Ã„â€˜Ã¡Â»â„¢c
        if (x > 1536 && x <= 2048) {
            return h + 1000;
        }
        // DÃ¡Â»â€˜c khÃ¡Â»â€¢ng lÃ¡Â»â€œ xuÃ¡Â»â€˜ng vÃ¡Â»Â±c nÃ†Â°Ã¡Â»â€ºc Ã„â€˜Ã¡Â»â„¢c cuÃ¡Â»â€˜i map (sau chÃ†Â°Ã¡Â»â€ºng ngÃ¡ÂºÂ¡i vÃ¡ÂºÂ­t Wall Jump)
        if (x >= 5500 && x <= 7500) {
            let t = (x - 5500) / 2000;
            return baseY + t * 1000; // TrÃ…Â©ng xuÃ¡Â»â€˜ng 1000px
        }
        if (x > 7500) {
            return baseY + 1000; // Ã„ÂÃƒÂ¡y hÃ¡Â»â€œ phÃ¡ÂºÂ³ng
        }

        // BÃ¡ÂºÂ±ng phÃ¡ÂºÂ³ng mÃ¡Â»Âi nÃ†Â¡i trÃ†Â°Ã¡Â»â€ºc khu vÃ¡Â»Â±c nÃ¡Â»â€¢, hoÃ¡ÂºÂ·c nÃ¡ÂºÂ¿u chÃ†Â°a cÃƒÂ³ vÃ¡Â»Â¥ nÃ¡Â»â€¢
        if (x < 3900 || !this.cratersCreated) return baseY;

        let offset = 0;
        
        // Ã„ÂoÃ¡ÂºÂ¡n lÃƒÂ²i lÃƒÂµm SAU bÃ¡Â»Â©c tÃ†Â°Ã¡Â»Âng (x > 3900) CHÃ¡Â»Ë† hiÃ¡Â»â€¡n sau khi Ã„â€˜Ã¡ÂºÂ¡n phÃƒÂ¡o rÃ†Â¡i
        // MÃ¡Â»â„¢t lÃ¡Â»â€” hÃ¡Â»â€¢ng khÃ¡Â»â€¢ng lÃ¡Â»â€œ (x: 4100 -> 4800)
        if (x >= 4100 && x <= 4800) {
            let t = (x - 4100) / 700;
            offset = Math.sin(t * Math.PI) * 120; // sÃƒÂ¢u 120px
        }
        
        // GiÃ¡Â»Â¯ bÃ¡ÂºÂ±ng phÃ¡ÂºÂ³ng Ã¡Â»Å¸ khÃƒÂºc cÃƒÂ²n lÃ¡ÂºÂ¡i
        return baseY + offset; 
    }

    getTerrainSlope(x) {
        // Ã„ÂÃ¡ÂºÂ¡o hÃƒÂ m xÃ¡ÂºÂ¥p xÃ¡Â»â€° bÃ¡ÂºÂ±ng cÃƒÂ¡ch lÃ¡ÂºÂ¥y Ã„â€˜Ã¡Â»â„¢ chÃƒÂªnh lÃ¡Â»â€¡ch y cÃ¡Â»Â§a x-1 vÃƒÂ  x+1
        let y1 = this.getTerrainY(x - 5);
        let y2 = this.getTerrainY(x + 5);
        return (y2 - y1) / 10;
    }

        reviveStump(stump, prompt) {
        if (stump.isBloomed) return;
        stump.isBloomed = true;
        prompt.setAlpha(0);
        
        let moss1 = this.add.ellipse(-6, -18, 14, 7, 0x1a6633, 0.5);
        let moss2 = this.add.ellipse(8, -30, 10, 5, 0x227744, 0.4);
        let leaf1 = this.add.triangle(18, -45, 0, 14, 16, 7, 8, 0, 0x2d8a4e).setOrigin(0.5, 1).setAngle(25);
        let leaf2 = this.add.triangle(-12, -48, 0, 12, 14, 6, 7, 0, 0x3da35d).setOrigin(0.5, 1).setAngle(-20);
        stump.add([moss1, moss2, leaf1, leaf2]);
        [moss1, moss2, leaf1, leaf2].forEach((item, i) => {
            item.setScale(0);
            this.tweens.add({ targets: item, scale: 1, duration: 500, delay: i * 120, ease: 'Back.easeOut' });
        });
        
        let bridgeY = this.cameras.main.height - 112;
        let bridgeImg = this.add.image(stump.bridgeStartX, bridgeY - 20, 'map1_vine_bridge').setOrigin(0, 0);
        bridgeImg.setCrop(0, 0, 0, 100);
        bridgeImg.setDisplaySize(stump.bridgeLength, 100);
        
        let drawObj = { w: 0 };
        this.tweens.add({
            targets: drawObj,
            w: stump.bridgeLength,
            duration: 1500,
            ease: 'Linear',
            onUpdate: () => {
                let progress = drawObj.w / stump.bridgeLength;
                bridgeImg.setCrop(0, 0, 750 * progress, 100);
            },
            onComplete: () => {
                allLeaves.forEach((leaf, i) => {
                    this.tweens.add({
                        targets: leaf,
                        alpha: 0.85,
                        scale: 1,
                        duration: 300,
                        delay: i * 30,
                        ease: 'Back.easeOut'
                    });
                });
            }
        });
        
        let allLeaves = [];
        for (let lx = 50; lx < stump.bridgeLength; lx += Phaser.Math.Between(30, 70)) {
            let progress = lx / stump.bridgeLength;
            let curveY = Math.sin(progress * Math.PI) * 25;
            let leaf = this.add.ellipse(stump.bridgeStartX + lx, bridgeY + curveY + 5 + Phaser.Math.Between(0, 15), 10, 20, 0x4fc26d).setOrigin(0.5, 0).setAlpha(0);
            if (Math.random() > 0.5) leaf.setAngle(Phaser.Math.Between(-30, 30));
            allLeaves.push(leaf);
        }
        
        let bridgePhysics = this.add.rectangle(stump.bridgeStartX, bridgeY + 2, stump.bridgeLength, 200, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(bridgePhysics, true);
        this.physics.add.collider(this.player, bridgePhysics);

        let emitter = this.add.particles(stump.bridgeStartX, bridgeY + 2, 'firefly', {
            speed: { min: -80, max: 80 },
            scale: { start: 0.8, end: 0 },
            lifespan: 2500,
            blendMode: 'ADD'
        });
        emitter.explode(25);
    }

    createStump(x, bridgeStartX, bridgeLength) {
        let h = this.cameras.main.height;
        let stumpContainer = this.add.container(x, h - 110);
        let trunk = this.add.rectangle(0, 0, 30, 50, 0x553311).setOrigin(0.5, 1);
        let bark1 = this.add.rectangle(-5, -15, 4, 15, 0x442200).setOrigin(0.5, 1);
        let bark2 = this.add.rectangle(6, -8, 3, 10, 0x442200).setOrigin(0.5, 1);
        let root1 = this.add.triangle(-18, 0, 0, 8, 20, 8, 10, 0, 0x443322).setOrigin(0.5, 1);
        let root2 = this.add.triangle(18, 0, 20, 8, 0, 8, 10, 0, 0x443322).setOrigin(0.5, 1);
        let branch = this.add.rectangle(12, -40, 15, 3, 0x664422).setOrigin(0, 0.5).setAngle(30);
        stumpContainer.add([root1, root2, trunk, bark1, bark2, branch]);
        
        stumpContainer.isBloomed = false;
        stumpContainer.bridgeStartX = bridgeStartX;
        stumpContainer.bridgeLength = bridgeLength;
        
        let isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        let stumpLabel = isMobile ? '🌱 Chạm để hồi sinh cây' : '🌱 Bấm F để hồi sinh cây';
        let prompt = this.add.text(x, h - 200, stumpLabel, { 
            font: 'bold 18px Arial', 
            fill: '#00d2d3', 
            backgroundColor: '#1e272e', 
            padding: { x: 14, y: 8 } 
        }).setOrigin(0.5).setAlpha(0).setDepth(200).setInteractive({ useHandCursor: true });

        let triggerRevival = () => {
            if (!stumpContainer.isBloomed && Math.abs(this.player.x - x) <= 200) {
                this.reviveStump(stumpContainer, prompt);
            }
        };
        prompt.on('pointerdown', triggerRevival);
        stumpContainer.setInteractive(new Phaser.Geom.Rectangle(-40, -80, 80, 80), Phaser.Geom.Rectangle.Contains);
        stumpContainer.on('pointerdown', triggerRevival);
        
        this.stumps = this.stumps || [];
        this.stumps.push({ container: stumpContainer, prompt: prompt });
    }
}
