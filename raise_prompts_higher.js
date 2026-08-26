const fs = require('fs');

let runner = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Box prompt: Raise to this.box.y - 180
runner = runner.replace(/this\.boxPrompt\.y = this\.box\.y - \d+;/g, "this.boxPrompt.y = this.box.y - 180;");

// Stump prompt: Raise to h - 300
runner = runner.replace("let prompt = this.add.text(x, h - 245,", "let prompt = this.add.text(x, h - 300,");

fs.writeFileSync('src/scenes/RunnerScene.js', runner, 'utf8');

// NPC prompt: Raise to y - 170
let npc = fs.readFileSync('src/entities/NPC.js', 'utf8');
npc = npc.replace(/this\.promptText = scene\.add\.text\(x, y - \d+,/g, "this.promptText = scene.add.text(x, y - 170,");
fs.writeFileSync('src/entities/NPC.js', npc, 'utf8');

console.log('Successfully raised all prompt heights to comfortable overhead levels!');