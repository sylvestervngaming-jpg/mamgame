class SurvivalScene extends Phaser.Scene {
    constructor() { super('SurvivalScene'); }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.cameras.main.setBackgroundColor('#ffbb77'); // Nền trời nắng gắt
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

        this.add.text(w/2, 50, 'Cảnh 17: Chạy trốn khỏi mặt trời! Nấp vào các mái đình (bóng râm).', { fontSize: '24px', fill: '#000', backgroundColor: '#fff' }).setOrigin(0.5).setScrollFactor(0);

        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Bật UI Global lên
        this.registry.set('showUI', true);
    }

    createPagoda(x, y) {
        // Vẽ đình/nhà lá (Pagoda) - Scene 17
        this.add.rectangle(x, y - 60, 20, 120, 0x332211); // Cột 1
        this.add.rectangle(x + 160, y - 60, 20, 120, 0x332211); // Cột 2
        this.add.triangle(x + 80, y - 120, 0, 60, 80, 0, 160, 60, 0xaa2222).setScale(1.5); // Mái ngói

        // Hitbox bóng râm
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

        // Cập nhật giá trị Global thay vì local
        let sun = this.registry.get('sun');
        let water = this.registry.get('water');

        if (inShade) {
            sun = Math.max(0, sun - 0.05); // Giảm rất chậm khi trong bóng râm
            this.player.setFillStyle(0x66ff66); // Xanh trở lại
        } else {
            sun = Math.min(100, sun + 0.1); // Nắng tăng lên từ từ
            water = Math.max(0, water - 0.02); // Nước bốc hơi
            this.player.setFillStyle(0xff8866); // Đỏ lên vì nóng
        }

        this.registry.set('sun', sun);
        this.registry.set('water', water);

        // Điều kiện thắng (Chạy đến cuối màn hình)
        if (this.player.x > this.physics.world.bounds.width - 100) {
            this.registry.set('showUI', false);
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('TextTransitionScene', { 
                    text: 'Cảnh 18 & 20\nBạn chọn rời đi?\n...\nHay ở lại?', 
                    nextScene: 'DialogueScene', 
                    nextData: { nextScene: 'EndingScene' } 
                });
            });
        }
    }
}
