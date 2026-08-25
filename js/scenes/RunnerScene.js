class RunnerScene extends Phaser.Scene {
    constructor() {
        super('RunnerScene');
    }

    preload() {
        this.load.image('war_bg', 'assets/war_bg.jpg');
        this.load.image('toxic_ground', 'assets/toxic_ground.jpg');
        this.load.image('sprout', 'assets/sprout.png');
    }

    create() {
        this.hasReachedEnd = false;
        this.isGameOvering = false;
        this.hasTriggeredArtillery = false;
        this.cratersCreated = false;
        this.isCinematic = false;
        
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.registry.set('showUI', false);
        this.registry.set('showSurvival', false);

        // Backgrounds
        this.bg1 = this.add.image(0, 0, 'war_bg').setOrigin(0, 0).setDisplaySize(w, h).setScrollFactor(0.2);
        this.bg2 = this.add.image(w, 0, 'war_bg').setOrigin(0, 0).setDisplaySize(w, h).setScrollFactor(0.2).setFlipX(true);
        this.bg3 = this.add.image(w*2, 0, 'war_bg').setOrigin(0, 0).setDisplaySize(w, h).setScrollFactor(0.2);
        
        // Nền đen thẳm che lấp toàn bộ thế giới ngầm bên dưới màn hình (dành cho cái dốc sâu 1000px)
        this.add.rectangle(0, h, w * 6, 2000, 0x050508, 1).setOrigin(0, 0).setScrollFactor(0.2);

        // Midground Ruins (Hậu cảnh xa vừa) - Parallax 0.4
        let mgGraphics = this.add.graphics();
        mgGraphics.setScrollFactor(0.4);
        
        // Vẽ những cột trụ, mảng tường đổ nát nhấp nhô ở xa
        mgGraphics.fillStyle(0x101015, 1);
        for(let x = -200; x < w * 6; x += Phaser.Math.Between(200, 400)) {
            let width = Phaser.Math.Between(60, 200);
            let height = Phaser.Math.Between(180, 450);
            
            // Phần gốc tường/cột thẳng đứng kéo dài xuống vực
            mgGraphics.fillRect(x, h - height, width, height + 1500);
            
            // Rìa trên cùng bị vỡ nham nhở
            mgGraphics.beginPath();
            mgGraphics.moveTo(x, h - height);
            let segments = Phaser.Math.Between(3, 6);
            let segW = width / segments;
            for(let s = 1; s <= segments; s++) {
                mgGraphics.lineTo(x + s * segW, h - height - Phaser.Math.Between(-15, 30));
            }
            mgGraphics.lineTo(x + width, h - height);
            mgGraphics.fillPath();

            // Rìa sụp lở hai bên (tạo hình dạng không vuông vức) kéo dài thẳng xuống vực
            if (Math.random() > 0.5) {
                mgGraphics.beginPath();
                mgGraphics.moveTo(x, h - height/2);
                let dropX = x - Phaser.Math.Between(10, 30);
                mgGraphics.lineTo(dropX, h);
                mgGraphics.lineTo(dropX, h + 1500);
                mgGraphics.lineTo(x, h + 1500);
                mgGraphics.fillPath();
            }
            if (Math.random() > 0.5) {
                mgGraphics.beginPath();
                mgGraphics.moveTo(x + width, h - height/3);
                let dropX = x + width + Phaser.Math.Between(10, 40);
                mgGraphics.lineTo(dropX, h);
                mgGraphics.lineTo(dropX, h + 1500);
                mgGraphics.lineTo(x + width, h + 1500);
                mgGraphics.fillPath();
            }
            
            // Thỉnh thoảng có vài cốt thép mỏng đâm lên từ nóc
            if (Math.random() > 0.4) {
                mgGraphics.lineStyle(3, 0x08080c, 1);
                mgGraphics.beginPath();
                let poleX = x + Phaser.Math.Between(10, width - 10);
                let poleY = h - height - 10;
                mgGraphics.moveTo(poleX, poleY);
                mgGraphics.lineTo(poleX + Phaser.Math.Between(-10, 10), poleY - Phaser.Math.Between(30, 80));
                mgGraphics.strokePath();
            }
        }

        // --- VẼ NƯỚC ĐỘC TRƯỚC ĐỂ NẰM SAU MẶT ĐẤT ---
        // Hố nước độc ở giữa (1536 -> 2048)
        this.add.rectangle(1536, h - 30, 512, 1500, 0x1a0022, 0.95).setOrigin(0, 0); // Kéo sâu xuống 1500
        this.add.rectangle(1536, h - 45, 512, 40, 0x33004d, 0.7).setOrigin(0, 0);
        let surfaceG1 = this.add.graphics();
        surfaceG1.fillStyle(0x8800aa, 0.4);
        surfaceG1.fillRect(1536, h - 55, 512, 15);
        surfaceG1.fillStyle(0xaa33cc, 0.25);
        surfaceG1.fillRect(1536, h - 57, 512, 6);
        for (let rx = 1550; rx < 2030; rx += Phaser.Math.Between(30, 70)) {
            let shimmer = this.add.ellipse(rx, h - 53, Phaser.Math.Between(15, 40), 3, 0xcc66ff, 0.3);
            this.tweens.add({ targets: shimmer, alpha: 0.05, duration: Phaser.Math.Between(1000, 2000), yoyo: true, repeat: -1 });
        }
        
        // Hạt ánh sáng đom đóm (Particle textures)
        if (!this.textures.exists('smoke')) {
            let graphics = this.make.graphics({x: 0, y: 0});
            graphics.fillStyle(0xaa00ff, 0.5);
            graphics.fillCircle(8, 8, 8);
            graphics.generateTexture('smoke', 16, 16);
        }
        if (!this.textures.exists('firefly')) {
            let graphics2 = this.make.graphics({x: 0, y: 0});
            graphics2.fillStyle(0x00ff00, 1);
            graphics2.fillCircle(4, 4, 4);
            graphics2.generateTexture('firefly', 8, 8);
        }
        
        // Bọt khí sủi lên từ hố giữa
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
        

        // --- ĐẤT (CUSTOM TERRAIN) ---
        this.groundGroup = this.add.group();
        
        // Tạo các bậc thang vật lý ẩn dọc theo đồ thị terrain để Arcade xử lý va chạm chuẩn
        for (let x = 0; x <= w * 6; x += 20) { // Mỗi bước 20px
            let ty = this.getTerrainY(x);
            if (!(x > 1536 && x <= 2048)) { // Bỏ qua khúc hố nước độc đầu tiên
                // Tạo một hình chữ nhật tàng hình ở đây, kéo dài thẳng xuống đáy vực
                let rect = this.add.rectangle(x, ty, 20, (h + 1500) - ty, 0x000000, 0).setOrigin(0, 0);
                this.physics.add.existing(rect, true); // true = static
                this.groundGroup.add(rect);
            }
        }

        // Vẽ đồ thị địa hình
        this.groundGraphics = this.make.graphics({x: 0, y: 0});
        this.groundGraphics.fillStyle(0xffffff, 1);
        this.groundGraphics.beginPath();
        this.groundGraphics.moveTo(0, h + 1500); // Mở rộng xuống đáy vực

        for (let x = 0; x <= w * 6; x += 10) {
            let ty = this.getTerrainY(x);
            // Đừng vẽ mặt nạ cho hố (để hố không hiện đất)
            // Hố đầu tiên (1536 -> 2048)
            if (x > 1536 && x <= 2048) {
                this.groundGraphics.lineTo(x, h + 1500);
            } else {
                this.groundGraphics.lineTo(x, ty);
            }
        }
        this.groundGraphics.lineTo(w * 6, h + 1500);
        this.groundGraphics.fillPath();

        // Tạo Mask từ Graphics
        let groundMask = this.groundGraphics.createGeometryMask();

        // Vẽ texture đất đè lên nước độc
        for (let x = 0; x <= w * 6; x += 512) {
            if (x === 1536) continue; // Bỏ qua khúc hố đầu tiên
            // Lặp theo chiều dọc để trải texture xuống vực sâu, yOffset += 145 để không bị hở sọc ngang
            for (let yOffset = 0; yOffset <= 1500; yOffset += 145) {
                let groundImg = this.add.image(x, h + 322 + yOffset, 'toxic_ground').setOrigin(0, 1).setScale(0.5);
                // Crop lại giống bản cũ để cái bề mặt đường bằng phẳng nằm ngay mép trên
                groundImg.setCrop(0, 160, 1024, 300);
                groundImg.setMask(groundMask);
                groundImg.setDepth(5);
                if ((x / 512) % 2 !== 0) groundImg.setFlipX(true);
            }
        }
        
        // Tạo đường viền nét đen trên mặt đất cho rõ ràng
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

        // Death zone dưới cùng
        this.deathZone = this.add.rectangle(0, h + 1500, w * 6, 200, 0xff0000, 0).setOrigin(0,0);
        this.physics.add.existing(this.deathZone, true);

        // Khói độc cuối map
        this.add.particles(0, 0, 'smoke', {
            x: { min: w * 6, max: w * 6 + 800 },
            y: { min: h - 100, max: h },
            lifespan: 4000,
            speedY: { min: -20, max: -50 },
            scale: { start: 1, end: 3 },
            alpha: { start: 0.8, end: 0 },
            frequency: 100
        });
        // Khói/hơi độc nhẹ từ hố giữa map
        this.add.particles(0, 0, 'smoke', {
            x: { min: 1560, max: 2020 },
            y: h - 80,
            lifespan: 3000,
            speedY: { min: -10, max: -30 },
            scale: { start: 0.5, end: 2 },
            alpha: { start: 0.4, end: 0 },
            frequency: 300
        });

        // --- TƯƠNG TÁC THIÊN NHIÊN (HOA) ---
        this.flowers = [];
        for (let fx = 500; fx < w * 6; fx += 300) {
            if (fx > 1400 && fx < 2100) continue;
            let ty = this.getTerrainY(fx);
            let flowerContainer = this.add.container(fx, ty);
            // Thân cây (đáy tại y=0 = mặt đất)
            let stem = this.add.rectangle(0, 0, 3, 30, 0x444433).setOrigin(0.5, 1);
            // Nụ hoa (ngay trên đỉnh thân)
            let bud = this.add.circle(0, -30, 6, 0x666655);
            // Cánh hoa (ẩn, sẽ hiện khi nở)
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

        // Gốc cây bắc cầu 1 (Scene 5)
        this.fKey = this.input.keyboard.addKey('F');
        this.stumps = [];
        this.createStump(1480, 1536, 512);

        // Hai trụ silhouette đen tuyền (như parallax)
        // Cột 1: Từ trên nóc (y=0) rủ xuống, chừa 150px khoảng trống ở dưới (y=460)
        let pillar1Bottom = h - 260; // 720 - 260 = 460
        this.wallJumpLeft = this.add.rectangle(5100, 0, 80, pillar1Bottom, 0x050508, 1).setOrigin(0,0);
        
        // Cột 2: Từ dưới đất (h-110) trồi lên, chừa 150px khoảng trống ở trên
        let pillar2Top = 150;
        let pillar2Height = (h - 110) - pillar2Top; // 610 - 150 = 460
        // Khoảng cách 120px (5180 -> 5300)
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
        this.shadow = this.add.ellipse(200, h - 110, 60, 15, 0x000000, 0.6);
        this.aura = this.add.circle(200, h - 150, 70, 0x88ff88, 0.15);
        this.aura.setBlendMode('ADD');

        // Tạo texture hình tròn xanh lá nếu chưa có
        if (!this.textures.exists('green_circle')) {
            let g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x00ff00);
            g.fillCircle(25, 25, 25);
            g.generateTexture('green_circle', 50, 50);
        }
        this.player.body.setGravityY(1200);
        this.player.body.setCollideWorldBounds(true);

        // Thêm hình tròn xanh lá làm Sprite tạm thời
        this.playerSprite = this.add.sprite(200, h - 150, 'green_circle');
        this.playerSprite.setOrigin(0.5, 1);
        this.playerSprite.baseScale = 1;
        this.playerSprite.setScale(this.playerSprite.baseScale);

        // Thêm hạt đom đóm bay quanh người
        this.playerEmitter = this.add.particles(0, 0, 'firefly', {
            speed: { min: -15, max: 15 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 2000,
            blendMode: 'ADD',
            frequency: 300
        });
        this.playerEmitter.startFollow(this.player);

        this.physics.world.setBounds(0, 0, w * 6, h + 1500);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.isCinematic = true;
        this.playerState = 'none';
        this.playerTween = null;
        this.cameras.main.setBounds(0, 0, w * 6, h + 1500);
        this.cameras.main.scrollX = 0;

        // Cinematic (Camera Pan Only, Mầm xuất hiện ngay từ đầu)
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
                                let tutText1 = this.add.text(0, -20, 'Dùng các phím A, D (Mũi tên) để đi lại', { font: 'bold 20px Arial', fill: '#ffffff', align: 'center' }).setOrigin(0.5);
                                let tutText2 = this.add.text(0, 20, 'Dùng phím Space để Nhảy', { font: 'bold 20px Arial', fill: '#00ff00', align: 'center' }).setOrigin(0.5);
                                tutContainer.add([tutBg, tutText1, tutText2]);
                                tutContainer.setAlpha(0);
                                this.tweens.add({ targets: tutContainer, alpha: 1, duration: 1000, yoyo: true, hold: 6000 });
                            }
                        });
                    }
                });
            }
        });

        // Sinh ra các bụi cỏ khô tương tác (vẽ chi tiết hơn)
        this.grassClumps = [];
        for (let i = 200; i < w * 6; i += Phaser.Math.Between(120, 280)) {
            if (i > 1480 && i < 2100) continue; // Bỏ qua hố độc
            
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


        // Xử lý game over khi chạm nước độc hoặc rơi khỏi map
        this.triggerGameOver = () => {
            if (this.isGameOvering || this.hasReachedEnd) return;
            this.isGameOvering = true;
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('GameOverScene', { reason: 'Mầm đã rơi xuống hố nước độc và tan biến.' });
            });
        };
        this.physics.add.overlap(this.player, this.toxicPit, this.triggerGameOver);
        this.physics.add.overlap(this.player, this.toxicWater, this.triggerGameOver);
        this.physics.add.overlap(this.player, this.deathZone, this.triggerGameOver);

        // Bức tường cao (địa hình không thể nhảy qua) lùi xa hơn
        this.highWall = this.add.rectangle(3500, h - 280, 400, 180, 0x000000, 0).setOrigin(0,0);
        this.physics.add.existing(this.highWall, true);
        this.physics.add.collider(this.player, this.highWall);

        // Vẽ visuals cho bức tường (bê tông đổ nát, có cốt thép và sọc cảnh báo)
        let wallX = 3500;
        let wallY = h - 280;
        this.add.rectangle(wallX, wallY, 400, 180, 0x4a4f54).setOrigin(0,0); // nền bê tông
        this.add.rectangle(wallX, wallY, 400, 8, 0x6a7076).setOrigin(0,0); // viền sáng trên cùng
        this.add.rectangle(wallX, wallY + 172, 400, 8, 0x2a2f34).setOrigin(0,0); // viền tối dưới đáy
        
        let wallDecals = this.add.graphics();
        // Vết nứt trên tường
        wallDecals.lineStyle(2, 0x222528, 0.8);
        wallDecals.beginPath();
        wallDecals.moveTo(wallX + 40, wallY);
        wallDecals.lineTo(wallX + 50, wallY + 40);
        wallDecals.lineTo(wallX + 35, wallY + 80);
        wallDecals.lineTo(wallX + 60, wallY + 130);
        wallDecals.moveTo(wallX + 180, wallY);
        wallDecals.lineTo(wallX + 170, wallY + 50);
        wallDecals.lineTo(wallX + 190, wallY + 100);
        wallDecals.lineTo(wallX + 175, wallY + 150);
        wallDecals.strokePath();

        // Cốt thép gỉ sét nhô lên từ nắp tường
        wallDecals.lineStyle(3, 0x8b4513, 1);
        wallDecals.beginPath();
        wallDecals.moveTo(wallX + 100, wallY);
        wallDecals.lineTo(wallX + 95, wallY - 20);
        wallDecals.lineTo(wallX + 105, wallY - 35);
        wallDecals.moveTo(wallX + 250, wallY);
        wallDecals.lineTo(wallX + 260, wallY - 15);
        wallDecals.lineTo(wallX + 255, wallY - 40);
        wallDecals.moveTo(wallX + 320, wallY);
        wallDecals.lineTo(wallX + 315, wallY - 25);
        wallDecals.strokePath();

        // Sọc cảnh báo vàng đen ở giữa tường
        wallDecals.fillStyle(0x222222, 0.9);
        wallDecals.fillRect(wallX, wallY + 80, 400, 20);
        wallDecals.fillStyle(0xccaa00, 0.9);
        for (let i = 0; i < 400; i += 30) {
            wallDecals.beginPath();
            wallDecals.moveTo(wallX + i, wallY + 80);
            wallDecals.lineTo(wallX + i + 15, wallY + 80);
            wallDecals.lineTo(wallX + i + 5, wallY + 100);
            wallDecals.lineTo(wallX + i - 10, wallY + 100);
            wallDecals.fillPath();
        }

        // Hộp carton để giải đố leo lên (STATIC - không bị đẩy trôi)
        this.box = this.add.rectangle(3100, h - 110, 60, 60, 0x000000, 0).setOrigin(0.5, 1);
        this.physics.add.existing(this.box, true);
        this.boxCollider = this.physics.add.collider(this.player, this.box); // Lưu ref để tắt/bật
        
        // Vẽ thùng gỗ chi tiết (tách riêng visual để tránh lỗi Physics Container)
        this.boxVisuals = this.add.container(3100, h - 110);
        let boxBg = this.add.rectangle(0, -30, 60, 60, 0x5c4033);
        let plank1 = this.add.rectangle(0, -50, 56, 12, 0x704f3f);
        let plank2 = this.add.rectangle(0, -30, 56, 12, 0x704f3f);
        let plank3 = this.add.rectangle(0, -10, 56, 12, 0x704f3f);
        let cross = this.add.rectangle(0, -30, 75, 6, 0x4a3227).setAngle(45);
        let border = this.add.rectangle(0, -30, 60, 60, 0x000000, 0).setStrokeStyle(4, 0x3a271c);
        let nail1 = this.add.circle(-23, -53, 2, 0x111111);
        let nail2 = this.add.circle(23, -53, 2, 0x111111);
        let nail3 = this.add.circle(-23, -7, 2, 0x111111);
        let nail4 = this.add.circle(23, -7, 2, 0x111111);
        
        this.boxVisuals.add([boxBg, plank1, plank2, plank3, cross, border, nail1, nail2, nail3, nail4]);

        this.boxPrompt = this.add.text(0, 0, '', { font: 'bold 20px Arial', fill: '#ffff00', backgroundColor: '#000000aa', padding: { x: 5, y: 5 } }).setOrigin(0.5).setAlpha(0);
        this.isAttachedToBox = false;
        this.boxOrigY = h - 110;
        
        // Foreground (Tiền cảnh che khuất màn hình) - Parallax 1.3
        let fgGraphics = this.add.graphics();
        fgGraphics.setScrollFactor(1.3);
        fgGraphics.setDepth(100); // Đảm bảo luôn nằm trên cùng
        
        // Tiền cảnh thấp (đống gạch vụn sát camera)
        fgGraphics.fillStyle(0x050508, 0.95);
        for(let x = 600; x < 5500; x += Phaser.Math.Between(400, 800)) {
            // Khối đá vụn / ống thép sát màn hình (chạy vùn vụt)
            fgGraphics.beginPath();
            fgGraphics.moveTo(x, h + 1500); // Bắt đầu từ chân vực sâu
            fgGraphics.lineTo(x, h);
            fgGraphics.lineTo(x + Phaser.Math.Between(20, 60), h - Phaser.Math.Between(30, 80));
            fgGraphics.lineTo(x + Phaser.Math.Between(80, 150), h - Phaser.Math.Between(20, 50));
            fgGraphics.lineTo(x + 200, h);
            fgGraphics.lineTo(x + 200, h + 1500); // Kéo thẳng xuống vực
            fgGraphics.fillPath();
            
            // Thi thoảng có thanh sắt đâm xéo lên
            if (Math.random() > 0.5) {
                fgGraphics.lineStyle(5, 0x050508, 0.95);
                fgGraphics.beginPath();
                let poleStartX = x + 50;
                let poleEndX = x + Phaser.Math.Between(20, 80);
                let poleEndY = h - Phaser.Math.Between(100, 150);
                // Kéo thanh sắt sâu từ dưới lên cho an toàn không bị hở chân
                fgGraphics.moveTo(poleStartX + (poleStartX - poleEndX) * 10, h + 1500);
                fgGraphics.lineTo(poleEndX, poleEndY);
                fgGraphics.strokePath();
            }
        }

        // Dây cáp treo lủng lẳng từ trên mép màn hình
        fgGraphics.lineStyle(4, 0x050508, 0.9);
        for(let x = 200; x < w * 6; x += Phaser.Math.Between(500, 1000)) {
            fgGraphics.beginPath();
            fgGraphics.moveTo(x, 0);
            let endX = x + Phaser.Math.Between(150, 400);
            // Vẽ đường cong dây điện võng xuống (dùng lineTo để tương thích Phaser Graphics)
            let sagY = Phaser.Math.Between(50, 200);
            fgGraphics.lineTo(x + (endX - x)*0.25, sagY * 0.75);
            fgGraphics.lineTo(x + (endX - x)*0.5, sagY);
            fgGraphics.lineTo(x + (endX - x)*0.75, sagY * 0.75);
            fgGraphics.lineTo(endX, 0);
            fgGraphics.strokePath();

            // Dây đứt thòng xuống
            if (Math.random() > 0.5) {
                fgGraphics.beginPath();
                fgGraphics.moveTo(x + 50, 0);
                fgGraphics.lineTo(x + 50 + Phaser.Math.Between(-30, 30), Phaser.Math.Between(100, 300));
                fgGraphics.strokePath();
            }
        }
        
        // Bể nước độc khổng lồ ở đáy vực (bắt đầu từ x=7250, nơi dốc chạm mặt nước)
        // Dốc từ h-110 xuống tận h+890. Mặt nước ở mức h+800.
        this.toxicWater = this.add.rectangle(7250, h + 800, 2000, 1500, 0x000000, 0).setOrigin(0, 0); this.physics.add.existing(this.toxicWater, true); let endLake = this.add.container(6500, h + 800).setDepth(3);
        let el1 = this.add.rectangle(0, -70, 3000, 1500, 0x1a0022, 0.95).setOrigin(0, 0); // Đáy nước khổng lồ
        let el2 = this.add.rectangle(0, -85, 3000, 30, 0x33004d, 0.7).setOrigin(0, 0);   // Giao thoa
        let elG = this.add.graphics();
        elG.fillStyle(0x8800aa, 0.4);
        elG.fillRect(0, -100, 3000, 18); // Mặt nước nhấp nhô (màu tím)
        endLake.add([el1, el2, elG]);
        
        // Thêm vài hạt bụi mờ (fog/dust) bay ở tiền cảnh
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
        // Sync sprite to invisible physics body LUÔN LUÔN CHẠY
        this.playerSprite.x = this.player.x;
        this.playerSprite.y = this.player.y + 40;
        this.aura.x = this.player.x;
        this.aura.y = this.player.y;

        // Bóng đổ (Shadow) phải nằm vĩnh viễn trên mặt đất, và nhạt dần khi nhảy cao
        let groundY = this.getTerrainY(this.player.x);
        this.shadow.x = this.player.x;
        this.shadow.y = groundY;
        let distToGround = groundY - (this.player.y + 40);
        if (distToGround < 0) distToGround = 0;
        let shadowScale = Math.max(0, 1 - (distToGround / 200));
        this.shadow.setScale(shadowScale);
        this.shadow.setAlpha(0.6 * shadowScale);

        if (this.isCinematic) return;
        
        let pX = this.player.x;
        let pY = this.player.y;

        // Sử dụng Arcade Physics để kiểm tra đứng trên đất (hoặc hộp)
        let isGrounded = this.player.body.touching.down;

        let isMoving = false;
        let isJumping = false;

        let isSpacePressed = Phaser.Input.Keyboard.JustDown(this.spaceKey);
        
        // Khu vực hố tường (từ x=5180 đến x=5300, y > 150)
        let inWallJumpZone = (this.player.x > 5160 && this.player.x < 5320 && this.player.y > 150);

        if (isSpacePressed && !this.isAttachedToBox) {
            if (isGrounded) {
                // Nhảy thường
                this.player.body.setVelocityY(-600);
                isJumping = true;
                this.dustEmitter.explode(10, this.player.x, this.player.y + 40);
                this.lastWallJump = null;
            } else if (inWallJumpZone) {
                // Tự động hóa hoàn toàn việc nhảy tường! Không cần bấm phím ngang hay bám sát tường.
                if (this.player.x < 5240 && this.lastWallJump !== 'left') {
                    // Đang ở nửa trái -> Bật sang phải
                    this.player.body.setVelocity(400, -600);
                    this.lastWallJump = 'left';
                    isJumping = true;
                    this.dustEmitter.explode(10, this.player.x - 20, this.player.y);
                } else if (this.player.x >= 5240 && this.lastWallJump !== 'right') {
                    // Đang ở nửa phải -> Bật sang trái
                    this.player.body.setVelocity(-400, -600);
                    this.lastWallJump = 'right';
                    isJumping = true;
                    this.dustEmitter.explode(10, this.player.x + 20, this.player.y);
                }
            }
        }

        // Hủy khóa di chuyển nếu đã bay lên tới đỉnh hố (để người chơi có thể điều khiển sang phải)
        let topOfTower = 160; 
        if (this.player.y <= topOfTower) {
            this.lastWallJump = null;
        }

        // Xử lý di chuyển ngang
        // KHÓA di chuyển ngang hoàn toàn khi đang bay trong hố tường để tạo cảm giác tự động rơi & nảy
        if (inWallJumpZone && !isGrounded && this.player.y > topOfTower) {
            // Không setVelocityX() ở đây để giữ nguyên quán tính bay
            // Quán tính bật tường sẽ tự động đẩy người chơi đập vào mặt tường đối diện
        } else {
            // Chế độ di chuyển bình thường
            if (this.cursors.left.isDown || this.keyA.isDown) {
                this.player.body.setVelocityX(-350);
                isMoving = true;
                this.playerSprite.setFlipX(true);
            } else if (this.cursors.right.isDown || this.keyD.isDown) {
                this.player.body.setVelocityX(350);
                isMoving = true;
                this.playerSprite.setFlipX(false);
            } else {
                this.player.body.setVelocityX(0);
            }
        }
        // (Cleaned up old wall jump logic)

        // --- Xử lý trượt dốc (Slope Physics) ---
        if (isGrounded) {
            let slope = this.getTerrainSlope(pX);
            
            // Nếu đi lên dốc, giảm tốc độ
            if (slope < -0.1 && this.cursors.right.isDown) {
                this.player.body.velocity.x *= 0.5; // Dốc lên bên phải
            } else if (slope > 0.1 && this.cursors.left.isDown) {
                this.player.body.velocity.x *= 0.5; // Dốc lên bên trái
            }
            
            // Nếu không bấm nút di chuyển mà đứng trên dốc thì trượt xuống
            if (!this.cursors.left.isDown && !this.cursors.right.isDown && !this.keyA.isDown && !this.keyD.isDown) {
                if (slope > 0.1) {
                    this.player.body.velocity.x += slope * 15; // Trượt phải
                } else if (slope < -0.1) {
                    this.player.body.velocity.x += slope * 15; // Trượt trái
                }
            } else {
                // Nếu đi xuống dốc, đi nhanh hơn chút
                if (slope > 0.1 && this.cursors.right.isDown) {
                    this.player.body.velocity.x += 100;
                } else if (slope < -0.1 && this.cursors.left.isDown) {
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

        // --- PROCEDURAL ANIMATION TWEENING ---
        let newState = 'idle';
        if (!isGrounded) newState = 'jump';
        else if (isMoving) newState = 'walk';

        if (this.playerState !== newState) {
            this.playerState = newState;
            if (this.playerTween) this.playerTween.stop();
            this.playerSprite.setAngle(0);
            this.playerSprite.setScale(this.playerSprite.baseScale);
            
            if (newState === 'idle') {
                this.playerTween = this.tweens.add({
                    targets: this.playerSprite,
                    scaleY: this.playerSprite.baseScale * 0.95,
                    scaleX: this.playerSprite.baseScale * 1.05,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (newState === 'walk') {
                this.playerTween = this.tweens.add({
                    targets: this.playerSprite,
                    angle: { from: -15, to: 15 },
                    scaleY: this.playerSprite.baseScale * 0.9,
                    duration: 200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (newState === 'jump') {
                this.playerTween = this.tweens.add({
                    targets: this.playerSprite,
                    scaleY: this.playerSprite.baseScale * 1.2,
                    scaleX: this.playerSprite.baseScale * 0.8,
                    duration: 300,
                    yoyo: true,
                    ease: 'Quad.easeOut'
                });
            }
        }

        // --- LOGIC TƯƠNG TÁC THIÊN NHIÊN ---
        // Cỏ lay động
        let px = this.player.x;
        let py = this.player.y + 40; // Tọa độ đáy của Mầm
        let vx = this.player.body.velocity.x;
        let hitRadius = this.player.body.width / 2; // Nửa chiều rộng hitbox (20px)

        this.grassClumps.forEach(clump => {
            if (!clump.isSwaying && Math.abs(px - clump.x) <= hitRadius && Math.abs(py - clump.y) < 30 && Math.abs(vx) > 5) {
                clump.isSwaying = true;
                
                // Chạm vào → đổi màu xanh vĩnh viễn
                if (!clump.hasBeenTouched) {
                    clump.hasBeenTouched = true;
                    clump.blades.forEach(b => b.setFillStyle(0x00aa00));
                }

                // Animation TỪNG LÁ CỎ uốn lượn theo hướng di chuyển
                let swayDir = vx > 0 ? 1 : -1;
                clump.blades.forEach((blade, idx) => {
                    let delay = idx * 50; // Lệch thời gian giữa các lá
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

        // Nở hoa
        this.flowers.forEach(flower => {
            if (!flower.isBloomed && Math.abs(px - flower.x) <= hitRadius && Math.abs(py - flower.y) < 30) {
                flower.isBloomed = true;
                // Thân cây hóa xanh
                flower.stem.setFillStyle(0x228833);
                // Nụ hoa đổi màu
                flower.bud.setFillStyle(0xffcc00);
                // Cánh hoa nở ra với animation
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
                // Bắn hạt đom đóm
                let emitter = this.add.particles(flower.x, flower.y - 30, 'firefly', {
                    speed: { min: -50, max: 50 },
                    scale: { start: 1, end: 0 },
                    lifespan: 2000,
                    blendMode: 'ADD'
                });
                emitter.explode(10);
            }
        });

        // Tương tác hộp carton (giải đố đẩy thùng)
        let distToBox = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.box.x, this.box.y - 30);
        let isNearBox = distToBox < 100;

        if (this.isAttachedToBox) {
            // Tắt collider để player đi xuyên qua hộp (đẩy được)
            this.boxCollider.active = false;
            // Giảm tốc độ khi đang kéo/đẩy hộp (sức trì, cảm giác nặng)
            this.player.body.setMaxVelocityX(150);

            // Tính giới hạn hộp: mép phải hộp không được chạm mép trái tường
            // Tường tại x=3500, hộp rộng 60 origin(0.5,1) → mép phải = box.x + 30
            let wallLeftEdge = 3500;
            let boxHalfW = 30;
            let playerHalfW = 20; // player rộng 40

            // Hộp luôn nằm bên cạnh player
            let boxTargetX;
            if (this.boxSide === 'right') {
                boxTargetX = this.player.x + 50;
            } else {
                boxTargetX = this.player.x - 50;
            }

            // Clamp hộp: không vượt qua tường và không ra ngoài map
            let boxMaxX = wallLeftEdge - boxHalfW; // 3470
            let boxMinX = boxHalfW; // 30
            boxTargetX = Phaser.Math.Clamp(boxTargetX, boxMinX, boxMaxX);

            this.box.setPosition(boxTargetX, this.boxOrigY);
            this.box.body.updateFromGameObject();
            this.boxVisuals.setPosition(boxTargetX, this.boxOrigY);

            // Clamp player: không đi chồng lên hộp khi hộp đã chạm tường
            if (this.boxSide === 'right' && this.player.x > boxTargetX - 50) {
            this.player.x = boxTargetX - 50;
                this.player.body.setVelocityX(0);
            } else if (this.boxSide === 'left' && this.player.x < boxTargetX + 50) {
                this.player.x = boxTargetX + 50;
                this.player.body.setVelocityX(0);
            }

            this.boxPrompt.x = this.box.x;
            this.boxPrompt.y = this.box.y - 80;
            this.boxPrompt.setText('Bấm F để Buông ra');
            this.boxPrompt.setAlpha(1);

            // Buông ra khi bấm F
            if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
                this.isAttachedToBox = false;
                this.player.body.setMaxVelocityX(400);
                this.boxCollider.active = true; // Bật lại collider để nhảy lên hộp
            }
        } else if (isNearBox) {
            this.boxPrompt.x = this.box.x;
            this.boxPrompt.y = this.box.y - 80;
            this.boxPrompt.setText('Bấm F để Cầm hộp');
            this.boxPrompt.setAlpha(1);

            if (Phaser.Input.Keyboard.JustDown(this.fKey) && this.player.body.onFloor()) {
                this.isAttachedToBox = true;
                // Xác định hộp nằm bên nào so với player
                this.boxSide = (this.box.x > this.player.x) ? 'right' : 'left';
            }
        } else {
            this.boxPrompt.setAlpha(0);
        }

        // Hồi sinh gốc cây bắc cầu bằng nút F
        if (this.stumps) {
            this.stumps.forEach(stumpObj => {
                let stump = stumpObj.container;
                let prompt = stumpObj.prompt;
                
                let isNearStump = !stump.isBloomed && Math.abs(px - stump.x) <= hitRadius * 3 && Math.abs(py - stump.y) < 40;
                if (isNearStump) {
                    prompt.setAlpha(1);
                    if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
                        stump.isBloomed = true;
                        prompt.setAlpha(0);
                        
                        // Hồi sinh gốc cây: thêm rêu + lá mọc tự nhiên
                        let moss1 = this.add.ellipse(-6, -18, 14, 7, 0x1a6633, 0.5);
                        let moss2 = this.add.ellipse(8, -30, 10, 5, 0x227744, 0.4);
                        let leaf1 = this.add.triangle(18, -45, 0, 14, 16, 7, 8, 0, 0x2d8a4e).setOrigin(0.5, 1).setAngle(25);
                        let leaf2 = this.add.triangle(-12, -48, 0, 12, 14, 6, 7, 0, 0x3da35d).setOrigin(0.5, 1).setAngle(-20);
                        stump.add([moss1, moss2, leaf1, leaf2]);
                        [moss1, moss2, leaf1, leaf2].forEach((item, i) => {
                            item.setScale(0);
                            this.tweens.add({ targets: item, scale: 1, duration: 500, delay: i * 120, ease: 'Back.easeOut' });
                        });
                        
                        // Cầu dây leo bắc qua hố - dùng Graphics vẽ tự nhiên
                        let bridgeY = this.cameras.main.height - 112;
                        let bridgeG = this.add.graphics();
                        
                        // Vẽ 3 dây leo uốn cong qua hố (mỗi dây khác nhau)
                        let vines = [
                            { color: 0x3da35d, thick: 8, sag: 25 },
                            { color: 0x2d8a4e, thick: 6, sag: 40 },
                            { color: 0x1a6633, thick: 12, sag: 15 }
                        ];
                        
                        let drawObj = { w: 0 };
                        this.tweens.add({
                            targets: drawObj,
                            w: stump.bridgeLength,
                            duration: 1500,
                            ease: 'Linear',
                            onUpdate: () => {
                                bridgeG.clear();
                                vines.forEach((vine, vi) => {
                                    bridgeG.lineStyle(vine.thick, vine.color, 1);
                                    bridgeG.beginPath();
                                    bridgeG.moveTo(stump.bridgeStartX, bridgeY + vi * 3);
                                    for (let bx = 0; bx <= drawObj.w; bx += 20) {
                                        let progress = bx / stump.bridgeLength;
                                        let curveY = Math.sin(progress * Math.PI) * vine.sag;
                                        bridgeG.lineTo(stump.bridgeStartX + bx, bridgeY + vi * 3 + curveY);
                                    }
                                    // Bổ sung đoạn cuối cùng để mượt
                                    if (drawObj.w > 0) {
                                        let progress = drawObj.w / stump.bridgeLength;
                                        let curveY = Math.sin(progress * Math.PI) * vine.sag;
                                        bridgeG.lineTo(stump.bridgeStartX + drawObj.w, bridgeY + vi * 3 + curveY);
                                    }
                                    bridgeG.strokePath();
                                });
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
                        
                        // Lá treo lủng lẳng dưới dây leo (ẩn ban đầu)
                        let allLeaves = [];
                        for (let lx = 50; lx < stump.bridgeLength; lx += Phaser.Math.Between(30, 70)) {
                            let progress = lx / stump.bridgeLength;
                            // Tính toán y theo đường võng (lấy độ võng trung bình là 25)
                            let curveY = Math.sin(progress * Math.PI) * 25;
                            let leaf = this.add.ellipse(stump.bridgeStartX + lx, bridgeY + curveY + 5 + Phaser.Math.Between(0, 15), 10, 20, 0x4fc26d).setOrigin(0.5, 0).setAlpha(0);
                            if (Math.random() > 0.5) leaf.setAngle(Phaser.Math.Between(-30, 30));
                            allLeaves.push(leaf);
                        }
                        
                        // Physics body tàng hình
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

        // --- TRIGGER PHÁO KÍCH ---
        if (this.player.x > 3950 && this.player.body.touching.down && !this.hasTriggeredArtillery) {
            this.hasTriggeredArtillery = true;
            this.isCinematic = true;
            this.player.body.setAccelerationX(0);
            this.player.body.setVelocityX(0);
            this.player.body.setVelocityY(0);
            
            // Pan camera tới trước mặt một chút
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
                this.scene.start('GameOverScene', { reason: 'Mầm đã bị nước độc ăn mòn và chết khô cùng quê hương.' });
            });
        });
    }

    triggerArtilleryStrike() {
        let h = this.cameras.main.height;
        let w = this.cameras.main.width;
        let p1X = 4300;
        let p2X = 4600;
        
        // 1. Rung lắc nhẹ & Câu thoại "Cái gì vậy?"
        this.cameras.main.shake(1000, 0.005);
        let msg = this.add.text(this.player.x, this.player.y - 80, 'Cái gì vậy?', { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0.5);
        
        this.time.delayedCall(1500, () => {
            msg.destroy();
            
            // 2. Hai quả đạn pháo rơi
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
                    
                    // Kích hoạt hố bom khổng lồ và vẽ lại địa hình
                    this.cratersCreated = true;
                    this.rebuildTerrain();
                    this.createStump(4050, 4100, 750);
                    
                    // 3. Nước độc chất lượng cao tràn vào từ dưới lên
                    // Đặt nước nằm cố định ngay hố (4150) nhưng bắt đầu từ y sâu bên dưới (h + 200)
                    let floodContainer = this.add.container(4150, h + 200).setDepth(3);
                    
                    let w1 = this.add.rectangle(0, -70, 1000, 400, 0x1a0022, 0.95).setOrigin(0, 0); // Kéo dài chiều cao xuống dưới
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
                    
                    // Tween nổi lên trên thay vì di chuyển ngang
                    this.tweens.add({
                        targets: floodContainer,
                        y: h + 40, // Di chuyển y sao cho bề mặt nước nằm ở h - 60
                        duration: 3500,
                        ease: 'Sine.easeOut',
                        onComplete: () => {
                            // Tạo physics collider để game over nếu chạm nước
                            // Lúc này y của container là h+40. Bề mặt nước nội bộ là -100, tức h - 60 thực tế.
                            // Để tránh cầu bị ngập, ta hạ physics xuống 1 chút (h - 40).
                            this.floodZone = this.add.rectangle(4150, h - 40, 1000, 200, 0, 0).setOrigin(0, 0);
                            this.physics.add.existing(this.floodZone, true);
                            this.physics.add.overlap(this.player, this.floodZone, this.triggerGameOver);
                            
                            // 4. Trả lại control
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
        
        // Vẽ lại mask
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
        
        // Vẽ lại viền
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
        
        // Vẽ lại physics
        this.groundGroup.clear(true, true);
        for (let x = 0; x <= w * 6; x += 20) {
            let ty = this.getTerrainY(x);
            if (!(x > 1536 && x <= 2048)) {
                let rect = this.add.rectangle(x, ty, 20, (h + 1500) - ty, 0x000000, 0).setOrigin(0, 0);
                this.physics.add.existing(rect, true);
                this.groundGroup.add(rect);
            }
        }
        
        // Xóa cỏ cây ở khu vực bị nổ
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
        
        // Hố nước độc
        if (x > 1536 && x <= 2048) {
            return h + 1000;
        }
        // Dốc khổng lồ xuống vực nước độc cuối map (sau chướng ngại vật Wall Jump)
        if (x >= 5500 && x <= 7500) {
            let t = (x - 5500) / 2000;
            return baseY + t * 1000; // Trũng xuống 1000px
        }
        if (x > 7500) {
            return baseY + 1000; // Đáy hồ phẳng
        }

        // Bằng phẳng mọi nơi trước khu vực nổ, hoặc nếu chưa có vụ nổ
        if (x < 3900 || !this.cratersCreated) return baseY;

        let offset = 0;
        
        // Đoạn lòi lõm SAU bức tường (x > 3900) CHỈ hiện sau khi đạn pháo rơi
        // Một lỗ hổng khổng lồ (x: 4100 -> 4800)
        if (x >= 4100 && x <= 4800) {
            let t = (x - 4100) / 700;
            offset = Math.sin(t * Math.PI) * 120; // sâu 120px
        }
        
        // Giữ bằng phẳng ở khúc còn lại
        return baseY + offset; 
    }

    getTerrainSlope(x) {
        // Đạo hàm xấp xỉ bằng cách lấy độ chênh lệch y của x-1 và x+1
        let y1 = this.getTerrainY(x - 5);
        let y2 = this.getTerrainY(x + 5);
        return (y2 - y1) / 10;
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
        
        let prompt = this.add.text(x, h - 200, 'Bấm F để hồi sinh gốc cây', { font: 'bold 18px Arial', fill: '#ffffff', backgroundColor: '#000000aa', padding: { x: 8, y: 5 } }).setOrigin(0.5).setAlpha(0);
        
        this.stumps = this.stumps || [];
        this.stumps.push({ container: stumpContainer, prompt: prompt });
    }
}
window.RunnerScene = RunnerScene;
