const fs = require('fs');

// 1. Update RunnerScene.js: Raise box prompt and stump prompt
let runner = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Box prompt height
runner = runner.replace(/this\.boxPrompt\.y = this\.box\.y - 80;/g, "this.boxPrompt.y = this.box.y - 130;");

// Stump prompt height
runner = runner.replace("let prompt = this.add.text(x, h - 200,", "let prompt = this.add.text(x, h - 245,");

fs.writeFileSync('src/scenes/RunnerScene.js', runner, 'utf8');

// 2. Update NPC.js: Raise NPC prompt height
let npc = fs.readFileSync('src/entities/NPC.js', 'utf8');
npc = npc.replace("this.promptText = scene.add.text(x, y - 80,", "this.promptText = scene.add.text(x, y - 125,");
fs.writeFileSync('src/entities/NPC.js', npc, 'utf8');

console.log('Successfully raised all interactive prompt heights well above Mầm!');