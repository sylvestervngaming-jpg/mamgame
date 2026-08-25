const fs = require('fs');

// 1. Create manifest.json with landscape orientation lock
const manifest = {
  "name": "Mầm - Hành Trình Tìm Nắng",
  "short_name": "Mầm Game",
  "start_url": "./index.html",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#000000",
  "theme_color": "#00d2d3",
  "icons": [
    {
      "src": "assets/sprites/sprout.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
};
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2), 'utf8');

// 2. Update index.html
const indexHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="screen-orientation" content="landscape">
    <meta name="x5-orientation" content="landscape">
    <meta name="browsermode" content="application">
    <meta name="x5-page-mode" content="app">
    <link rel="manifest" href="manifest.json">
    <title>Mầm - Hành Trình Tìm Nắng</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script src="js/bundle.js" defer></script>
</head>
<body>
    <div id="rotate-device-prompt">
        <div class="rotate-icon">📱 ➔ 🔄</div>
        <h2>Vui lòng xoay ngang điện thoại</h2>
        <p>Để có trải nghiệm phiêu lưu tốt nhất cùng Mầm!</p>
        <button id="btn-lock-landscape">🔄 BẬT TOÀN MÀN HÌNH NGANG</button>
    </div>

    <script>
        function triggerLandscapeLock() {
            const docEl = document.documentElement;
            const requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
            if (requestFs && !document.fullscreenElement) {
                requestFs.call(docEl).catch(function() {});
            }
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(function() {});
            } else if (screen.lockOrientation) {
                screen.lockOrientation('landscape');
            } else if (screen.mozLockOrientation) {
                screen.mozLockOrientation('landscape');
            } else if (screen.msLockOrientation) {
                screen.msLockOrientation('landscape');
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const btn = document.getElementById('btn-lock-landscape');
            if (btn) {
                btn.addEventListener('click', triggerLandscapeLock);
                btn.addEventListener('touchstart', triggerLandscapeLock);
            }
            // Auto lock on first touch anywhere on screen
            document.body.addEventListener('touchstart', function() {
                triggerLandscapeLock();
            }, { passive: true, once: false });
        });
    </script>
</body>
</html>
`;
fs.writeFileSync('index.html', indexHtml, 'utf8');

// 3. Update style.css with styled button
const styleCss = `* {
    box-sizing: border-box;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
}

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    min-height: 100dvh;
    height: 100dvh;
    overflow: hidden;
    background-color: #000;
    touch-action: none;
}

canvas {
    display: block !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
}

#rotate-device-prompt {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background: rgba(15, 20, 25, 0.98);
    color: #00d2d3;
    z-index: 99999;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 24px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.rotate-icon {
    font-size: 54px;
    margin-bottom: 20px;
    animation: rotatePulse 1.8s infinite ease-in-out;
}

#rotate-device-prompt h2 {
    font-size: 24px;
    margin: 0 0 10px 0;
    color: #ffffff;
}

#rotate-device-prompt p {
    font-size: 16px;
    margin: 0 0 24px 0;
    color: #bdc3c7;
}

#btn-lock-landscape {
    background: linear-gradient(135deg, #00d2d3, #10ac84);
    color: #1e272e;
    border: none;
    border-radius: 25px;
    padding: 14px 28px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(0, 210, 211, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
}

#btn-lock-landscape:active {
    transform: scale(0.95);
    box-shadow: 0 2px 10px rgba(0, 210, 211, 0.6);
}

@keyframes rotatePulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.15) rotate(-90deg); }
}

@media screen and (orientation: portrait) and (max-width: 1024px) {
    #rotate-device-prompt {
        display: flex;
    }
}
`;
fs.writeFileSync('style.css', styleCss, 'utf8');

console.log('Successfully configured automatic landscape lock & PWA manifest!');