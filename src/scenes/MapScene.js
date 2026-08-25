export default class MapScene extends Phaser.Scene {
    constructor() {
        super('MapScene');
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Táº¯t UI á»Ÿ Báº£n Ä‘á»“
        this.registry.set('showUI', false);

        this.add.text(w/2, 100, 'Báº¢N Äá»’ THáº¾ GIá»šI', { font: 'bold 40px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(w/2, 140, 'PhÃ­ di chuyá»ƒn: 100 Coins / Chuyáº¿n', { font: '20px Arial', fill: '#ffff00' }).setOrigin(0.5);
        
        // Váº½ báº£n Ä‘á»“ giáº£ láº­p Ä‘Æ°á»ng Ä‘i
        let mapGraphics = this.add.graphics();
        mapGraphics.lineStyle(4, 0xaaaaaa, 1);
        mapGraphics.beginPath();
        mapGraphics.moveTo(200, h/2); // Map 1
        mapGraphics.lineTo(400, h/2 - 100); // Map 2
        mapGraphics.lineTo(650, h/2 + 50);  // Map 3
        mapGraphics.lineTo(900, h/2 - 50);  // Map 4
        mapGraphics.lineTo(1100, h/2 + 100); // Map 5
        mapGraphics.strokePath();

        // Khá»Ÿi táº¡o cÃ¡c Node
        this.createMapNode(200, h/2, 'Map 1: VÃ¹ng XÃ¡m\n(QuÃª hÆ°Æ¡ng)', 0x555555, true, 'RunnerScene');
        this.createMapNode(400, h/2 - 100, 'Map 2: Cá»‘i Xay GiÃ³\n(HÃ  Lan)', 0xff00ff, false, 'RunnerScene');
        this.createMapNode(650, h/2 + 50, 'Map 3: LÃ ng Sen\n(Viá»‡t Nam)', 0x00ff00, false, 'RunnerScene');
        this.createMapNode(900, h/2 - 50, 'Map 4: ThÃ¡i DÆ°Æ¡ng\n(PhÃ¡p)', 0xffff00, false, 'RunnerScene');
        this.createMapNode(1100, h/2 + 100, 'Map 5: Dáº¡ Náº¥m\n(Na Uy)', 0x0088ff, false, 'RunnerScene');
    }

    createMapNode(x, y, label, color, isUnlocked, targetScene) {
        let circle = this.add.circle(x, y, 30, color);
        if (!isUnlocked) circle.setAlpha(0.5);
        
        circle.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            let coins = this.registry.get('coins');
            if (coins >= 100) {
                // this.registry.set('coins', coins - 100); // Trá»« tiá»n (Táº¡m khÃ³a Ä‘á»ƒ test cho dá»…)
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start(targetScene);
                });
            } else {
                this.showError(x, y, 'KhÃ´ng Ä‘á»§ Coins!');
            }
        });

        this.add.text(x, y + 50, label, { font: '18px Arial', fill: '#fff', align: 'center' }).setOrigin(0.5);
    }

    showError(x, y, msg) {
        let err = this.add.text(x, y - 50, msg, { font: 'bold 20px Arial', fill: '#ff0000' }).setOrigin(0.5);
        this.tweens.add({
            targets: err,
            y: y - 80,
            alpha: 0,
            duration: 1000,
            onComplete: () => err.destroy()
        });
    }
}
