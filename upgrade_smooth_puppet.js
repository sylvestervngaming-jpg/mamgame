const fs = require('fs');

const smoothPuppetCode = `export default class MamPuppet extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.setDepth(10);

        // 1. Layer Áo choàng sau (Back Cloak) - Lớp lót dưới cùng
        this.backCloak = scene.add.image(0, -41, 'mam_part_back_cloak').setOrigin(0.5, 0.5);
        this.baseBackCloakY = -41;
        
        // 2. Chân trái (Left Leg) - Pivot tại hông (0.5, 0)
        this.legLeft = scene.add.image(2.5, -32.5, 'mam_part_leg_left').setOrigin(0.5, 0);
        this.baseLegLeftY = -32.5;

        // 3. Chân phải (Right Leg) - Pivot tại hông (0.5, 0)
        this.legRight = scene.add.image(10.3, -31.7, 'mam_part_leg_right').setOrigin(0.5, 0);
        this.baseLegRightY = -31.7;

        // 4. Đầu và Khuôn mặt (Head & Face)
        this.head = scene.add.image(4.6, -82.0, 'mam_part_head_face').setOrigin(0.5, 0.5);
        this.baseHeadY = -82.0;

        // 5. Đọt mầm xoăn trên đầu (Sprout Antenna) - Pivot tại gốc cuống (0.5, 1)
        this.sprout = scene.add.image(9.6, -93.8, 'mam_part_sprout_top').setOrigin(0.5, 1);

        // 6. Áo choàng trước vạt trái (Left Cloak) - Pivot tại cổ (0.5, 0)
        this.leftCloak = scene.add.image(-8.5, -71.8, 'mam_part_left_cloak').setOrigin(0.5, 0);

        // 7. Áo choàng trước vạt phải (Right Cloak) - Pivot tại cổ (0.5, 0)
        this.rightCloak = scene.add.image(15.6, -69.7, 'mam_part_right_cloak').setOrigin(0.5, 0);

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
        this.curBackCloakScaleX = 1.0;
        
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

        // Hiệu ứng tiếp đất nhún nảy đàn hồi (Landing Impact Squash)
        if (!this.wasGrounded && isGrounded && vy >= 0) {
            this.landSquash = 0.72;
            this.scene.tweens.add({
                targets: this,
                landSquash: 1.0,
                duration: 220,
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
        let targetBackCloakScaleX = 1.0;

        let targetHeadY = this.baseHeadY;
        let targetSproutRot = 0;

        if (!isGrounded) {
            // ==========================================
            // 🦘 TRẠNG THÁI NHẢY & RƠI TỰ DO (JUMP / FALL)
            // ==========================================
            if (vy < -120) {
                // Giai đoạn 1: Bật nhảy lên cao (Takeoff Leap)
                // Hai chân co gập gối lên cao sát người
                targetLegLeftRot = -0.55;
                targetLegRightRot = -0.42;
                targetLegLeftY = this.baseLegLeftY - 8;
                targetLegRightY = this.baseLegRightY - 7;

                // Áo choàng ép theo luồng khí vọt lên
                targetLeftCloakRot = 0.28;
                targetRightCloakRot = -0.28;
                targetBackCloakScaleX = 0.92;

                // Đọt mầm cụp trĩu xuống theo quán tính
                targetSproutRot = -0.28;
                targetHeadY = this.baseHeadY - 3;

            } else if (vy >= -120 && vy <= 120) {
                // Giai đoạn 2: Lơ lửng tại đỉnh nhảy (Apex Float)
                // Chân duỗi nhẹ thư thái
                targetLegLeftRot = -0.15;
                targetLegRightRot = -0.10;
                targetLegLeftY = this.baseLegLeftY - 4;
                targetLegRightY = this.baseLegRightY - 3;

                // Áo choàng bay bồng bềnh êm ái
                let floatWave = Math.sin(time * 0.008) * 0.08;
                targetLeftCloakRot = 0.18 + floatWave;
                targetRightCloakRot = -0.18 - floatWave;
                targetBackCloakScaleX = 1.05;

                targetSproutRot = Math.sin(time * 0.006) * 0.12;
                targetHeadY = this.baseHeadY;

            } else {
                // Giai đoạn 3: Rơi tự do (Free Fall & Parachute Cloak)
                // Hai chân duỗi thẳng xuống chuẩn bị đón đất
                targetLegLeftRot = 0.15;
                targetLegRightRot = 0.18;
                targetLegLeftY = this.baseLegLeftY + 1;
                targetLegRightY = this.baseLegRightY + 1;

                // Áo choàng bung xòe rộng như chiếc dù cản gió
                let windFlutter = Math.sin(time * 0.018) * 0.06;
                targetLeftCloakRot = 0.32 + windFlutter;
                targetRightCloakRot = -0.32 - windFlutter;
                targetBackCloakRot = Math.sin(time * 0.015) * 0.05;
                targetBackCloakScaleX = 1.16;

                // Đọt mầm bay dựng đứng lên theo luồng gió từ dưới lùa lên
                targetSproutRot = 0.30 + Math.sin(time * 0.012) * 0.08;
                targetHeadY = this.baseHeadY + 1;
            }

        } else if (isMoving) {
            // ==========================================
            // 🏃 TRẠNG THÁI CHẠY BỘ (ORGANIC RUNNING PHYSICS)
            // ==========================================
            let runCycle = time * 0.015;

            // 1. Chân bước so le có khớp nâng gối và đạp đất tự nhiên
            let legSwing = Math.sin(runCycle);
            targetLegLeftRot = legSwing * 0.72;
            targetLegRightRot = -legSwing * 0.72;

            // Nhấc gối lên khi chân vung tới trước, tiếp đất khi đạp lui
            targetLegLeftY = this.baseLegLeftY - Math.max(0, legSwing * 6.5);
            targetLegRightY = this.baseLegRightY - Math.max(0, -legSwing * 6.5);

            // 2. Tà áo choàng bay phấp phới nhiều tầng sóng lụa (Secondary Motion with Phase Delay)
            let cloakWave1 = Math.sin(runCycle - 0.5) * 0.18 + Math.sin(time * 0.007) * 0.05;
            let cloakWave2 = Math.sin(runCycle - 0.8) * 0.15 + Math.sin(time * 0.009) * 0.04;
            let backWave = Math.sin(runCycle - 0.3) * 0.12;

            targetLeftCloakRot = -0.15 + cloakWave1;
            targetRightCloakRot = -0.10 - cloakWave2;
            targetBackCloakRot = backWave;
            targetBackCloakScaleX = 1.0 + Math.sin(runCycle * 2) * 0.05;

            // 3. Trọng tâm cơ thể và đầu nhấp nhô 2 nhịp bước chân
            let stepBounce = Math.abs(Math.sin(runCycle)) * 3.2;
            targetHeadY = this.baseHeadY + stepBounce;

            // 4. Đọt mầm uốn lượn như sợi roi mềm theo quán tính
            targetSproutRot = -0.22 + Math.sin(runCycle - 1.0) * 0.18;

        } else {
            // ==========================================
            // 🌿 TRẠNG THÁI ĐỨNG YÊN (IDLE - NHỊP THỞ SÂU & GIÓ THOẢNG)
            // ==========================================
            let breathCycle = time * 0.003;
            let breath = Math.sin(breathCycle);
            let wind = Math.sin(time * 0.0018);

            // Chân đứng vững bám đất
            targetLegLeftRot = 0;
            targetLegRightRot = 0;
            targetLegLeftY = this.baseLegLeftY;
            targetLegRightY = this.baseLegRightY;

            // Đầu nhấp nhô êm dịu theo nhịp thở lồng ngực
            targetHeadY = this.baseHeadY + breath * 2.0;

            // Đọt mầm xoăn đung đưa duyên dáng theo làn gió
            targetSproutRot = wind * 0.16 + breath * 0.05;

            // Tà áo choàng phập phồng nhẹ nhàng, mềm như lá non
            targetLeftCloakRot = breath * 0.04 + wind * 0.02;
            targetRightCloakRot = -breath * 0.04 - wind * 0.02;
            targetBackCloakRot = wind * 0.03;
            targetBackCloakScaleX = 1.0 + breath * 0.03;
        }

        // ==========================================
        // 🌊 LÀM MƯỢT CHUYỂN ĐỘNG (EXPONENTIAL LERP SMOOTHING)
        // ==========================================
        const lerpSpeed = 0.22;
        this.curLegLeftRot = Phaser.Math.Linear(this.curLegLeftRot, targetLegLeftRot, lerpSpeed);
        this.curLegRightRot = Phaser.Math.Linear(this.curLegRightRot, targetLegRightRot, lerpSpeed);
        this.curLegLeftY = Phaser.Math.Linear(this.curLegLeftY, targetLegLeftY, lerpSpeed);
        this.curLegRightY = Phaser.Math.Linear(this.curLegRightY, targetLegRightY, lerpSpeed);

        this.curLeftCloakRot = Phaser.Math.Linear(this.curLeftCloakRot, targetLeftCloakRot, 0.18);
        this.curRightCloakRot = Phaser.Math.Linear(this.curRightCloakRot, targetRightCloakRot, 0.18);
        this.curBackCloakRot = Phaser.Math.Linear(this.curBackCloakRot, targetBackCloakRot, 0.18);
        this.curBackCloakScaleX = Phaser.Math.Linear(this.curBackCloakScaleX, targetBackCloakScaleX, 0.18);

        this.curHeadY = Phaser.Math.Linear(this.curHeadY, targetHeadY, lerpSpeed);
        this.curSproutRot = Phaser.Math.Linear(this.curSproutRot, targetSproutRot, 0.18);

        // Áp dụng góc xoay và vị trí cho từng layer bộ phận
        this.legLeft.setRotation(this.curLegLeftRot);
        this.legRight.setRotation(this.curLegRightRot);
        this.legLeft.y = this.curLegLeftY;
        this.legRight.y = this.curLegRightY;

        this.leftCloak.setRotation(this.curLeftCloakRot);
        this.rightCloak.setRotation(this.curRightCloakRot);
        this.backCloak.setRotation(this.curBackCloakRot);
        this.backCloak.setScale(this.curBackCloakScaleX, 1.0);

        this.head.y = this.curHeadY * this.landSquash;
        this.sprout.setRotation(this.curSproutRot);
        this.sprout.y = (this.curHeadY - 11.8) * this.landSquash;
    }
}
`;

fs.writeFileSync('src/entities/MamPuppet.js', smoothPuppetCode, 'utf8');
console.log('Successfully upgraded MamPuppet with multi-harmonic flutter, realistic jump phases, and smooth lerping!');