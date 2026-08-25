import AssetManager from '../utils/AssetManager.js';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        AssetManager.generateAndSave(scene, 'npc_blue', 60, 60, (g) => {
            g.fillStyle(0x0984e3, 1); // Xanh biển đậm
            g.fillCircle(30, 30, 28);
            g.lineStyle(3, 0x000000, 1);
            g.strokeCircle(30, 30, 28);
        });

        super(scene, x, y, 'npc_blue');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static

        this.setOrigin(0.5, 1);

        // UI bóng thoại tương tác (Chạm trực tiếp hoặc bấm F)
        let isMobile = scene.sys.game.device.os.android || scene.sys.game.device.os.iOS || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        let promptLabel = isMobile ? '💬 Chạm để nói chuyện' : '💬 Bấm F để nói chuyện';
        this.promptText = scene.add.text(x, y - 80, promptLabel, {
            font: 'bold 16px Arial',
            fill: '#00d2d3',
            backgroundColor: '#1e272e',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setAlpha(0).setDepth(100).setInteractive({ useHandCursor: true });

        this.promptText.on('pointerdown', () => {
            if (this.isPlayerNear && !scene.dialogueBox?.active) {
                this.interact();
            }
        });

        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', () => {
            if (this.isPlayerNear && !scene.dialogueBox?.active) {
                this.interact();
            }
        });

        this.isPlayerNear = false;

        // Lắng nghe sự kiện bàn phím trực tiếp để bấm F lúc nào cũng ăn 100%
        scene.input.keyboard.on('keydown-F', () => {
            if (this.isPlayerNear && !scene.dialogueBox?.active) {
                this.interact();
            }
        });
    }

    update(player) {
        if (!player) return;

        let dx = Math.abs(this.x - player.x);
        let dy = this.y - player.y; // player ở phía trên NPC khi nhảy

        // Vùng tương tác rộng: ngang 250px và cao tới 450px (để khi nhân vật nảy tít lên cao vẫn tương tác được)
        let inRange = (dx <= 250 && dy >= -80 && dy <= 450);
        
        if (inRange) {
            if (!this.isPlayerNear) {
                this.isPlayerNear = true;
                this.scene.tweens.killTweensOf(this.promptText);
                this.scene.tweens.add({ targets: this.promptText, alpha: 1, duration: 150 });
            }
        } else {
            if (this.isPlayerNear) {
                this.isPlayerNear = false;
                this.scene.tweens.killTweensOf(this.promptText);
                this.scene.tweens.add({ targets: this.promptText, alpha: 0, duration: 150 });
            }
        }
    }

    interact() {
        if (this.onInteract) {
            this.onInteract();
        }
    }
}
