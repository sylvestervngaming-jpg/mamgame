import AtmosphereFX from '../utils/AtmosphereFX.js';
import AssetManager from '../utils/AssetManager.js';
/**
 * Represents the main character in the game.
 * @class
 * @extends Phaser.GameObjects.Sprite
 */
export default class Player extends Phaser.GameObjects.Sprite {
    /**
     * @param {Phaser.Scene} scene - The scene this player belongs to.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     */
    constructor(scene, x, y) {
        super(scene, x, y);
        // --- TEXTURE GENERATION & AUTO-EXPORT ---
        AssetManager.generateAndSave(scene, 'green_circle', 50, 50, (g) => {
            g.fillStyle(0xffffff);
            g.fillCircle(25, 25, 25);
        });
        this.setTexture('green_circle');
        
        scene.add.existing(this);
        
        // --- HITBOX CỐT LÕI ---
        this.hitbox = scene.add.rectangle(x, y, 40, 40, 0x000000, 0).setOrigin(0.5, 0.5);
        scene.physics.add.existing(this.hitbox);
        this.hitbox.body.setCircle(20);
        this.hitbox.body.setGravityY(1200);
        this.hitbox.body.setCollideWorldBounds(true);
        
        // --- VISUAL SPRITE ---
        this.setOrigin(0.5, 1);
        this.baseScale = 1;
        this.setScale(this.baseScale);
        this.setDepth(10);
        
        // --- ÁP DỤNG TRANG PHỤC / MÀU SẮC ---
        let initialColor = scene.registry.get('playerColor') || 0x2ecc71;
        this.setTint(initialColor);

        this.colorChangeListener = (parent, color) => {
            this.setTint(color);
            if (this.aura) this.aura.setFillStyle(color, 0.28);
        };
        scene.registry.events.on('changedata-playerColor', this.colorChangeListener);

        this.on('destroy', () => {
            scene.registry.events.off('changedata-playerColor', this.colorChangeListener);
        });
        
        // --- BÓNG (SHADOW) ---
        this.shadow = scene.add.ellipse(x, y + 20, 60, 15, 0x000000, 0.6).setDepth(9);
        this.aura = scene.add.circle(x, y - 25, 42, initialColor, 0.28).setBlendMode('ADD').setDepth(9);
        
        // --- TRẠNG THÁI (STATE) ---
        this.playerState = 'idle';
        this.playerTween = null;
        if (!scene.keyW) scene.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        if (!scene.keyA) scene.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        if (!scene.keyD) scene.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    /**
     * Cập nhật logic nhân vật mỗi frame
     * @param {object} cursors - Đối tượng chứa thông tin phím bấm
     * @param {Phaser.Input.Keyboard.Key} spaceKey - Phím cách
     * @param {number} groundY - Vị trí Y của mặt đất tại vị trí X hiện tại để vẽ bóng
     */
    updateLogic(cursors, spaceKey, groundY) {
        let isGrounded = this.hitbox.body.touching.down;
        let speed = 350;
        let isMoving = false;

        // Lấy trạng thái phím ảo cảm ứng (Mobile Touch)
        let touch = this.scene.registry.get('touchControls');
        let isTouchLeft = (touch && touch.isLeft);
        let isTouchRight = (touch && touch.isRight);
        let isTouchJump = (touch && touch.isJump);

        // Xử lý di chuyển (Bàn phím + Nút cảm ứng ◄ ►)
        let isLeft = (cursors && cursors.left && cursors.left.isDown) || (this.scene.keyA && this.scene.keyA.isDown) || isTouchLeft;
        let isRight = (cursors && cursors.right && cursors.right.isDown) || (this.scene.keyD && this.scene.keyD.isDown) || isTouchRight;

        if (isLeft) {
            this.hitbox.body.setVelocityX(-speed);
            isMoving = true;
        } else if (isRight) {
            this.hitbox.body.setVelocityX(speed);
            isMoving = true;
        } else {
            this.hitbox.body.setVelocityX(0);
        }

        // Xử lý nhảy (W, Mũi tên Lên, Space, Nút cảm ứng ⬆)
        let isW = (this.scene.keyW && this.scene.keyW.isDown);
        let isUp = (cursors && cursors.up && cursors.up.isDown);
        let isSpace = (spaceKey && spaceKey.isDown);
        let isJumpPressed = isW || isUp || isSpace || isTouchJump;

        if (isJumpPressed && isGrounded) {
            this.hitbox.body.setVelocityY(-600);
        }

        // Đồng bộ vị trí Visual với Hitbox (Visual nằm trên tâm Hitbox 20px)
        this.x = this.hitbox.x;
        if (this.aura) this.aura.setPosition(this.x, this.y - 25);
        this.y = this.hitbox.y + 20;

        // Đồng bộ Bóng
        this.shadow.x = this.hitbox.x;
        this.shadow.y = groundY;
        let dist = groundY - (this.hitbox.y + 20);
        this.shadow.setAlpha(Phaser.Math.Clamp(0.5 - dist / 400, 0, 0.6));

        // Xử lý Animation
        let newState = 'idle';
        if (!isGrounded) newState = 'jump';
        else if (isMoving) newState = 'walk';

        if (newState !== this.playerState) {
            this.playerState = newState;
            if (this.playerTween) this.playerTween.stop();
            this.setAngle(0);
            this.setScale(this.baseScale);
            
            if (newState === 'idle') {
                this.playerTween = this.scene.tweens.add({
                    targets: this,
                    scaleY: this.baseScale * 0.95,
                    scaleX: this.baseScale * 1.05,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (newState === 'walk') {
                this.playerTween = this.scene.tweens.add({
                    targets: this,
                    angle: { from: -15, to: 15 },
                    scaleY: this.baseScale * 0.9,
                    duration: 200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (newState === 'jump') {
                this.playerTween = this.scene.tweens.add({
                    targets: this,
                    scaleY: this.baseScale * 1.2,
                    scaleX: this.baseScale * 0.8,
                    duration: 300,
                    yoyo: true,
                    repeat: 0,
                    ease: 'Quad.easeOut'
                });
            }
        }
    }
}