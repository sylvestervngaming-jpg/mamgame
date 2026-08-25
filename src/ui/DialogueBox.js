export default class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.elements = [];
        this.active = false;
    }

    show(options) {
        this.hide();
        this.active = true;

        const cam = this.scene.cameras.main;
        const cx = cam.worldView.centerX;
        const cy = cam.worldView.centerY;

        // Dark overlay backdrop
        let overlay = this.scene.add.rectangle(cx, cy, cam.worldView.width, cam.worldView.height, 0x000000, 0.4)
            .setDepth(999);
        this.elements.push(overlay);

        // Dialogue window panel
        let bg = this.scene.add.rectangle(cx, cy, 620, 340, 0x1a252f, 0.95)
            .setStrokeStyle(3, 0x0984e3)
            .setDepth(1000);
        this.elements.push(bg);

        // Title
        let title = this.scene.add.text(cx, cy - 110, 'Người bí ẩn:', { 
            font: 'bold 24px Arial', 
            fill: '#ffffff' 
        }).setOrigin(0.5).setDepth(1001);
        this.elements.push(title);

        options.forEach((opt, index) => {
            let by = cy - 40 + (index * 55);

            let btnBg = this.scene.add.rectangle(cx, by, 460, 42, 0x2c3e50)
                .setStrokeStyle(2, 0x34495e)
                .setDepth(1001)
                .setInteractive({ useHandCursor: true });

            let btnText = this.scene.add.text(cx, by, opt.text, { 
                font: 'bold 18px Arial', 
                fill: '#ecf0f1' 
            }).setOrigin(0.5).setDepth(1002);

            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0x3498db);
                btnBg.setStrokeStyle(2, 0x2980b9);
                btnText.setFill('#ffffff');
            });
            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x2c3e50);
                btnBg.setStrokeStyle(2, 0x34495e);
                btnText.setFill('#ecf0f1');
            });
            btnBg.on('pointerdown', () => {
                this.hide();
                if (opt.callback) opt.callback();
            });

            this.elements.push(btnBg, btnText);
        });
    }

    hide() {
        this.active = false;
        this.elements.forEach(el => el.destroy());
        this.elements = [];
    }
}
