const fs = require('fs');

// 1. Update main.js: Enable roundPixels globally
let mainCode = fs.readFileSync('src/main.js', 'utf8');
if (!mainCode.includes('roundPixels: true')) {
    mainCode = mainCode.replace(
        "height: 720,",
        "height: 720,\n    roundPixels: true,"
    );
    fs.writeFileSync('src/main.js', mainCode, 'utf8');
}

// 2. Update RunnerScene.js: Enable roundPixels on camera and round coordinates
let runnerCode = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');
if (!runnerCode.includes('this.cameras.main.setRoundPixels(true);')) {
    runnerCode = runnerCode.replace(
        "this.cameras.main.fadeIn(1000, 0, 0, 0);",
        "this.cameras.main.fadeIn(1000, 0, 0, 0);\n        this.cameras.main.setRoundPixels(true);"
    );
}

// Round playerPuppet position
runnerCode = runnerCode.replace(
    "this.playerPuppet.x = this.player.x;\n            this.playerPuppet.y = this.player.y + 40;",
    "this.playerPuppet.x = Math.round(this.player.x);\n            this.playerPuppet.y = Math.round(this.player.y + 40);"
);

fs.writeFileSync('src/scenes/RunnerScene.js', runnerCode, 'utf8');

// 3. Update MamPuppet.js: Round child pixel transforms for razor-sharp rendering
let puppetCode = fs.readFileSync('src/entities/MamPuppet.js', 'utf8');
puppetCode = puppetCode.replace("this.head.y = this.curHeadY * this.landSquash;", "this.head.y = Math.round(this.curHeadY * this.landSquash);");
puppetCode = puppetCode.replace("this.sprout.y = (this.curHeadY - 11.8) * this.landSquash;", "this.sprout.y = Math.round((this.curHeadY - 11.8) * this.landSquash);");
fs.writeFileSync('src/entities/MamPuppet.js', puppetCode, 'utf8');

console.log('Successfully enabled global roundPixels and integer pixel snapping for razor-sharp motion!');