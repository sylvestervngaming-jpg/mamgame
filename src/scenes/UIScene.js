import AtmosphereFX from '../utils/AtmosphereFX.js';
import TouchControls from '../ui/TouchControls.js';
import InventoryPopup from '../ui/InventoryPopup.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false });
    }

    create() {
        if (!this.registry.get('showUI')) {
            this.scene.sleep();
        }

        this.registry.events.on('changedata-showUI', (parent, value) => {
            if (value) {
                this.scene.wake();
            } else {
                this.scene.sleep();
            }
        });

        const h = this.cameras.main.height;
        const w = this.cameras.main.width;

        // Khởi tạo Popup Túi Đồ & Tủ Quần Áo
        this.inventoryPopup = new InventoryPopup(this);

        // Khởi tạo cụm Phím Ảo Cảm Ứng cho Mobile
        this.touchControls = new TouchControls(this);
        this.registry.set('touchControls', this.touchControls);

                // --- NÚT TOÀN MÀN HÌNH (FULLSCREEN) TRÊN GÓC HUD ---
        this.fsBtnBg = this.add.rectangle(w - 95, 65, 44, 40, 0x1e272e, 0.85)
            .setStrokeStyle(2, 0x00d2d3)
            .setScrollFactor(0).setDepth(2500)
            .setInteractive({ useHandCursor: true });

        this.fsBtnText = this.add.text(w - 95, 65, '⛶', {
            font: 'bold 20px Arial',
            fill: '#00d2d3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);

        this.fsBtnBg.on('pointerover', () => {
            this.fsBtnBg.setFillStyle(0x00d2d3);
            this.fsBtnText.setFill('#1e272e');
        });
        this.fsBtnBg.on('pointerout', () => {
            this.fsBtnBg.setFillStyle(0x1e272e);
            this.fsBtnText.setFill('#00d2d3');
        });
        this.fsBtnBg.on('pointerdown', () => {
            this.toggleFullscreen();
        });

        // --- NÚT TẠM DỪNG (PAUSE) CẢM ỨNG TRÊN GÓC HUD ---
        this.pauseBtnBg = this.add.rectangle(w - 45, 65, 44, 40, 0x1e272e, 0.85)
            .setStrokeStyle(2, 0x00d2d3)
            .setScrollFactor(0).setDepth(2500)
            .setInteractive({ useHandCursor: true });

        this.pauseBtnText = this.add.text(w - 45, 65, '⏸', {
            font: 'bold 18px Arial',
            fill: '#00d2d3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);

        this.pauseBtnBg.on('pointerover', () => {
            this.pauseBtnBg.setFillStyle(0x00d2d3);
            this.pauseBtnText.setFill('#1e272e');
        });
        this.pauseBtnBg.on('pointerout', () => {
            this.pauseBtnBg.setFillStyle(0x1e272e);
            this.pauseBtnText.setFill('#00d2d3');
        });
        this.pauseBtnBg.on('pointerdown', () => {
            this.triggerPause();
        });

        // --- NÚT BALO / TÚI ĐỒ TRÊN HUD ---
        this.bagBtnBg = this.add.rectangle(85, 65, 120, 40, 0x1e272e, 0.85)
            .setStrokeStyle(2, 0x00d2d3)
            .setScrollFactor(0).setDepth(2500)
            .setInteractive({ useHandCursor: true });

        let isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        let bagLabel = isMobile ? '🎒 Túi Đồ' : '🎒 Túi Đồ [B]';
        this.bagBtnText = this.add.text(85, 65, bagLabel, {
            font: 'bold 14px Arial',
            fill: '#00d2d3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);

        this.bagBtnBg.on('pointerover', () => {
            this.bagBtnBg.setFillStyle(0x00d2d3);
            this.bagBtnText.setFill('#1e272e');
        });
        this.bagBtnBg.on('pointerout', () => {
            this.bagBtnBg.setFillStyle(0x1e272e);
            this.bagBtnText.setFill('#00d2d3');
        });
        this.bagBtnBg.on('pointerdown', () => {
            this.inventoryPopup.toggle();
        });

        // Lắng nghe phím B và I để mở/đóng túi đồ
        this.input.keyboard.on('keydown-B', () => {
            if (this.registry.get('showUI')) {
                this.inventoryPopup.toggle();
            }
        });
        this.input.keyboard.on('keydown-I', () => {
            if (this.registry.get('showUI')) {
                this.inventoryPopup.toggle();
            }
        });

        // --- HỆ THỐNG TOAST THÔNG BÁO NHẶT VẬT PHẨM ---
        this.toastContainer = this.add.container(0, 0).setDepth(2600).setScrollFactor(0);
        AtmosphereFX.createCinematicVignette(this);
        this.registry.events.on('item-collected', (item) => {
            this.showPickupToast(item);
        });

        // --- GIAO DIỆN CHỈ SỐ SINH TỒN ---
        this.uiContainer = this.add.container(0, 0);
        this.survivalContainer = this.add.container(0, 0);
        this.gauges = {};
        
        let baseY = 80;
        this.createDSTGauge(w - 230, baseY, 'health', 0xff0000, '❤️');
        this.createDSTGauge(w - 175, baseY, 'psyche', 0xaa00aa, '🧠');
        this.createDSTGauge(w - 120, baseY, 'water', 0x0088ff, '💧');
        this.createDSTGauge(w - 65, baseY, 'sun', 0xffaa00, '☀️');

        this.uiContainer.setVisible(false);
        this.survivalContainer.setVisible(false);

        // Lắng nghe thay đổi dữ liệu
        this.events.on('shutdown', () => {
            this.registry.events.off('changedata-showUI');
            this.registry.events.off('changedata', this.updateData, this);
        });
        this.registry.events.on('changedata', this.updateData, this);
        this.updateData(this.registry, 'showUI', this.registry.get('showUI'));
        this.updateData(this.registry, 'showSurvival', this.registry.get('showSurvival'));

        // Survival Tick (Mỗi giây)
        this.time.addEvent({
            delay: 1000,
            callback: this.survivalTick,
            callbackScope: this,
            loop: true
        });

        // Lắng nghe phím ESC để Tạm dừng (Pause) hoặc đóng Túi Đồ
        this.input.keyboard.on('keydown-ESC', () => {
            this.triggerPause();
        });
    }

            toggleFullscreen() {
        try {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        } catch (e) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }
    }

    triggerPause() {
        if (!this.registry.get('showUI')) return;

        // Nếu đang mở túi đồ thì đóng túi đồ
        if (this.inventoryPopup && this.inventoryPopup.isOpen) {
            this.inventoryPopup.close();
            return;
        }

        if (this.scene.isActive('PauseScene')) return;
        
        let activeScene = this.scene.manager.getScenes(true).find(s => 
            s.scene.key !== 'UIScene' && 
            s.scene.key !== 'PauseScene' && 
            s.scene.key !== 'MenuScene' &&
            s.scene.key !== 'MapSelectionScene'
        );
        
        if (activeScene) {
            this.scene.pause(activeScene.scene.key);
            this.scene.launch('PauseScene', { scene: activeScene.scene.key });
            this.scene.bringToTop('PauseScene');
        }
    }

    showPickupToast(item) {
        const w = this.cameras.main.width;
        let toastY = 80;

        let toastBg = this.add.rectangle(w / 2, toastY, 280, 36, 0x1e272e, 0.9)
            .setStrokeStyle(2, 0x00d2d3)
            .setScrollFactor(0).setDepth(2601);

        let toastText = this.add.text(w / 2, toastY, '+1 ' + item.icon + ' ' + item.name, {
            font: 'bold 14px Arial',
            fill: '#00d2d3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2602);

        this.tweens.add({
            targets: [toastBg, toastText],
            y: toastY + 15,
            duration: 250,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1200, () => {
                    this.tweens.add({
                        targets: [toastBg, toastText],
                        alpha: 0,
                        y: toastY - 20,
                        duration: 350,
                        onComplete: () => {
                            toastBg.destroy();
                            toastText.destroy();
                        }
                    });
                });
            }
        });
    }

    createDSTGauge(x, y, key, color, emoji) {
        let bg = this.add.circle(x, y, 22, 0x222222).setStrokeStyle(2, 0xdddddd);
        
        let shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.fillCircle(x, y, 22);
        let mask = shape.createGeometryMask();

        let fill = this.add.rectangle(x, y + 22, 44, 44, color).setOrigin(0.5, 1);
        fill.setMask(mask);

        let icon = this.add.text(x, y, emoji, { fontSize: '18px' }).setOrigin(0.5);
        let text = this.add.text(x, y + 32, '100%', { font: 'bold 12px Arial', fill: '#ffffff' }).setOrigin(0.5).setShadow(1,1,'#000',2);

        this.survivalContainer.add([bg, fill, icon, text]);
        this.gauges[key] = { fill: fill, text: text };
    }

    updateData(parent, key, data) {
        if (key === 'showUI') {
            let isVisible = !!data;
            this.uiContainer.setVisible(isVisible);
            if (this.bagBtnBg) this.bagBtnBg.setVisible(isVisible);
            if (this.bagBtnText) this.bagBtnText.setVisible(isVisible);
            if (this.pauseBtnBg) this.pauseBtnBg.setVisible(isVisible);
            if (this.pauseBtnText) this.pauseBtnText.setVisible(isVisible);
            if (this.fsBtnBg) this.fsBtnBg.setVisible(isVisible);
            if (this.fsBtnText) this.fsBtnText.setVisible(isVisible);
            if (this.touchControls) {
                let isTouch = this.sys.game.device.os.android || this.sys.game.device.os.iOS || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                this.touchControls.setVisible(isVisible && isTouch);
            }
            if (!isVisible && this.inventoryPopup && this.inventoryPopup.isOpen) {
                this.inventoryPopup.close();
            }
        }
        if (key === 'showSurvival') {
            this.survivalContainer.setVisible(!!data);
        }
        if (['health', 'psyche', 'water', 'sun'].includes(key)) {
            let val = Math.max(0, Math.min(100, data));
            if (this.gauges[key]) {
                this.gauges[key].fill.height = (val / 100) * 44;
                this.gauges[key].text.setText(Math.round(val) + '%');
            }
        }
    }

    survivalTick() {
        if (!this.registry.get('showUI') || !this.registry.get('showSurvival')) return;

        let water = this.registry.get('water');
        let sun = this.registry.get('sun');
        let psyche = this.registry.get('psyche');
        let health = this.registry.get('health');

        let alarms = 0;
        if (water < 20 || water > 85) alarms++;
        if (sun < 20 || sun > 85) alarms++;
        if (psyche < 20) alarms++;

        let damage = 0;
        if (alarms === 1) damage = 5;
        else if (alarms === 2) damage = 15;
        else if (alarms === 3) damage = 25;

        if (damage > 0) {
            health -= damage;
            this.registry.set('health', health);
            
            this.tweens.add({
                targets: this.gauges['health'].fill,
                alpha: 0.2,
                yoyo: true,
                duration: 150
            });

            if (health <= 0) {
                this.registry.set('showUI', false);
                let activeScene = this.scene.manager.getScenes(true).find(s => s.scene.key !== 'UIScene');
                if (activeScene) {
                    activeScene.scene.start('GameOverScene', { reason: 'Mầm đã chết do mất cân bằng sinh tồn.', retryScene: activeScene.scene.key });
                }
            }
        }
    }
}
