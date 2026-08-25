import AssetManager from '../utils/AssetManager.js';

export const ITEM_DEFS = {
    seed: {
        key: 'item_seed',
        name: 'Hạt Giống Cổ Đại',
        icon: '🌱',
        draw: (g) => {
            g.fillStyle(0x27ae60, 1);
            g.fillEllipse(16, 16, 18, 26);
            g.fillStyle(0x2ecc71, 1);
            g.fillCircle(14, 12, 5);
        }
    },
    dewdrop: {
        key: 'item_dewdrop',
        name: 'Giọt Sương Mai',
        icon: '💧',
        draw: (g) => {
            g.fillStyle(0x3498db, 1);
            g.fillCircle(16, 18, 10);
            g.fillTriangle(16, 4, 7, 18, 25, 18);
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(13, 15, 3);
        }
    },
    sun_crystal: {
        key: 'item_sun_crystal',
        name: 'Tinh Thể Thái Dương',
        icon: '☀️',
        draw: (g) => {
            g.fillStyle(0xf1c40f, 1);
            g.beginPath();
            g.moveTo(16, 2);
            g.lineTo(28, 16);
            g.lineTo(16, 30);
            g.lineTo(4, 16);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(16, 16, 5);
        }
    },
    mushroom: {
        key: 'item_mushroom',
        name: 'Nấm Phát Quang',
        icon: '🍄',
        draw: (g) => {
            // Chân nấm
            g.fillStyle(0xecf0f1, 1);
            g.fillRect(12, 14, 8, 14);
            // Mũ nấm tím phát sáng
            g.fillStyle(0x9b59b6, 1);
            g.fillEllipse(16, 14, 26, 18);
            // Đốm sáng
            g.fillStyle(0xd980fa, 1);
            g.fillCircle(11, 10, 3);
            g.fillCircle(21, 12, 2.5);
            g.fillCircle(16, 6, 2);
        }
    },
    coin: {
        key: 'item_coin',
        name: 'Đồng Xu Vàng',
        icon: '🪙',
        draw: (g) => {
            g.fillStyle(0xf39c12, 1);
            g.fillCircle(16, 16, 14);
            g.lineStyle(2, 0xd68910, 1);
            g.strokeCircle(16, 16, 14);
            g.fillStyle(0xf1c40f, 1);
            g.fillCircle(16, 16, 10);
        }
    },
    potion: {
        key: 'item_potion',
        name: 'Bình Thuốc Sinh Mệnh',
        icon: '🧪',
        draw: (g) => {
            // Cổ lọ
            g.fillStyle(0xbdc3c7, 1);
            g.fillRect(13, 4, 6, 6);
            // Thân bình
            g.fillStyle(0xe74c3c, 1);
            g.fillCircle(16, 20, 10);
            g.fillStyle(0xff7675, 1);
            g.fillCircle(13, 17, 3);
        }
    }
};

export default class CollectibleItem extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, itemType = 'seed') {
        const def = ITEM_DEFS[itemType] || ITEM_DEFS.seed;
        
        // Sinh texture placeholder nếu chưa có
        AssetManager.generateAndSave(scene, def.key, 32, 32, def.draw);

        super(scene, x, y, def.key);
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static body

        this.itemType = itemType;
        this.def = def;
        this.isCollected = false;

        this.setOrigin(0.5, 0.5);
        this.setDepth(12);
        // Hào quang tỏa sáng của vật phẩm
        this.glowRing = scene.add.circle(x, y, 22, 0xffffff, 0.25).setBlendMode('ADD').setDepth(11);
        scene.tweens.add({
            targets: this.glowRing,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.45,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Hiệu ứng bay lơ lửng nhấp nhô nhẹ
        scene.tweens.add({
            targets: this,
            y: y - 8,
            duration: 1200 + Phaser.Math.Between(-200, 200),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Hiệu ứng phát sáng nhẹ
        scene.tweens.add({
            targets: this,
            scale: 1.15,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect(player) {
        if (this.isCollected) return;
        this.isCollected = true;

        // Vô hiệu hóa va chạm
        if (this.body) {
            this.body.enable = false;
        }

        // Cập nhật số lượng vào Registry Inventory
        let inv = this.scene.registry.get('inventory') || {};
        inv[this.itemType] = (inv[this.itemType] || 0) + 1;
        this.scene.registry.set('inventory', inv);

        // Phát sự kiện để UIScene hiển thị toast thông báo
        this.scene.registry.events.emit('item-collected', {
            type: this.itemType,
            name: this.def.name,
            icon: this.def.icon,
            total: inv[this.itemType]
        });

        // Hoạt ảnh bay lên và mờ dần (Pickup Animation)
        this.scene.tweens.add({
            targets: this,
            y: this.y - 45,
            alpha: 0,
            scale: 1.5,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                if (this.glowRing) this.glowRing.destroy();
        this.destroy();
            }
        });
    }
}
