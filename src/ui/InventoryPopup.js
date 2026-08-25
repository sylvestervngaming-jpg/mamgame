import { ITEM_DEFS } from '../entities/CollectibleItem.js';

export const OUTFIT_COLORS = [
    { name: 'Xanh Lá (Gốc)', color: 0x2ecc71, hex: '#2ecc71' },
    { name: 'Đỏ Lửa', color: 0xe74c3c, hex: '#e74c3c' },
    { name: 'Xanh Biển', color: 0x3498db, hex: '#3498db' },
    { name: 'Vàng Nắng', color: 0xf1c40f, hex: '#f1c40f' },
    { name: 'Tím Nấm', color: 0x9b59b6, hex: '#9b59b6' },
    { name: 'Trắng Tuyết', color: 0xecf0f1, hex: '#ecf0f1' },
    { name: 'Bóng Đêm', color: 0x34495e, hex: '#34495e' },
    { name: 'Hồng Sen', color: 0xff7979, hex: '#ff7979' }
];

export default class InventoryPopup {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentTab = 'bag'; // 'bag' | 'wardrobe'
        this.elements = [];
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.render();
    }

    close() {
        this.isOpen = false;
        this.destroyElements();
    }

    destroyElements() {
        this.elements.forEach(el => el.destroy());
        this.elements = [];
    }

    render() {
        this.destroyElements();

        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        const cx = w / 2;
        const cy = h / 2;

        // Overlay nền tối
        let overlay = this.scene.add.rectangle(cx, cy, w, h, 0x000000, 0.6)
            .setScrollFactor(0).setDepth(3000).setInteractive();
        overlay.on('pointerdown', () => this.close());
        this.elements.push(overlay);

        // Khung Modal chính
        let panelW = 680;
        let panelH = 440;
        let modalBg = this.scene.add.rectangle(cx, cy, panelW, panelH, 0x1e272e, 0.96)
            .setStrokeStyle(3, 0x00d2d3)
            .setScrollFactor(0).setDepth(3001).setInteractive();
        this.elements.push(modalBg);

        // Header Tiêu Đề
        let headerText = this.scene.add.text(cx, cy - panelH / 2 + 30, '🎒 TÚI ĐỒ & TỦ QUẦN ÁO', {
            font: 'bold 24px Arial',
            fill: '#00d2d3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3002);
        this.elements.push(headerText);

        // Nút Đóng [X]
        let closeBtn = this.scene.add.text(cx + panelW / 2 - 30, cy - panelH / 2 + 30, '✖', {
            font: 'bold 22px Arial',
            fill: '#ff6b6b'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3002).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setStyle({ fill: '#ff4757' }));
        closeBtn.on('pointerout', () => closeBtn.setStyle({ fill: '#ff6b6b' }));
        closeBtn.on('pointerdown', () => this.close());
        this.elements.push(closeBtn);

        // Tabs: [Túi Đồ] & [Tủ Quần Áo]
        let tabY = cy - panelH / 2 + 75;
        let tab1Bg = this.scene.add.rectangle(cx - 130, tabY, 200, 36, this.currentTab === 'bag' ? 0x00d2d3 : 0x2f3640)
            .setScrollFactor(0).setDepth(3002).setInteractive({ useHandCursor: true });
        let tab1Text = this.scene.add.text(cx - 130, tabY, '📦 Kho Vật Phẩm', {
            font: 'bold 16px Arial',
            fill: this.currentTab === 'bag' ? '#1e272e' : '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);

        let tab2Bg = this.scene.add.rectangle(cx + 130, tabY, 200, 36, this.currentTab === 'wardrobe' ? 0x00d2d3 : 0x2f3640)
            .setScrollFactor(0).setDepth(3002).setInteractive({ useHandCursor: true });
        let tab2Text = this.scene.add.text(cx + 130, tabY, '🎨 Tủ Đồ (Màu Sắc)', {
            font: 'bold 16px Arial',
            fill: this.currentTab === 'wardrobe' ? '#1e272e' : '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);

        tab1Bg.on('pointerdown', () => {
            if (this.currentTab !== 'bag') {
                this.currentTab = 'bag';
                this.render();
            }
        });

        tab2Bg.on('pointerdown', () => {
            if (this.currentTab !== 'wardrobe') {
                this.currentTab = 'wardrobe';
                this.render();
            }
        });

        this.elements.push(tab1Bg, tab1Text, tab2Bg, tab2Text);

        // Render Tab Content
        if (this.currentTab === 'bag') {
            this.renderBagTab(cx, cy);
        } else {
            this.renderWardrobeTab(cx, cy);
        }
    }

    renderBagTab(cx, cy) {
        const inv = this.scene.registry.get('inventory') || {};
        const itemKeys = Object.keys(ITEM_DEFS);

        let startX = cx - 200;
        let startY = cy - 25;
        let colW = 200;
        let rowH = 75;

        itemKeys.forEach((key, index) => {
            let col = index % 2;
            let row = Math.floor(index / 2);
            let itemX = startX + col * colW;
            let itemY = startY + row * rowH;

            let def = ITEM_DEFS[key];
            let count = inv[key] || 0;

            // Slot Background
            let slotBg = this.scene.add.rectangle(itemX, itemY, 185, 62, 0x2f3640, 0.9)
                .setStrokeStyle(2, count > 0 ? 0x48dbfb : 0x57606f)
                .setScrollFactor(0).setDepth(3002);

            // Item Icon Text
            let iconText = this.scene.add.text(itemX - 60, itemY, def.icon, {
                fontSize: '26px'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);

            // Item Name
            let nameText = this.scene.add.text(itemX - 32, itemY - 12, def.name, {
                font: 'bold 13px Arial',
                fill: count > 0 ? '#ffffff' : '#a4b0be'
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(3003);

            // Item Count
            let countText = this.scene.add.text(itemX + 70, itemY + 12, 'x' + count, {
                font: 'bold 15px Arial',
                fill: count > 0 ? '#f1c40f' : '#747d8c'
            }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(3003);

            this.elements.push(slotBg, iconText, nameText, countText);
        });

        // Hướng dẫn ở đáy modal
        let footerHint = this.scene.add.text(cx, cy + 185, '💡 Mẹo: Nhặt các vật phẩm phát sáng rải rác trên đường đi của mỗi map!', {
            font: 'italic 14px Arial',
            fill: '#7bed9f'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
        this.elements.push(footerHint);
    }

    renderWardrobeTab(cx, cy) {
        let currentColor = this.scene.registry.get('playerColor') || 0x2ecc71;

        // Khung Xem Trước Nhân Vật (Avatar Preview)
        let previewBox = this.scene.add.rectangle(cx - 180, cy + 50, 160, 200, 0x2f3640, 0.8)
            .setStrokeStyle(2, 0x57606f)
            .setScrollFactor(0).setDepth(3002);
        
        let previewTitle = this.scene.add.text(cx - 180, cy - 30, 'Xem trước:', {
            font: 'bold 14px Arial',
            fill: '#dfe4ea'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);

        // Hình tròn Mầm preview
        let previewCircle = this.scene.add.circle(cx - 180, cy + 30, 32, currentColor)
            .setStrokeStyle(3, 0xffffff)
            .setScrollFactor(0).setDepth(3003);

        // Hoạt ảnh nhún nhảy cho preview
        let previewTween = this.scene.tweens.add({
            targets: previewCircle,
            scaleY: 0.88,
            scaleX: 1.12,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Tên màu hiện tại
        let currentDef = OUTFIT_COLORS.find(c => c.color === currentColor) || OUTFIT_COLORS[0];
        let colorNameText = this.scene.add.text(cx - 180, cy + 90, currentDef.name, {
            font: 'bold 14px Arial',
            fill: currentDef.hex
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);

        this.elements.push(previewBox, previewTitle, previewCircle, colorNameText);

        // Bảng danh sách màu sắc (Swatches)
        let swStartCol = cx - 40;
        let swStartY = cy - 20;
        let swColW = 145;
        let swRowH = 50;

        OUTFIT_COLORS.forEach((outfit, index) => {
            let col = index % 2;
            let row = Math.floor(index / 2);
            let swX = swStartCol + col * swColW;
            let swY = swStartY + row * swRowH;

            let isSelected = (outfit.color === currentColor);

            // Nút chọn màu
            let swBg = this.scene.add.rectangle(swX, swY, 135, 42, 0x2f3640)
                .setStrokeStyle(2, isSelected ? 0x00d2d3 : 0x57606f)
                .setScrollFactor(0).setDepth(3002).setInteractive({ useHandCursor: true });

            let colorCircle = this.scene.add.circle(swX - 45, swY, 12, outfit.color)
                .setStrokeStyle(1, 0xffffff)
                .setScrollFactor(0).setDepth(3003);

            let swText = this.scene.add.text(swX - 25, swY, outfit.name, {
                font: isSelected ? 'bold 13px Arial' : '13px Arial',
                fill: isSelected ? '#00d2d3' : '#ffffff'
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(3003);

            swBg.on('pointerover', () => {
                if (!isSelected) swBg.setFillStyle(0x3d4956);
            });
            swBg.on('pointerout', () => {
                if (!isSelected) swBg.setFillStyle(0x2f3640);
            });
            swBg.on('pointerdown', () => {
                this.scene.registry.set('playerColor', outfit.color);
                previewCircle.setFillStyle(outfit.color);
                colorNameText.setText(outfit.name);
                colorNameText.setFill(outfit.hex);
                this.render(); // Re-render để cập nhật viền chọn
            });

            this.elements.push(swBg, colorCircle, swText);
        });

        let wardrobeHint = this.scene.add.text(cx, cy + 185, '✨ Click chọn màu yêu thích để thay trang phục cho Mầm tức thì!', {
            font: 'italic 14px Arial',
            fill: '#7bed9f'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
        this.elements.push(wardrobeHint);
    }
}
