export default class HeatIndicator extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.setScrollFactor(0);
        this.setDepth(2000);

        const cx = scene.cameras.main.width / 2;
        const cy = 45;

        // Background khung chứa
        this.bg = scene.add.rectangle(cx, cy, 260, 48, 0x1a1a1a, 0.85)
            .setStrokeStyle(3, 0xf1c40f);

        // Thanh tiến trình nhiệt
        this.barBg = scene.add.rectangle(cx, cy + 8, 220, 10, 0x333333);
        this.barFill = scene.add.rectangle(cx - 110, cy + 8, 220, 10, 0xf1c40f).setOrigin(0, 0.5);

        // Text trạng thái
        this.statusText = scene.add.text(cx, cy - 8, '☀️ AN TOÀN: 5.0s', {
            font: 'bold 15px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add([this.bg, this.barBg, this.barFill, this.statusText]);
    }

    updateHeat(timeLeft, maxTime, isUnderShade) {
        let pct = Phaser.Math.Clamp(timeLeft / maxTime, 0, 1);
        this.barFill.width = 220 * pct;

        if (isUnderShade) {
            this.bg.setStrokeStyle(3, 0x2ecc71);
            this.barFill.setFillStyle(0x2ecc71);
            this.statusText.setText('🌴 BÓNG RÂM (AN TOÀN)');
            this.statusText.setFill('#2ecc71');
        } else {
            let secStr = timeLeft.toFixed(1) + 's';
            if (timeLeft > 3.0) {
                this.bg.setStrokeStyle(3, 0xf1c40f);
                this.barFill.setFillStyle(0xf1c40f);
                this.statusText.setText('☀️ NẮNG GẮT: ' + secStr);
                this.statusText.setFill('#f1c40f');
            } else if (timeLeft > 1.5) {
                this.bg.setStrokeStyle(3, 0xe67e22);
                this.barFill.setFillStyle(0xe67e22);
                this.statusText.setText('🔥 QUÁ NHIỆT: ' + secStr);
                this.statusText.setFill('#e67e22');
            } else {
                this.bg.setStrokeStyle(3, 0xe74c3c);
                this.barFill.setFillStyle(0xe74c3c);
                this.statusText.setText('⚠️ SẮP CHÁY: ' + secStr);
                this.statusText.setFill('#ff4d4d');
            }
        }
    }
}
