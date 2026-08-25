export default class TextTransitionScene extends Phaser.Scene {
    constructor() { super('TextTransitionScene'); }
    init(data) { 
        this.text = data.text || '';
        this.nextScene = data.nextScene || 'MapScene';
        this.nextData = data.nextData || {};
    }
    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        
        let t = this.add.text(w/2, h/2, this.text, { font: '40px Arial', fill: '#fff', align: 'center' }).setOrigin(0.5);
        t.setAlpha(0);
        
        this.tweens.add({
            targets: t, 
            alpha: 1, 
            duration: 1500, 
            ease: 'Linear', 
            yoyo: true, 
            hold: 2000,
            onComplete: () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => this.scene.start(this.nextScene, this.nextData));
            }
        });
    }
}
