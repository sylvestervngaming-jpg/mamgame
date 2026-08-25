export default class SurvivalScene extends Phaser.Scene {
    constructor() { super('SurvivalScene'); }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.cameras.main.setBackgroundColor('#ffbb77'); // Ná»n trá»i náº¯ng gáº¯t
        this.physics.world.setBounds(0, 0, w * 3, h);
        
        this.registry.set('showUI', true);
        this.registry.set('showSurvival', true);

        // Ground
        this.ground = this.add.rectangle(0, h-50, w*3, 100, 0xaa6622).setOrigin(0,0);
        this.physics.add.existing(this.ground, true);
        
        // Visual sun overlay
        this.sunOverlay = this.add.rectangle(0, 0, w*3, h, 0xffaa00, 0.2).setOrigin(0,0);

        // Create Pagodas (Shade)
        this.shades = this.physics.add.staticGroup();
        this.createPagoda(600, h-50);
        this.createPagoda(1500, h-50);
        this.createPagoda(2600, h-50);

        // Player
        this.player = this.add.rectangle(100, h-100, 40, 80, 0x66ff66);
        this.physics.add.existing(this.player);
        this.player.body.setGravityY(1000);
        this.physics.add.collider(this.player, this.ground);

        // Camera
        this.cameras.main.setBounds(0, 0, w*3, h);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -w/4, 200);

        this.add.text(w/2, 50, 'Cáº£nh 17: Cháº¡y trá»‘n khá»i máº·t trá»i! Náº¥p vÃ o cÃ¡c mÃ¡i Ä‘Ã¬nh (bÃ³ng rÃ¢m).', { fontSize: '24px', fill: '#000', backgroundColor: '#fff' }).setOrigin(0.5).setScrollFactor(0);

        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Báº­t UI Global lÃªn
        this.registry.set('showUI', true);
    }

    createPagoda(x, y) {
        // Váº½ Ä‘Ã¬nh/nhÃ  lÃ¡ (Pagoda) - Scene 17
        this.add.rectangle(x, y - 60, 20, 120, 0x332211); // Cá»™t 1
        this.add.rectangle(x + 160, y - 60, 20, 120, 0x332211); // Cá»™t 2
        this.add.triangle(x + 80, y - 120, 0, 60, 80, 0, 160, 60, 0xaa2222).setScale(1.5); // MÃ¡i ngÃ³i

        // Hitbox bÃ³ng rÃ¢m
        let shade = this.add.rectangle(x + 80, y - 60, 160, 120, 0x000000, 0.4);
        this.shades.add(shade);
    }

    update() {
        if (this.cursors.right.isDown) { this.player.body.setVelocityX(350); }
        else if (this.cursors.left.isDown) { this.player.body.setVelocityX(-350); }
        else { this.player.body.setVelocityX(0); }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.body.setVelocityY(-500);
        }

        // Check shade overlap
        let inShade = false;
        this.physics.overlap(this.player, this.shades, () => { inShade = true; });

        // Cáº­p nháº­t giÃ¡ trá»‹ Global thay vÃ¬ local
        let sun = this.registry.get('sun');
        let water = this.registry.get('water');

        if (inShade) {
            sun = Math.max(0, sun - 0.05); // Giáº£m ráº¥t cháº­m khi trong bÃ³ng rÃ¢m
            this.player.setFillStyle(0x66ff66); // Xanh trá»Ÿ láº¡i
        } else {
            sun = Math.min(100, sun + 0.1); // Náº¯ng tÄƒng lÃªn tá»« tá»«
            water = Math.max(0, water - 0.02); // NÆ°á»›c bá»‘c hÆ¡i
            this.player.setFillStyle(0xff8866); // Äá» lÃªn vÃ¬ nÃ³ng
        }

        this.registry.set('sun', sun);
        this.registry.set('water', water);

        // Äiá»u kiá»‡n tháº¯ng (Cháº¡y Ä‘áº¿n cuá»‘i mÃ n hÃ¬nh)
        if (this.player.x > this.physics.world.bounds.width - 100) {
            this.registry.set('showUI', false);
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('TextTransitionScene', { 
                    text: 'Cáº£nh 18 & 20\nBáº¡n chá»n rá»i Ä‘i?\n...\nHay á»Ÿ láº¡i?', 
                    nextScene: 'DialogueScene', 
                    nextData: { nextScene: 'EndingScene' } 
                });
            });
        }
    }
}
