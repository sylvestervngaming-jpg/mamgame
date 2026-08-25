import AtmosphereFX from '../utils/AtmosphereFX.js';
import CollectibleItem from '../entities/CollectibleItem.js';
import AssetManager from '../utils/AssetManager.js';
import Player from '../entities/Player.js';
import LotusPlatform from '../entities/LotusPlatform.js';
import NPC from '../entities/NPC.js';
import DialogueBox from '../ui/DialogueBox.js';

export default class Map3Scene extends Phaser.Scene {
    constructor() {
        super('Map3Scene');
    }

    preload() {
        AssetManager.preloadAll(this);
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        AtmosphereFX.createGodRays(this, { startX: 0, endX: 4000, color: 0x81ecec, baseAlpha: 0.15, tilt: 250 });
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
        this.registry.set('showUI', true);

        // Sinh nÆ°Æ¡Ì c (pond_water)
        AssetManager.generateAndSave(this, 'pond_water', 8000, 300, (g) => {
            g.fillStyle(0x0e5e77, 0.8);
            g.fillRect(0, 0, 8000, 300);
            g.fillStyle(0x0bc2e2, 0.5);
            g.fillRect(0, 0, 8000, 20);
        });

        // Background maÌ€u sÆ¡ng muÌ€ nhaÌ£t
        this.cameras.main.setBackgroundColor('#81ecec');

        // ThÃªm nÆ°Æ¡Ì c
        let waterY = h - 100;
        this.add.image(0, waterY, 'pond_water').setOrigin(0, 0).setDepth(5);
        
        // VuÌ€ng nÆ°Æ¡Ì c - rÆ¡i xuÃ´Ì ng sÆ¡n chÃªÌ t
        this.waterDeathZone = this.add.rectangle(0, waterY + 40, 8000, 300, 0, 0).setOrigin(0,0);
        this.physics.add.existing(this.waterDeathZone, true);

        // NhoÌ m lotus
        this.lotusGroup = this.physics.add.staticGroup();

        // BÆ¡Ì€ Ä‘Ã¢Ì t xuÃ¢Ì t phaÌ t
        let startBank = this.add.rectangle(0, waterY - 50, 280, 500, 0x636e72).setOrigin(0,0);
        this.physics.add.existing(startBank, true);
        this.lotusGroup.add(startBank);

        // KhÆ¡Ì‰i taÌ£o Player
        this.player = new Player(this, 100, waterY - 100);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Danh sÃ¡ch vá»‹ trÃ­ cÃ´Ì  Ä‘á»‹nh cho caÌ c laÌ  sen vaÌ€ bÃ´ng sen
        const lotusLayout = [
            { x: 380, y: waterY - 20, type: 'leaf' },
            { x: 590, y: waterY - 30, type: 'leaf' },
            { x: 800, y: waterY - 15, type: 'leaf' },
            { x: 1010, y: waterY - 35, type: 'leaf' },
            { x: 1220, y: waterY - 20, type: 'leaf' },
            { x: 1430, y: waterY - 30, type: 'leaf' },
            { x: 1640, y: waterY - 15, type: 'leaf' },
            { x: 1850, y: waterY - 35, type: 'leaf' },
            { x: 2080, y: waterY - 20, type: 'flower' }
        ];

        lotusLayout.forEach((pos) => {
            let lotus = new LotusPlatform(this, pos.x, pos.y, pos.type);
            this.lotusGroup.add(lotus);

            if (pos.type === 'flower') {
                this.createNPC(pos.x, pos.y);
            }
        });

        // BÆ¡Ì€ Ä‘Ã¢Ì t Ä‘iÌ ch Ä‘ÃªÌ n sau bÃ´ng sen cuÃ´Ì i
        let endBank = this.add.rectangle(2220, waterY - 50, 400, 500, 0x636e72).setOrigin(0,0);
        this.physics.add.existing(endBank, true);
        this.lotusGroup.add(endBank);

        // Camera follow
        this.cameras.main.setBounds(0, 0, 2700, h);
        this.physics.world.setBounds(0, 0, 2700, h + 500);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Va chaÌ£m vaÌ€ nhaÌ‰y loÌ€ xo
        this.physics.add.collider(this.player.hitbox, this.lotusGroup, (hitbox, platform) => {
            if (platform.bouncePlayer && hitbox.body.touching.down) {
                platform.bouncePlayer(hitbox);
            }
        });

        // HÃ´Ì£i thoaÌ£i UI
        this.dialogueBox = new DialogueBox(this);

        this.isGameOver = false;

        // --- CÁC VẬT PHẨM TRÊN LÁ SEN MAP 3 ---
        this.itemGroup = this.physics.add.staticGroup();
        const m3Items = [
            { x: 590, y: waterY - 80, type: 'dewdrop' },
            { x: 1010, y: waterY - 85, type: 'mushroom' },
            { x: 1430, y: waterY - 80, type: 'coin' },
            { x: 1850, y: waterY - 85, type: 'mushroom' }
        ];
        m3Items.forEach(i => {
            let item = new CollectibleItem(this, i.x, i.y, i.type);
            this.itemGroup.add(item);
        });
        this.physics.add.overlap(this.player.hitbox, this.itemGroup, (hitbox, item) => item.collect(hitbox));
        this.physics.add.overlap(this.player.hitbox, this.waterDeathZone, () => {
            if (!this.isGameOver) this.gameOver();
        });
    }

    createNPC(x, y) {
        this.npc = new NPC(this, x, y - 20);
        this.npc.onInteract = () => {
            if (this.dialogueBox.active) return;
            
            this.player.hitbox.body.setVelocityX(0);
            
            this.dialogueBox.show([
                { text: 'A', callback: () => this.dialogueBox.hide() },
                { text: 'B', callback: () => this.dialogueBox.hide() },
                { text: 'C', callback: () => this.dialogueBox.hide() },
                { text: 'Rời khỏi nơi này', callback: () => {
                    this.cameras.main.fadeOut(1000, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('Map4Scene');
                    });
                }}
            ]);
        };
    }

    update() {
        if (this.isGameOver) return;
        
        if (this.npc) this.npc.update(this.player);
        
        if (!this.dialogueBox.active) {
            this.player.updateLogic(this.cursors, this.spacebar, this.cameras.main.height - 100);
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.player.setTint(0xff0000);
        this.player.hitbox.body.setEnable(false);
        this.cameras.main.shake(500, 0.02);
        
        this.time.delayedCall(1000, () => {
            this.scene.stop('UIScene');
            this.scene.start('GameOverScene', { reason: 'Mầm đã chết đuối dưới hồ sen.', retryScene: 'Map3Scene' });
        });
    }
}
