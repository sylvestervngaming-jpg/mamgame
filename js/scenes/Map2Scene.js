class Map2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Map2Scene' });
    }

    preload() {}

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const mapW = w * 4;

        // Bật UI để xài hệ thống Pause chung (Pause bằng nút ESC do UIScene quản lý)
        this.registry.set('showUI', true);
        this.registry.set('showSurvival', false); // Tắt thanh sinh tồn vì đây là map yên bình
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');

        this.physics.world.setBounds(0, 0, mapW, h);
        this.cameras.main.setBounds(0, 0, mapW, h);

        // --- BACKGROUND THUẦN CODE ---
        this.add.rectangle(0, 0, mapW, h, 0x87CEEB).setOrigin(0, 0);
        
        this.add.circle(w - 150, 150, 60, 0xFFDF00).setScrollFactor(0.1);
        
        for(let i=0; i<20; i++) {
            let cx = Phaser.Math.Between(0, mapW);
            let cy = Phaser.Math.Between(50, 250);
            let cloud = this.add.graphics();
            cloud.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.6, 0.9));
            cloud.fillCircle(cx, cy, Phaser.Math.Between(30, 60));
            cloud.fillCircle(cx + 40, cy + 10, Phaser.Math.Between(20, 40));
            cloud.fillCircle(cx - 40, cy + 10, Phaser.Math.Between(20, 40));
            this.tweens.add({
                targets: cloud,
                x: cx + Phaser.Math.Between(50, 150),
                duration: Phaser.Math.Between(10000, 20000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // --- CỐI XAY GIÓ (PARALLAX) ---
        this.windmills = [];
        let mgGraphics = this.add.graphics();
        mgGraphics.setScrollFactor(0.5);
        for(let i = 0; i < 5; i++) {
            let wx = 400 + i * 800 + Phaser.Math.Between(-100, 100);
            let wy = h - 150;
            
            // Thân cối xay gió (Kéo dài đế xuống tận h+500 để không lơ lửng)
            mgGraphics.fillStyle(0xffffff, 0.9);
            mgGraphics.fillPath();
            mgGraphics.beginPath();
            mgGraphics.moveTo(wx - 50, h + 500); 
            mgGraphics.lineTo(wx + 50, h + 500);
            mgGraphics.lineTo(wx + 20, wy - 150);
            mgGraphics.lineTo(wx - 20, wy - 150);
            mgGraphics.fillPath();
            
            // Mái vòm
            mgGraphics.fillStyle(0xcc5500, 1);
            mgGraphics.fillCircle(wx, wy - 150, 22);
            
            // Cánh quạt
            let blades = this.add.container(wx, wy - 150).setScrollFactor(0.5);
            for(let j=0; j<4; j++) {
                // Tâm quay nằm ở trục (0, 0), cánh quạt vươn ra (setOrigin 0.5, 1)
                let blade = this.add.rectangle(0, 0, 10, 100, 0xddcc99).setOrigin(0.5, 1);
                blade.rotation = (Math.PI / 2) * j;
                blades.add(blade);
            }
            // Trục quay nhỏ ở giữa
            let hub = this.add.circle(0, 0, 10, 0x8b4513);
            blades.add(hub);
            
            this.windmills.push({ container: blades, speed: Phaser.Math.FloatBetween(0.01, 0.03) });
        }

        // --- MẶT ĐẤT ---
        this.groundGroup = this.add.group();
        let groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x32cd32, 1);
        groundGraphics.beginPath();
        groundGraphics.moveTo(0, h + 500);
        
        // Trải các điểm địa hình mỗi 20px thay vì 100px để không bị kẹt
        for (let x = 0; x <= mapW; x += 20) {
            let ty = h - 100 + Math.sin(x / 300) * 40;
            if (x > mapW - 400) ty = h - 100;
            groundGraphics.lineTo(x, ty);
            
            if (x > 0) {
                let rect = this.add.rectangle(x - 10, ty, 20, (h + 500) - ty, 0x000000, 0).setOrigin(0.5, 0);
                this.physics.add.existing(rect, true);
                this.groundGroup.add(rect);
            }
        }
        groundGraphics.lineTo(mapW, h + 500);
        groundGraphics.fillPath();
        
        groundGraphics.lineStyle(6, 0x228b22, 1);
        groundGraphics.beginPath();
        groundGraphics.moveTo(0, h - 100);
        for (let x = 0; x <= mapW; x += 20) {
            let ty = h - 100 + Math.sin(x / 300) * 40;
            if (x > mapW - 400) ty = h - 100;
            groundGraphics.lineTo(x, ty);
        }
        groundGraphics.strokePath();

        // Hoa cỏ
        let flowerColors = [0xff0000, 0xffff00, 0xff00ff, 0xffa500, 0xffffff];
        for(let i=0; i<200; i++) {
            let fx = Phaser.Math.Between(50, mapW - 50);
            let fy = h - 100 + Math.sin(fx / 300) * 40;
            if (fx > mapW - 400) fy = h - 100;
            
            let stem = this.add.rectangle(fx, fy, 2, 15, 0x006400).setOrigin(0.5, 1);
            let fcolor = Phaser.Utils.Array.GetRandom(flowerColors);
            let petal = this.add.circle(fx, fy - 15, Phaser.Math.Between(4, 7), fcolor);
            
            this.tweens.add({
                targets: [stem, petal],
                x: fx + Phaser.Math.Between(-5, 5),
                duration: Phaser.Math.Between(1500, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Hạt bay
        if (!this.textures.exists('petal')) {
            let pG = this.make.graphics({x: 0, y: 0});
            pG.fillStyle(0xffc0cb, 1);
            pG.fillEllipse(4, 2, 4, 2);
            pG.generateTexture('petal', 8, 4);
        }
        this.add.particles(0, 0, 'petal', {
            x: { min: 0, max: mapW },
            y: { min: h - 300, max: h - 50 },
            lifespan: 6000,
            speedX: { min: 50, max: 150 },
            speedY: { min: -20, max: 20 },
            scale: { start: 1, end: 0.5 },
            alpha: { start: 1, end: 0 },
            rotate: { start: 0, end: 360 },
            frequency: 150,
            quantity: 2
        }).setDepth(8);

        // --- PLAYER ---
        this.player = this.add.rectangle(200, h - 250, 40, 40, 0x000000, 0).setOrigin(0.5, 0.5);
        this.physics.add.existing(this.player);
        this.player.body.setCircle(20);
        this.player.body.setGravityY(1200);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.groundGroup);

        if (!this.textures.exists('green_circle')) {
            let g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x00ff00);
            g.fillCircle(25, 25, 25);
            g.generateTexture('green_circle', 50, 50);
        }

        this.playerSprite = this.add.sprite(200, h - 250, 'green_circle').setDepth(10);
        this.playerSprite.setOrigin(0.5, 1);
        this.playerSprite.baseScale = 1;
        this.playerSprite.setScale(this.playerSprite.baseScale);

        this.shadow = this.add.ellipse(200, h - 110, 60, 15, 0x000000, 0.6).setDepth(9);

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1, -w/4, 100);
                this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.endZone = this.add.rectangle(mapW - 100, h/2, 200, h, 0x00ff00, 0).setOrigin(0.5, 0.5);
        this.physics.add.existing(this.endZone, true);
        this.hasReachedEnd = false;
        
        this.add.text(400, h - 250, 'Vương quốc cối xay gió - Cứ thong thả tận hưởng gió mát', { font: 'bold 24px Arial', fill: '#ffffff', backgroundColor: '#000000aa', padding: {x: 10, y: 5}}).setOrigin(0.5).setDepth(15);
        
        this.playerState = 'idle';
        this.playerTween = null;
    }

    update(time, delta) {
        this.windmills.forEach(wm => {
            wm.container.rotation += wm.speed;
        });

        if (this.hasReachedEnd) return;

        let isGrounded = this.player.body.touching.down;
        let speed = 350;
        let isMoving = false;

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
            isMoving = true;
        } else {
            this.player.body.setVelocityX(0);
        }

        let isSpacePressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.cursors.up.isDown;
        if (isSpacePressed && isGrounded) {
            this.player.body.setVelocityY(-600);
        }

        this.playerSprite.x = this.player.x;
        this.playerSprite.y = this.player.y + 20; // 20 vì hitbox cao 40 (tâm ở giữa là 20px)

        let groundY = this.cameras.main.height - 100 + Math.sin(this.player.x / 300) * 40;
        if (this.player.x > this.cameras.main.width * 4 - 400) groundY = this.cameras.main.height - 100;
        this.shadow.x = this.player.x;
        this.shadow.y = groundY;
        let dist = groundY - (this.player.y + 20);
        this.shadow.setAlpha(Phaser.Math.Clamp(0.5 - dist/400, 0, 0.6));

        // --- ANIMATION TƯƠNG TỰ SCENE 1 ---
        let newState = 'idle';
        if (!isGrounded) newState = 'jump';
        else if (isMoving) newState = 'walk';

        if (newState !== this.playerState) {
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
                    repeat: 0,
                    ease: 'Quad.easeOut'
                });
            }
        }

        if (this.player.x > this.cameras.main.width * 4 - 200 && !this.hasReachedEnd) {
            this.hasReachedEnd = true;
            this.player.body.setVelocityX(0);
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.time.delayedCall(1500, () => {
                this.scene.stop('UIScene');
                this.scene.start('Map3Scene');
            });
        }
    }
}
window.Map2Scene = Map2Scene;