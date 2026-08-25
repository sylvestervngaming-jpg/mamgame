export default class TouchControls extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.setScrollFactor(0);
        this.setDepth(2400);

        // Kích hoạt hỗ trợ cảm ứng đa điểm (Multi-touch)
        scene.input.addPointer(3);

        this.isLeft = false;
        this.isRight = false;
        this.isJump = false;

        const w = scene.cameras.main.width;
        const h = scene.cameras.main.height;

        // --- CỤM NÚT DI CHUYỂN BÊN TRÁI (◄ ►) ---
        let btnY = h - 90;
        let leftX = 90;
        let rightX = 215;
        let btnRadius = 45;

        this.btnLeft = this.createTouchButton(leftX, btnY, btnRadius, '◄', 0x2f3640, () => {
            this.isLeft = true;
        }, () => {
            this.isLeft = false;
        });

        this.btnRight = this.createTouchButton(rightX, btnY, btnRadius, '►', 0x2f3640, () => {
            this.isRight = true;
        }, () => {
            this.isRight = false;
        });

        // --- NÚT NHẢY BÊN PHẢI (⬆) ---
        let jumpX = w - 100;
        let jumpY = h - 95;
        let jumpRadius = 52;

        this.btnJump = this.createTouchButton(jumpX, jumpY, jumpRadius, '⬆', 0x00d2d3, () => {
            this.isJump = true;
        }, () => {
            this.isJump = false;
        }, 0x1e272e);

        this.add([this.btnLeft, this.btnRight, this.btnJump]);

        // Tự động ẩn nếu là máy tính không có cảm ứng
        const isTouchDevice = ('ontouchstart' in window) || 
                              (navigator.maxTouchPoints > 0) || 
                              scene.sys.game.device.input.touch;

        this.setVisible(isTouchDevice);
    }

    createTouchButton(x, y, radius, label, color, onDown, onUp, textColor = '#ffffff') {
        let container = this.scene.add.container(x, y);

        let circle = this.scene.add.circle(0, 0, radius, color, 0.75)
            .setStrokeStyle(3, 0xffffff, 0.85)
            .setInteractive({ useHandCursor: true });

        let text = this.scene.add.text(0, 0, label, {
            font: 'bold 28px Arial',
            fill: textColor
        }).setOrigin(0.5);

        container.add([circle, text]);

        circle.on('pointerdown', () => {
            circle.setFillStyle(0x48dbfb, 0.95);
            container.setScale(0.92);
            onDown();
        });

        circle.on('pointerup', () => {
            circle.setFillStyle(color, 0.75);
            container.setScale(1);
            onUp();
        });

        circle.on('pointerout', () => {
            circle.setFillStyle(color, 0.75);
            container.setScale(1);
            onUp();
        });

        return container;
    }
}
