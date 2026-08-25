import AssetManager from '../utils/AssetManager.js';

export default class LotusPlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'leaf') {
        let key = type === 'flower' ? 'lotus_flower' : 'lotus_leaf';
        
        // Sinh sprite placeholder nÃªÌ u chÆ°a coÌ 
        AssetManager.generateAndSave(scene, 'lotus_leaf', 120, 40, (g) => {
            g.fillStyle(0x2ecc71, 1);
            g.fillEllipse(60, 20, 120, 40);
            g.lineStyle(2, 0x27ae60, 1);
            g.strokeEllipse(60, 20, 120, 40);
        });

        AssetManager.generateAndSave(scene, 'lotus_flower', 100, 60, (g) => {
            g.fillStyle(0xff9ff3, 1);
            // CÃ¡c cÃ¡nh hoa
            g.fillEllipse(50, 30, 40, 60);
            g.fillEllipse(30, 40, 40, 40);
            g.fillEllipse(70, 40, 40, 40);
            g.fillStyle(0xfeca57, 1);
            g.fillEllipse(50, 40, 30, 15);
        });

        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static body

        this.type = type;
        
        if (type === 'leaf') {
            this.body.setSize(110, 24);
            this.body.setOffset(5, 8);
        } else {
            this.body.setSize(90, 24);
            this.body.setOffset(5, 30);
        }
        this.refreshBody();

        this.lastBounceTime = 0;
    }

    bouncePlayer(hitbox) {
        let now = this.scene.time.now;
        if (now - this.lastBounceTime < 200) return;
        this.lastBounceTime = now;

        // LÆ°Ì£c nÃ¢Ì‰y cÆ¡ baÌ‰n
        let bounceForce = -650;
        
        // NÃªÌ u ngÆ°Æ¡Ì€i chÆ¡i giÆ°Ìƒ nuÌ t nhaÌ‰y thiÌ€ bay cao hÆ¡n
        let touch = this.scene.registry.get('touchControls');
        let isHoldingJump = (this.scene.cursors && this.scene.cursors.up.isDown) || 
                             (this.scene.spacebar && this.scene.spacebar.isDown) ||
                             (touch && touch.isJump);
        if (isHoldingJump) {
            bounceForce = -850;
        }

        hitbox.body.setVelocityY(bounceForce);

        // HiÃªÌ£u Æ°Ì ng nhÃºn nhaÌ‰y (squash and stretch) bÄƒÌ€ng scale thay viÌ€ di chuyÃªÌ‰n toÌ£a Ä‘Ã´Ì£ y
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.25,
            scaleY: 0.7,
            duration: 90,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.setScale(1, 1);
            }
        });
    }
}
