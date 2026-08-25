class DialogueScene extends Phaser.Scene {
    constructor() { super('DialogueScene'); }
    init(data) { this.nextScene = data.nextScene || 'SurvivalScene'; }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.registry.set('showUI', true);

        this.ground = this.add.rectangle(0, h-50, w, 100, 0x443322).setOrigin(0,0);
        
        // NPC
        this.npc = this.add.rectangle(w - 300, h - 140, 60, 180, 0x4444ff);
        this.add.text(w - 300, h - 250, 'NPC / Trưởng làng', { fill: '#fff' }).setOrigin(0.5);

        // Mầm (starts offscreen)
        this.player = this.add.rectangle(-100, h - 90, 40, 80, 0x66ff66);
        
        // UI Box (hidden initially)
        this.dialogBox = this.add.rectangle(w/2, h - 150, 800, 150, 0x222222).setStrokeStyle(4, 0xffffff).setAlpha(0);
        this.dialogText = this.add.text(w/2 - 350, h - 200, '', { font: '24px Arial', fill: '#fff', wordWrap: { width: 700 } }).setAlpha(0);

        // Walk in animation
        this.tweens.add({
            targets: this.player,
            x: 400,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => this.showDialogue()
        });
    }

    showDialogue() {
        this.tweens.add({ targets: [this.dialogBox, this.dialogText], alpha: 1, duration: 500 });
        
        let fullText = "";
        let choices = [];
        if (this.nextScene === 'SurvivalScene') {
            fullText = "Ngươi có hình hài kỳ lạ quá... Hãy ở lại đây, nhưng ngươi phải gọt đẽo bản thân để trở nên giống chúng ta!";
            choices = [
                { text: "Đồng ý (Lựa chọn sai)", action: () => this.goto('GameOverScene', { reason: 'Mầm chấp nhận biến chất và đánh mất chính mình.' }) },
                { text: "Từ chối", action: () => this.goto('SurvivalScene') }
            ];
        } else {
            fullText = "Chào mừng bạn đến với vùng đất mới. Bạn đã vượt qua sa mạc. Bạn có muốn ở lại đây không?";
            choices = [
                { text: "Rời đi", action: () => this.goto('MapScene') },
                { text: "Ở lại", action: () => this.goto('EndingScene') }
            ];
        }

        this.typewriterEffect(fullText, () => {
            this.showChoices(choices);
        });
    }

    typewriterEffect(text, onComplete) {
        const length = text.length;
        let i = 0;
        this.time.addEvent({
            callback: () => {
                this.dialogText.text += text[i];
                i++;
                if (i === length) {
                    onComplete();
                }
            },
            repeat: length - 1,
            delay: 30
        });
    }

    showChoices(choices) {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        choices.forEach((choice, index) => {
            let btn = this.add.text(w/2 - 200 + (index * 400), h - 100, `[ ${choice.text} ]`, { font: '24px Arial', fill: '#ff0', backgroundColor: '#555' })
                .setPadding(10).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', choice.action);
        });
    }

    goto(sceneKey, data) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start(sceneKey, data);
        });
    }
}
