import AtmosphereFX from '../utils/AtmosphereFX.js';
import CollectibleItem from '../entities/CollectibleItem.js';
import AssetManager from '../utils/AssetManager.js';
import Player from '../entities/Player.js';
import SunAwning from '../entities/SunAwning.js';
import HeatIndicator from '../ui/HeatIndicator.js';

export default class Map4Scene extends Phaser.Scene {
    constructor() {
        super('Map4Scene');
    }

    preload() {
        AssetManager.preloadAll(this);
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const mapWidth = 3200;

        this.cameras.main.fadeIn(1000, 0, 0, 0);
        AtmosphereFX.createGodRays(this, { startX: 0, endX: 5000, color: 0xfdcb6e, baseAlpha: 0.18, tilt: 420 });
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
        this.registry.set('showUI', true);

        // Bầu trời màu vàng cam chói chang của Đế Quốc Thái Dương
        this.cameras.main.setBackgroundColor('#f39c12');

        // Sinh sprite nền mặt trời và mặt đất sa mạc
        AssetManager.generateAndSave(this, 'sun_ground', 1000, 120, (g) => {
            g.fillStyle(0xd35400, 1);
            g.fillRect(0, 0, 1000, 120);
            g.fillStyle(0xe67e22, 1);
            g.fillRect(0, 0, 1000, 20);
            // Các vết nứt đất
            g.lineStyle(2, 0xa04000, 0.7);
            for (let x = 50; x < 1000; x += 150) {
                g.beginPath();
                g.moveTo(x, 20);
                g.lineTo(x + 15, 60);
                g.lineTo(x + 5, 100);
                g.strokePath();
            }
        });

        // Mặt trời khổng lồ rực cháy trên bầu trời
        this.sun = this.add.circle(w / 2, 140, 90, 0xffeb3b, 0.9).setScrollFactor(0.1).setDepth(1);
        this.sunRays = this.add.circle(w / 2, 140, 130, 0xffa000, 0.35).setScrollFactor(0.1).setDepth(0);
        this.tweens.add({
            targets: [this.sun, this.sunRays],
            scale: 1.12,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Mặt đất
        let groundY = h - 100;
        this.groundGroup = this.physics.add.staticGroup();

        for (let gx = 0; gx < mapWidth; gx += 1000) {
            let groundImg = this.add.image(gx, groundY, 'sun_ground').setOrigin(0, 0).setDepth(3);
            let groundBody = this.add.rectangle(gx + 500, groundY + 60, 1000, 120, 0, 0);
            this.physics.add.existing(groundBody, true);
            this.groundGroup.add(groundBody);
        }

        // Tạo nhân vật Mầm
        this.player = new Player(this, 120, groundY - 40);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Va chạm giữa Player và mặt đất
        this.physics.add.collider(this.player.hitbox, this.groundGroup);

        // --- CÁC VẬT PHẨM THU THẬP TRÊN SA MẠC MAP 4 ---
        this.itemGroup = this.physics.add.staticGroup();
        const m4Items = [
            { x: 350, y: groundY - 45, type: 'sun_crystal' },
            { x: 800, y: groundY - 45, type: 'coin' },
            { x: 1300, y: groundY - 45, type: 'sun_crystal' },
            { x: 1800, y: groundY - 45, type: 'potion' },
            { x: 2300, y: groundY - 45, type: 'sun_crystal' },
            { x: 2750, y: groundY - 45, type: 'mushroom' }
        ];
        m4Items.forEach(i => {
            let item = new CollectibleItem(this, i.x, i.y, i.type);
            this.itemGroup.add(item);
        });
        this.physics.add.overlap(this.player.hitbox, this.itemGroup, (hitbox, item) => item.collect(hitbox));

        // Danh sách các Mái Hiên Che Nắng (Sun Awnings)
        this.awnings = [];
        const awningPositions = [
            { x: 120, width: 220 },   // Mái hiên điểm xuất phát (an toàn)
            { x: 550, width: 200 },
            { x: 1050, width: 220 },
            { x: 1550, width: 200 },
            { x: 2050, width: 220 },
            { x: 2550, width: 240 },
            { x: 2950, width: 260 }   // Mái hiên cổng thành cuối map
        ];

        awningPositions.forEach(pos => {
            let awning = new SunAwning(this, pos.x, groundY - 180, pos.width, 180);
            this.awnings.push(awning);
        });

        // Cổng thành cuối map dẫn sang Vương Quốc Dạ Nấm
        this.endGate = this.add.rectangle(2980, groundY - 90, 80, 180, 0x9b59b6, 0.4)
            .setStrokeStyle(4, 0xd980fa)
            .setDepth(2);
        this.add.text(2980, groundY - 200, '🍄 CỔNG VƯƠNG QUỐC DẠ NẤM', {
            font: 'bold 16px Arial',
            fill: '#d980fa',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(10);

        // Camera & Physics Bounds
        this.cameras.main.setBounds(0, 0, mapWidth, h);
        this.physics.world.setBounds(0, 0, mapWidth, h + 200);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // UI Đo Nhiệt Độ & Thời Gian Nắng
        this.heatIndicator = new HeatIndicator(this);

        // Biến trạng thái Sinh Tồn Nắng
        this.maxSunTime = 5.0;
        this.sunTimeLeft = 5.0;
        this.isUnderShade = true;
        this.isGameOver = false;
        this.isTransitioning = false;
    }

    update(time, delta) {
        if (this.isGameOver || this.isTransitioning) return;

        // Cập nhật di chuyển nhân vật
        this.player.updateLogic(this.cursors, this.spacebar, this.cameras.main.height - 100);

        // Kiểm tra nhân vật có đứng dưới mái hiên nào không
        this.isUnderShade = this.awnings.some(awning => awning.isUnder(this.player));

        if (this.isUnderShade) {
            // Hồi phục thanh nhiệt độ nhanh chóng khi ở trong bóng râm
            this.sunTimeLeft = Math.min(this.maxSunTime, this.sunTimeLeft + (delta / 1000) * 4);
        } else {
            // Đang đứng dưới trời nắng gắt -> giảm thời gian
            this.sunTimeLeft -= delta / 1000;

            if (this.sunTimeLeft <= 0) {
                this.sunTimeLeft = 0;
                this.triggerSunBurn();
            }
        }

        // Cập nhật thanh đo nhiệt độ
        this.heatIndicator.updateHeat(this.sunTimeLeft, this.maxSunTime, this.isUnderShade);

        // Kiểm tra về đích (x >= 2950)
        if (this.player.hitbox.x >= 2950 && !this.isTransitioning) {
            this.reachFinish();
        }
    }

    triggerSunBurn() {
        this.isGameOver = true;
        this.player.setTint(0xff3300);
        this.player.hitbox.body.setVelocity(0, 0);
        this.player.hitbox.body.setEnable(false);

        // Hiệu ứng màn hình chớp đỏ cháy rực
        this.cameras.main.flash(700, 255, 60, 0);
        this.cameras.main.shake(600, 0.03);

        this.time.delayedCall(1200, () => {
            this.scene.stop('UIScene');
            this.scene.start('GameOverScene', {
                reason: 'Mầm đã bị ánh nắng gay gắt của Đế Quốc Thái Dương thiêu rụi.',
                retryScene: 'Map4Scene'
            });
        });
    }

    reachFinish() {
        this.isTransitioning = true;
        this.player.hitbox.body.setVelocity(0, 0);
        
        this.cameras.main.fadeOut(1200, 30, 8, 38); // Fade sang màu tím đêm
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop('UIScene');
            this.scene.start('Map5Scene');
        });
    }
}
