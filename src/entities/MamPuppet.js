export default class MamPuppet extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.setDepth(10);

        // 1. Layer Áo choàng sau (Back Cloak) - Lớp lót dưới cùng
        this.backCloak = scene.add.image(-0.1, -40.7, 'mam_part_back_cloak')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(51.7, 61.9);
        this.baseBackCloakY = -40.7;
        
        // 2. Chân trái (Left Leg) - Pivot tại hông (0.5, 0)
        this.legLeft = scene.add.image(2.5, -32.5, 'mam_part_leg_left')
            .setOrigin(0.5, 0)
            .setDisplaySize(5.7, 32.5);
        this.baseLegLeftY = -32.5;

        // 3. Chân phải (Right Leg) - Pivot tại hông (0.5, 0)
        this.legRight = scene.add.image(10.3, -31.7, 'mam_part_leg_right')
            .setOrigin(0.5, 0)
            .setDisplaySize(5.7, 31.7);
        this.baseLegRightY = -31.7;

        // 4. Đầu và Khuôn mặt (Head & Face) - Sắc nét HD
        this.head = scene.add.image(4.6, -82.0, 'mam_part_head_face')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(23.4, 27.9);
        this.baseHeadY = -82.0;

        // 5. Đọt mầm xoăn trên đầu (Sprout Antenna) - Pivot tại gốc cuống (0.5, 1)
        this.sprout = scene.add.image(9.6, -93.8, 'mam_part_sprout_top')
            .setOrigin(0.5, 1)
            .setDisplaySize(12.6, 16.1);

        // 6. Áo choàng trước vạt trái (Left Cloak) - Pivot tại cổ (0.5, 0)
        this.leftCloak = scene.add.image(-8.5, -71.8, 'mam_part_left_cloak')
            .setOrigin(0.5, 0)
            .setDisplaySize(34.7, 59.4);

        // 7. Áo choàng trước vạt phải (Right Cloak) - Pivot tại cổ (0.5, 0)
        this.rightCloak = scene.add.image(15.6, -69.7, 'mam_part_right_cloak')
            .setOrigin(0.5, 0)
            .setDisplaySize(20.7, 58.2);

        this.add([
            this.backCloak,
            this.legLeft,
            this.legRight,
            this.head,
            this.sprout,
            this.leftCloak,
            this.rightCloak
        ]);

        scene.add.existing(this);

        // Trạng thái mượt mà (Smoothing Interpolation)
        this.curLegLeftRot = 0;
        this.curLegRightRot = 0;
        this.curLegLeftY = this.baseLegLeftY;
        this.curLegRightY = this.baseLegRightY;
        
        this.curLeftCloakRot = 0;
        this.curRightCloakRot = 0;
        this.curBackCloakRot = 0;
        
        this.curHeadY = this.baseHeadY;
        this.curSproutRot = 0;

        this.facingRight = true;
        this.wasGrounded = true;
        this.landSquash = 1.0;
    }

    setFlipX(flip) {
        this.facingRight = !flip;
        this.setScale(flip ? -1 : 1, 1);
    }

    updateAnimation(time, vx, vy, isGrounded) {
        let isMoving = Math.abs(vx) > 15;

        if (vx > 15) this.facingRight = true;
        else if (vx < -15) this.facingRight = false;

        this.setScale(this.facingRight ? 1 : -1, 1);

        // Hiệu ứng tiếp đất nhún nảy đàn hồi (Landing Impact)
        if (!this.wasGrounded && isGrounded && vy >= 0) {
            this.landSquash = 0.78;
            this.scene.tweens.add({
                targets: this,
                landSquash: 1.0,
                duration: 200,
                ease: 'Back.easeOut'
            });
        }
        this.wasGrounded = isGrounded;

        // Targets for smoothing
        let targetLegLeftRot = 0;
        let targetLegRightRot = 0;
        let targetLegLeftY = this.baseLegLeftY;
        let targetLegRightY = this.baseLegRightY;

        let targetLeftCloakRot = 0;
        let targetRightCloakRot = 0;
        let targetBackCloakRot = 0;

        let targetHeadY = this.baseHeadY;
        let targetSproutRot = 0;

        if (!isGrounded) {
            // ==========================================
            // 🦘 TRẠNG THÁI NHẢY & RƠI TỰ DO (JUMP / FALL)
            // ==========================================
            if (vy < -100) {
                // Bật nhảy lên cao: Hai chân gập co nhẹ, tà áo xuôi theo luồng gió
                targetLegLeftRot = -0.45;
                targetLegRightRot = -0.35;
                targetLegLeftY = this.baseLegLeftY - 6;
                targetLegRightY = this.baseLegRightY - 5;

                targetLeftCloakRot = 0.16;
                targetRightCloakRot = -0.16;

                targetSproutRot = -0.22;
                targetHeadY = this.baseHeadY - 2;

            } else if (vy >= -100 && vy <= 100) {
                // Lơ lửng tại đỉnh nhảy: Tà áo bay êm ái
                let floatWave = Math.sin(time * 0.007) * 0.05;
                targetLegLeftRot = -0.12;
                targetLegRightRot = -0.08;
                targetLegLeftY = this.baseLegLeftY - 3;
                targetLegRightY = this.baseLegRightY - 2;

                targetLeftCloakRot = 0.12 + floatWave;
                targetRightCloakRot = -0.12 - floatWave;
                targetSproutRot = Math.sin(time * 0.005) * 0.08;
                targetHeadY = this.baseHeadY;

            } else {
                // Rơi tự do: Áo choàng xòe nhẹ đón gió, chân duỗi thẳng
                targetLegLeftRot = 0.12;
                targetLegRightRot = 0.15;
                targetLegLeftY = this.baseLegLeftY;
                targetLegRightY = this.baseLegRightY;

                let windFlutter = Math.sin(time * 0.015) * 0.04;
                targetLeftCloakRot = 0.22 + windFlutter;
                targetRightCloakRot = -0.22 - windFlutter;
                targetBackCloakRot = Math.sin(time * 0.012) * 0.04;

                targetSproutRot = 0.22 + Math.sin(time * 0.01) * 0.05;
                targetHeadY = this.baseHeadY + 1;
            }

        } else if (isMoving) {
            // ==========================================
            // 🏃 TRẠNG THÁI CHẠY BỘ (TÀ ÁO BAY ÊM ÁI TỰ NHIÊN)
            // ==========================================
            let runCycle = time * 0.014;

            // 1. Hai chân bước sải so le có nhấc gối
            let legSwing = Math.sin(runCycle);
            targetLegLeftRot = legSwing * 0.60;
            targetLegRightRot = -legSwing * 0.60;

            targetLegLeftY = this.baseLegLeftY - Math.max(0, legSwing * 5.0);
            targetLegRightY = this.baseLegRightY - Math.max(0, -legSwing * 5.0);

            // 2. Vạt áo choàng hé mở tự nhiên và bay lượn êm ái ra phía sau
            // Vạt áo mở nhẹ để lộ chân bước, bay mềm mại theo luồng gió
            let cloakWave = Math.sin(runCycle - 0.5) * 0.09 + Math.sin(time * 0.006) * 0.03;
            targetLeftCloakRot = -0.10 + cloakWave;
            targetRightCloakRot = -0.06 - cloakWave * 0.8;
            targetBackCloakRot = Math.sin(runCycle - 0.3) * 0.06;

            // 3. Trọng tâm cơ thể và đầu nhấp nhô theo bước chạy
            let stepBounce = Math.abs(Math.sin(runCycle)) * 2.2;
            targetHeadY = this.baseHeadY + stepBounce;

            // 4. Đọt mầm xoăn đung đưa mềm mại
            targetSproutRot = -0.15 + Math.sin(runCycle - 0.8) * 0.10;

        } else {
            // ==========================================
            // 🌿 TRẠNG THÁI ĐỨNG YÊN (IDLE - THỞ NHẸ DỊU)
            // ==========================================
            let breath = Math.sin(time * 0.003);
            let wind = Math.sin(time * 0.0016);

            targetLegLeftRot = 0;
            targetLegRightRot = 0;
            targetLegLeftY = this.baseLegLeftY;
            targetLegRightY = this.baseLegRightY;

            targetHeadY = this.baseHeadY + breath * 1.5;
            targetSproutRot = wind * 0.12 + breath * 0.04;

            targetLeftCloakRot = breath * 0.025 + wind * 0.015;
            targetRightCloakRot = -breath * 0.025 - wind * 0.015;
            targetBackCloakRot = wind * 0.02;
        }

        // ==========================================
        // 🌊 LÀM MƯỢT LERP 60 FPS
        // ==========================================
        const lerpSpeed = 0.20;
        this.curLegLeftRot = Phaser.Math.Linear(this.curLegLeftRot, targetLegLeftRot, lerpSpeed);
        this.curLegRightRot = Phaser.Math.Linear(this.curLegRightRot, targetLegRightRot, lerpSpeed);
        this.curLegLeftY = Phaser.Math.Linear(this.curLegLeftY, targetLegLeftY, lerpSpeed);
        this.curLegRightY = Phaser.Math.Linear(this.curLegRightY, targetLegRightY, lerpSpeed);

        this.curLeftCloakRot = Phaser.Math.Linear(this.curLeftCloakRot, targetLeftCloakRot, 0.15);
        this.curRightCloakRot = Phaser.Math.Linear(this.curRightCloakRot, targetRightCloakRot, 0.15);
        this.curBackCloakRot = Phaser.Math.Linear(this.curBackCloakRot, targetBackCloakRot, 0.15);

        this.curHeadY = Phaser.Math.Linear(this.curHeadY, targetHeadY, lerpSpeed);
        this.curSproutRot = Phaser.Math.Linear(this.curSproutRot, targetSproutRot, 0.15);

        // Áp dụng lên từng layer
        this.legLeft.setRotation(this.curLegLeftRot);
        this.legRight.setRotation(this.curLegRightRot);
        this.legLeft.y = this.curLegLeftY;
        this.legRight.y = this.curLegRightY;

        this.leftCloak.setRotation(this.curLeftCloakRot);
        this.rightCloak.setRotation(this.curRightCloakRot);
        this.backCloak.setRotation(this.curBackCloakRot);

        this.head.y = this.curHeadY * this.landSquash;
        this.sprout.setRotation(this.curSproutRot);
        this.sprout.y = (this.curHeadY - 11.8) * this.landSquash;
    }
}
