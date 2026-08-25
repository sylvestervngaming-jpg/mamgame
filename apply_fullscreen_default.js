const fs = require('fs');

// 1. Update style.css
const styleCss = `* {
    box-sizing: border-box;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
}

html, body {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000;
    touch-action: none;
    display: flex;
    justify-content: center;
    align-items: center;
}

canvas {
    display: block;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
}

#rotate-device-prompt {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 20, 25, 0.96);
    color: #00d2d3;
    z-index: 99999;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.rotate-icon {
    font-size: 50px;
    margin-bottom: 20px;
    animation: rotatePulse 1.8s infinite ease-in-out;
}

#rotate-device-prompt h2 {
    font-size: 22px;
    margin: 0 0 10px 0;
    color: #ffffff;
}

#rotate-device-prompt p {
    font-size: 15px;
    margin: 0;
    color: #bdc3c7;
}

@keyframes rotatePulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.15) rotate(-90deg); }
}

@media screen and (orientation: portrait) and (max-width: 900px) {
    #rotate-device-prompt {
        display: flex;
    }
}
`;
fs.writeFileSync('style.css', styleCss, 'utf8');

// 2. Update UIScene.js with robust Fullscreen handler
let uiCode = fs.readFileSync('src/scenes/UIScene.js', 'utf8');

const oldToggleFullscreen = `    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err.message);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }`;

const newToggleFullscreen = `    toggleFullscreen() {
        try {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        } catch (e) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }
    }`;

uiCode = uiCode.replace(oldToggleFullscreen, newToggleFullscreen);
fs.writeFileSync('src/scenes/UIScene.js', uiCode, 'utf8');

// 3. Update MenuScene.js to auto fullscreen on start
let menuCode = fs.readFileSync('src/scenes/MenuScene.js', 'utf8');
const oldMenuStart = `        startBtn.on('pointerdown', () => {
            this.registry.set('health', 100);`;

const newMenuStart = `        startBtn.on('pointerdown', () => {
            try {
                if (!this.scale.isFullscreen && this.scale.startFullscreen) {
                    this.scale.startFullscreen();
                }
            } catch (e) {}
            this.registry.set('health', 100);`;

menuCode = menuCode.replace(oldMenuStart, newMenuStart);
fs.writeFileSync('src/scenes/MenuScene.js', menuCode, 'utf8');