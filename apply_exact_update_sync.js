const fs = require('fs');

let runner = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');
const lines = runner.split('\n');

let updateLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('update(') || lines[i].trim() === 'update() {') {
        updateLineIdx = i;
        break;
    }
}

console.log('Found update() in RunnerScene at line:', updateLineIdx + 1);

if (updateLineIdx !== -1) {
    // Find where the shadow update is
    let shadowIdx = -1;
    for (let j = updateLineIdx; j < updateLineIdx + 15; j++) {
        if (lines[j].includes('AtmosphereFX.updateDirectionalShadow')) {
            shadowIdx = j;
            break;
        }
    }

    console.log('Found shadowIdx at line:', shadowIdx + 1);

    if (shadowIdx !== -1) {
        const replacementLines = [
            "    update(time, delta) {",
            "        // Đồng bộ vị trí và hoạt ảnh cho MamPuppet (LUÔN CHẠY)",
            "        if (this.playerPuppet) {",
            "            this.playerPuppet.x = this.player.x;",
            "            this.playerPuppet.y = this.player.y + 40;",
            "            let isGroundedNow = this.player.body.touching.down || this.player.body.blocked.down || this.player.body.onFloor();",
            "            this.playerPuppet.updateAnimation(time, this.player.body.velocity.x, this.player.body.velocity.y, isGroundedNow);",
            "        }",
            "",
            "        // --- BÓNG ĐỔ NGHIÊNG & CHIẾU SÁNG REALTIME ---",
            "        let groundY = this.getTerrainY(this.player.x);",
            "        let slope = this.getTerrainSlope(this.player.x);"
        ];

        // Replace from updateLineIdx up to shadowIdx
        lines.splice(updateLineIdx, (shadowIdx - 2) - updateLineIdx, ...replacementLines);
    }
}

const updatedCode = lines.join('\n');
fs.writeFileSync('src/scenes/RunnerScene.js', updatedCode, 'utf8');
console.log('Successfully wrote exact line replacement into RunnerScene.js!');