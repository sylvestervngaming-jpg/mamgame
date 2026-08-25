import AssetManager from '../utils/AssetManager.js';
export default class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TransitionScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Nền đen hoàn toàn
        this.add.rectangle(0, 0, w*3, h, 0x000000).setOrigin(0,0);

        // Ánh sáng toàn cục (ambient)
        this.ambient = this.add.rectangle(0, 0, w*3, h, 0xffffff, 0).setOrigin(0,0);
        this.ambient.setBlendMode('ADD');

        let groundY = h - 110;
        let startY = groundY - 40;

        // Mặt đất đối chiếu để thấy nhân vật đang di chuyển
        this.add.rectangle(0, groundY, w*3, 2, 0xffffff, 0.3).setOrigin(0, 0);
        for (let i = 0; i < w*3; i+= 150) {
            this.add.rectangle(i, groundY, 20, 5, 0xffffff, 0.4).setOrigin(0, 0);
        }

        // Dòng chữ
        this.msg = this.add.text(w, startY - 150, 'Các vùng đất mới,\nnhững người bạn mới...', { font: 'italic 30px Arial', fill: '#ffffff', align: 'center' }).setOrigin(0.5).setAlpha(0);

        // Người chơi (hitbox)
        this.player = this.add.rectangle(200, startY, 40, 80, 0x000000, 0);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, w*3, h);

        // Tạo texture hình tròn xanh lá nếu chưa có (fix lỗi nhảy thẳng từ Menu)
        AssetManager.generateAndSave(this, 'green_circle', 50, 50, (g) => {
            g.fillStyle(0xffffff);
            g.fillCircle(25, 25, 25);
        });

        let initialColor = this.registry.get('playerColor') || 0x2ecc71;

        // Hình tròn nhân vật với màu sắc đã chọn
        this.playerSprite = this.add.sprite(200, startY, 'green_circle');
        this.playerSprite.setOrigin(0.5, 1);
        this.playerSprite.setTint(initialColor);
        
        // Vòng sáng đồng bộ màu nhân vật
        this.light = this.add.circle(200, startY, 100, initialColor, 0.25);
        this.light.setBlendMode('ADD');

        this.registry.events.on('changedata-playerColor', (parent, color) => {
            if (this.playerSprite) this.playerSprite.setTint(color);
            if (this.light) this.light.setFillStyle(color, 0.25);
        });

        // Hạt đom đóm trắng (White fireflies)
        AssetManager.generateAndSave(this, 'white_firefly', 8, 8, (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 4);
        });
        
        this.add.particles(0, 0, 'white_firefly', {
            x: { min: 0, max: w*3 },
            y: { min: 0, max: h },
            speed: { min: -20, max: 20 },
            scale: { start: 0, end: 1, yoyo: true },
            alpha: { start: 0, end: 0.8, yoyo: true },
            lifespan: 4000,
            frequency: 80,
            blendMode: 'ADD'
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.cameras.main.setBounds(0, 0, w*3, h);
        this.cameras.main.startFollow(this.player);

        this.hasTriggered = false;
        this.registry.set('showUI', true);
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
    }

    update() {
        this.playerSprite.x = this.player.x;
        this.playerSprite.y = this.player.y + 40;
        this.light.x = this.player.x;
        this.light.y = this.player.y;

        // Cập nhật vòng sáng dựa trên vị trí, cho phép lùi lại thì thu nhỏ
        let progress = this.player.x / (this.cameras.main.width * 2);
        this.light.setRadius(100 + progress * 800);
        this.light.setAlpha(0.2 + progress * 0.8);
        this.ambient.setAlpha(progress * 0.5); // Sáng bừng cả không gian

        // Hiện chữ
        if (this.player.x > this.cameras.main.width && this.msg.alpha === 0) {
            this.tweens.add({ targets: this.msg, alpha: 1, duration: 2000 });
        }

        // Chuyển scene
        if (this.player.x > this.cameras.main.width * 2 && !this.hasTriggered) {
            this.hasTriggered = true;
            this.cameras.main.fadeOut(2000, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Map2Scene');
            });
        }

        let touch = this.registry.get('touchControls');
        let isMovingRight = (this.cursors.right && this.cursors.right.isDown) || (this.dKey && this.dKey.isDown) || !!(touch && touch.isRight);
        let isMovingLeft = (this.cursors.left && this.cursors.left.isDown) || (this.aKey && this.aKey.isDown) || !!(touch && touch.isLeft);

        if (isMovingRight) {
            this.player.body.setVelocityX(300);
        } else if (isMovingLeft) {
            this.player.body.setVelocityX(-300);
        } else {
            this.player.body.setVelocityX(0);
        }
    }
}
