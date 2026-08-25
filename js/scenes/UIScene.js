class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false });
    }

    create() {
        // Náº¿u cá» showUI chÆ°a báº­t, áº©n toÃ n bá»™ scene UI
        if (!this.registry.get('showUI')) {
            this.scene.sleep();
        }

        // Láº¯ng nghe sá»± kiá»‡n báº­t UI tá»« scene khÃ¡c
        this.registry.events.on('changedata-showUI', (parent, value) => {
            if (value) {
                this.scene.wake();
            } else {
                this.scene.sleep();
            }
        });

        // Ná»n tiá»n
        this.coinBg = this.add.graphics();
        this.coinBg.lineStyle(4, 0xffff00, 1);
        this.coinBg.fillStyle(0x000000, 0.7);
        this.coinBg.fillRoundedRect(30, 30, 180, 60, 10);
        this.coinBg.strokeRoundedRect(30, 30, 180, 60, 10);

        // Icon tiá»n
        this.coinIcon = this.add.image(70, 60, 'coin');
        this.coinIcon.setScale(1.5);

        // Text hiá»ƒn thá»‹ sá»‘ tiá»n
        this.coinText = this.add.text(110, 45, '0', {
            font: 'bold 30px Arial',
            fill: '#ffff00'
        });

        // --- áº¨N UI TIá»€N Tá»† TRONG MAP 1 ---
        this.coinBg.setVisible(false);
        this.coinIcon.setVisible(false);
        this.coinText.setVisible(false);

        const h = this.cameras.main.height;
        const w = this.cameras.main.width;

        this.uiContainer = this.add.container(0, 0);
        this.survivalContainer = this.add.container(0, 0);

        // --- Thiáº¿t káº¿ UI Sinh Tá»“n vÃ²ng trÃ²n kiá»ƒu Don't Starve Together ---
        // Vá»‹ trÃ­: GÃ³c trÃªn cÃ¹ng bÃªn pháº£i
        this.gauges = {};
        
        let baseY = 80;
        this.createDSTGauge(w - 230, baseY, 'health', 0xff0000, 'â¤ï¸');
        this.createDSTGauge(w - 175, baseY, 'psyche', 0xaa00aa, 'ðŸ§ ');
        this.createDSTGauge(w - 120, baseY, 'water', 0x0088ff, 'ðŸ’§');
        this.createDSTGauge(w - 65, baseY, 'sun', 0xffaa00, 'â˜€ï¸');

        this.uiContainer.setVisible(false);
        this.survivalContainer.setVisible(false);

        // Láº¯ng nghe thay Ä‘á»•i dá»¯ liá»‡u
                this.events.on('shutdown', () => {
            this.registry.events.off('changedata-showUI');
            this.registry.events.off('changedata', this.updateData, this);
        });
        this.registry.events.on('changedata', this.updateData, this);
        this.updateData(this.registry, 'showUI', this.registry.get('showUI'));
        this.updateData(this.registry, 'showSurvival', this.registry.get('showSurvival'));

        // Survival Tick (Má»—i giÃ¢y)
        this.time.addEvent({
            delay: 1000,
            callback: this.survivalTick,
            callbackScope: this,
            loop: true
        });

        // Láº¯ng nghe phÃ­m ESC Ä‘á»ƒ Táº¡m dá»«ng (Pause)
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.registry.get('showUI')) return; // Bá» qua náº¿u Ä‘ang trong cutscene / transition
            if (this.scene.isActive('PauseScene')) return; // Äang pause rá»“i thÃ¬ bá» qua
            
            let activeScene = this.scene.manager.getScenes(true).find(s => 
                s.scene.key !== 'UIScene' && 
                s.scene.key !== 'PauseScene' && 
                s.scene.key !== 'MenuScene'
            );
            
            if (activeScene) {
                this.scene.pause(activeScene.scene.key);
                this.scene.launch('PauseScene', { scene: activeScene.scene.key });
                this.scene.bringToTop('PauseScene');
            }
        });
    }

    createDSTGauge(x, y, key, color, emoji) {
        // Viá»n vÃ  Ná»n (Thu nhá» radius tá»« 35 xuá»‘ng 22)
        let bg = this.add.circle(x, y, 22, 0x222222).setStrokeStyle(2, 0xdddddd);
        
        // Máº·t náº¡ hÃ¬nh trÃ²n (Mask)
        let shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.fillCircle(x, y, 22);
        let mask = shape.createGeometryMask();

        // Pháº§n mÃ u (Fill) dáº¡ng chá»¯ nháº­t Ä‘á»ƒ cÃ³ thá»ƒ tá»¥t tá»« trÃªn xuá»‘ng dÆ°á»›i (cao 44)
        let fill = this.add.rectangle(x, y + 22, 44, 44, color).setOrigin(0.5, 1);
        fill.setMask(mask);

        // Emoji á»Ÿ giá»¯a
        let icon = this.add.text(x, y, emoji, { fontSize: '18px' }).setOrigin(0.5);
        
        // Text % 
        let text = this.add.text(x, y + 32, '100%', { font: 'bold 12px Arial', fill: '#ffffff' }).setOrigin(0.5).setShadow(1,1,'#000',2);

        this.survivalContainer.add([bg, fill, icon, text]);
        
        this.gauges[key] = { fill: fill, text: text };
    }

    updateData(parent, key, data) {
        if (key === 'showUI') {
            this.uiContainer.setVisible(!!data);
        }
        if (key === 'showSurvival') {
            this.survivalContainer.setVisible(!!data);
        }
        if (key === 'coins') {
            this.coinText.setText('ðŸ’° ' + data);
        }
        if (['health', 'psyche', 'water', 'sun'].includes(key)) {
            let val = Math.max(0, Math.min(100, data));
            if (this.gauges[key]) {
                // Cáº­p nháº­t chiá»u cao cá»§a khá»‘i mÃ u (44 lÃ  full height)
                this.gauges[key].fill.height = (val / 100) * 44;
                this.gauges[key].text.setText(Math.round(val) + '%');
            }
        }
    }

    survivalTick() {
        if (!this.registry.get('showUI')) return;

        let water = this.registry.get('water');
        let sun = this.registry.get('sun');
        let psyche = this.registry.get('psyche');
        let health = this.registry.get('health');

        let alarms = 0;
        if (water < 20 || water > 85) alarms++;
        if (sun < 20 || sun > 85) alarms++;
        if (psyche < 20) alarms++;

        let damage = 0;
        if (alarms === 1) damage = 5;
        else if (alarms === 2) damage = 15;
        else if (alarms === 3) damage = 25;

        if (damage > 0) {
            health -= damage;
            this.registry.set('health', health);
            
            // Hiá»‡u á»©ng chá»›p Ä‘á» bÃ¡o Ä‘á»™ng
            this.tweens.add({
                targets: this.gauges['health'].fill,
                alpha: 0.2,
                yoyo: true,
                duration: 150
            });

            if (health <= 0) {
                this.registry.set('showUI', false);
                let activeScene = this.scene.manager.getScenes(true).find(s => s.scene.key !== 'UIScene');
                if (activeScene) {
                    activeScene.scene.start('GameOverScene', { reason: 'Máº§m Ä‘Ã£ cháº¿t do máº¥t cÃ¢n báº±ng sinh tá»“n.' });
                }
            }
        }
    }
}
