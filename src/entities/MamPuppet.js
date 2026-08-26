export default class MamPuppet extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.setDepth(10);

        // 1. Layer Áo choàng sau (Back Cloak)
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

        // 4. Đầu và Khuôn mặt (Head & Face)
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
        this.curBodyRot = 0;

        this.facingRight = true;
        this.wasGrounded = true;
        this.landSquash = 1.0;
    }

    setFlipX(flip) {
        this.facingRight = !flip;
        this.setScale(flip ? -1 : 1, 1);
    }

    updateAnimation(time, vx, vy, isGrounded, isPushingBox = false, inWallZone = false, wallSide = null) {
        let isMoving = Math.abs(vx) > 15;

        if (!isPushingBox) {
            if (vx > 15) this.facingRight = true;
            else if (vx < -15) this.facingRight = false;
        }

        this.setScale(this.facingRight ? 1 : -1, 1);

        // Hiệu ứng tiếp đất đàn hồi
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
        let targetBodyRot = 0;

        if (isPushingBox) {
            // ==========================================
            // 📦 ANIMATION ĐẨY HỘP GỖ NẶNG NỀ (PUSH BOX)
            // ==========================================
            let pushCycle = time * 0.010;

            // Thân người chúi nghiêng mạnh tì vào hộp
            targetBodyRot = this.facingRight ? 0.26 : -0.26;

            // Hai vạt áo vươn ra trước như 2 cánh tay tì đẩy hộp
            targetLeftCloakRot = -0.42;
            targetRightCloakRot = -0.36;
            targetBackCloakRot = 0.15;

            // Chân bước ghìm lực sải dài đạp gót mạnh
            let legPush = Math.sin(pushCycle);
            targetLegLeftRot = legPush * 0.85;
            targetLegRightRot = -legPush * 0.85;
            targetLegLeftY = this.baseLegLeftY - Math.max(0, legPush * 6.0);
            targetLegRightY = this.baseLegRightY - Math.max(0, -legPush * 6.0);

            // Đầu gồng mình chúi xuống, đọt mầm cụp trĩu về sau
            targetHeadY = this.baseHeadY + 3.5;
            targetSproutRot = -0.32;

        } else if (inWallZone && !isGrounded) {
            // ==========================================
            // 🧗 ANIMATION NHẢY & BÁM TƯỜNG LIÊN TỤC (WALL JUMP)
            // ==========================================
            let isKickingLeftWall = (wallSide === 'left' || vx > 50);
            let isKickingRightWall = (wallSide === 'right' || vx < -50);

            if (isKickingLeftWall) {
                // Đạp tường trái bật sang phải: Chân trái duỗi đạp tường, chân phải co vung sang
                targetLegLeftRot = 0.68;
                targetLegRightRot = -0.55;
                targetLegLeftY = this.baseLegLeftY;
                targetLegRightY = this.baseLegRightY - 7;

                targetLeftCloakRot = 0.35;
                targetRightCloakRot = -0.35;
                targetSproutRot = -0.25;
                targetBodyRot = 0.18;
                targetHeadY = this.baseHeadY - 2;

            } else if (isKickingRightWall) {
                // Đạp tường phải bật sang trái: Chân phải duỗi đạp tường, chân trái co vung sang
                targetLegRightRot = 0.68;
                targetLegLeftRot = -0.55;
                targetLegRightY = this.baseLegRightY;
                targetLegLeftY = this.baseLegLeftY - 7;

                targetLeftCloakRot = 0.35;
                targetRightCloakRot = -0.35;
                targetSproutRot = 0.25;
                targetBodyRot = -0.18;
                targetHeadY = this.baseHeadY - 2;

            } else {
                // Trượt dọc khe tường (Wall slide)
                targetLegLeftRot = -0.3;
                targetLegRightRot = -0.3;
                targetLeftCloakRot = 0.2;
                targetRightCloakRot = -0.2;
                targetBodyRot = 0;
            }

        } else if (!isGrounded) {
            // ==========================================
            // 🦘 TRẠNG THÁI NHẢY THƯỜNG (JUMP / FALL)
            // ==========================================
            if (vy < -100) {
                // Bật nhảy lên cao
                targetLegLeftRot = -0.45;
                targetLegRightRot = -0.35;
                targetLegLeftY = this.baseLegLeftY - 6;
                targetLegRightY = this.baseLegRightY - 5;

                targetLeftCloakRot = 0.16;
                targetRightCloakRot = -0.16;
                targetSproutRot = -0.22;
                targetHeadY = this.baseHeadY - 2;

            } else if (vy >= -100 && vy <= 100) {
                // Lơ lửng đỉnh nhảy
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
                // Rơi tự do
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
            // 🏃 TRẠNG THÁI CHẠY BỘ (BƯỚC ĐI TỰ NHIÊN - KHÔNG BỊ BẮT CHÉO CHỮ X)
            // ==========================================
            let runCycle = time * 0.015;

            // Chân trước (legRight) và Chân sau (legLeft) sải bước so le theo trục di chuyển
            let frontCycle = Math.sin(runCycle);
            let backCycle = Math.sin(runCycle + Math.PI);

            // Góc bước chân tự nhiên: Vung ra trước (+), đạp về sau (-)
            targetLegRightRot = frontCycle * 0.48;
            targetLegLeftRot = backCycle * 0.42;

            // Nhấc bàn chân lên khỏi đất khi bước tới
            targetLegRightY = this.baseLegRightY - Math.max(0, frontCycle * 4.5);
            targetLegLeftY = this.baseLegLeftY - Math.max(0, backCycle * 4.5);

            let cloakWave = Math.sin(runCycle - 0.5) * 0.09 + Math.sin(time * 0.006) * 0.03;
            targetLeftCloakRot = -0.10 + cloakWave;
            targetRightCloakRot = -0.06 - cloakWave * 0.8;
            targetBackCloakRot = Math.sin(runCycle - 0.3) * 0.06;

            let stepBounce = Math.abs(Math.sin(runCycle)) * 2.2;
            targetHeadY = this.baseHeadY + stepBounce;
            targetSproutRot = -0.15 + Math.sin(runCycle - 0.8) * 0.10;

        } else {
            // ==========================================
            // 🌿 TRẠNG THÁI ĐỨNG YÊN (IDLE)
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

        this.curLeftCloakRot = Phaser.Math.Linear(this.curLeftCloakRot, targetLeftCloakRot, 0.16);
        this.curRightCloakRot = Phaser.Math.Linear(this.curRightCloakRot, targetRightCloakRot, 0.16);
        this.curBackCloakRot = Phaser.Math.Linear(this.curBackCloakRot, targetBackCloakRot, 0.16);

        this.curHeadY = Phaser.Math.Linear(this.curHeadY, targetHeadY, lerpSpeed);
        this.curSproutRot = Phaser.Math.Linear(this.curSproutRot, targetSproutRot, 0.16);
        this.curBodyRot = Phaser.Math.Linear(this.curBodyRot, targetBodyRot, 0.18);

        // Áp dụng lên từng layer
        this.setRotation(this.curBodyRot);
        this.legLeft.setRotation(this.curLegLeftRot);
        this.legRight.setRotation(this.curLegRightRot);
        this.legLeft.y = this.curLegLeftY;
        this.legRight.y = this.curLegRightY;

        this.leftCloak.setRotation(this.curLeftCloakRot);
        this.rightCloak.setRotation(this.curRightCloakRot);
        this.backCloak.setRotation(this.curBackCloakRot);

        this.head.y = Math.round(this.curHeadY * this.landSquash);
        this.sprout.setRotation(this.curSproutRot);
        this.sprout.y = Math.round((this.curHeadY - 11.8) * this.landSquash);
    }
}
