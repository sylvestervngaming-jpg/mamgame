/**
 * Utility for managing assets, automatically loading artist PNGs/JPGs or generating/saving programmer art.
 * @class
 */
export default class AssetManager {
    static preloadAll(scene) {
        // Luon load danh sach cac asset cot loi qua relative URL cua Phaser
        const coreAssets = [
            { key: 'war_bg', file: 'assets/sprites/war_bg.jpg' },
            { key: 'toxic_ground', file: 'assets/sprites/toxic_ground.jpg' },
            { key: 'bg', file: 'assets/sprites/bg.jpg' },
            { key: 'ground', file: 'assets/sprites/ground.jpg' },
            { key: 'sprout', file: 'assets/sprites/sprout.png' }
        ];

        coreAssets.forEach(item => {
            if (!scene.textures.exists(item.key)) {
                scene.load.image(item.key, item.file);
            }
        });

        // Quet tu dong thu muc sprites de nap them moi file moi cua Artist
        if (typeof window !== 'undefined' && window.require) {
            try {
                const fs = window.require('fs');
                const path = window.require('path');

                const candidateDirs = [
                    path.join(process.cwd(), 'assets', 'sprites'),
                    path.join(process.cwd(), 'resources', 'app', 'assets', 'sprites'),
                    path.join(process.cwd(), 'resources', 'assets', 'sprites'),
                    path.join(process.resourcesPath || '', 'app', 'assets', 'sprites'),
                    path.join(process.resourcesPath || '', 'assets', 'sprites')
                ];

                for (let dir of candidateDirs) {
                    if (fs.existsSync(dir)) {
                        this.spritePath = dir;
                        const files = fs.readdirSync(dir);
                        for (let file of files) {
                            if (file.endsWith('.png') || file.endsWith('.jpg')) {
                                const key = file.replace('.png', '').replace('.jpg', '');
                                if (!scene.textures.exists(key)) {
                                    scene.load.image(key, 'assets/sprites/' + file);
                                }
                            }
                        }
                        break;
                    }
                }
            } catch (e) {
                console.warn('[AssetManager] Dynamic scan warning:', e);
            }
        }
    }

    static generateAndSave(scene, key, width, height, drawCallback) {
        if (scene.textures.exists(key)) return; 

        let g = scene.make.graphics({ x: 0, y: 0, add: false });
        drawCallback(g);
        g.generateTexture(key, width, height);
        g.destroy();

        if (typeof window !== 'undefined' && window.require) {
            try {
                const fs = window.require('fs');
                const path = window.require('path');
                
                let texture = scene.textures.get(key);
                let canvas = texture.getSourceImage();
                
                if (canvas && canvas.toDataURL) {
                    let base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
                    
                    let targetDir = this.spritePath || path.join(process.cwd(), 'assets', 'sprites');
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }
                    let filePath = path.join(targetDir, key + '.png');

                    fs.writeFileSync(filePath, base64Data, 'base64');
                }
            } catch (e) {
                // Ignore save errors in read-only packaged environment
            }
        }
    }
}
