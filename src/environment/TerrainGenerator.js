import AssetManager from '../utils/AssetManager.js';

export default class TerrainGenerator {
    static generateGrassTerrain(scene, mapW, h) {
        let groundGroup = scene.add.group();
        
        let terrainHeight = h + 500; // Let's say 1220
        
        AssetManager.generateAndSave(scene, 'map2_terrain', mapW, terrainHeight, (g) => {
            g.fillStyle(0x32cd32, 1);
            g.beginPath();
            g.moveTo(0, terrainHeight);
            
            for (let x = 0; x <= mapW; x += 20) {
                let ty = h - 100 + Math.sin(x / 300) * 40;
                if (x > mapW - 400) ty = h - 100;
                g.lineTo(x, ty);
            }
            g.lineTo(mapW, terrainHeight);
            g.fillPath();
            
            g.lineStyle(6, 0x228b22, 1);
            g.beginPath();
            g.moveTo(0, h - 100);
            for (let x = 0; x <= mapW; x += 20) {
                let ty = h - 100 + Math.sin(x / 300) * 40;
                if (x > mapW - 400) ty = h - 100;
                g.lineTo(x, ty);
            }
            g.strokePath();
        });

        // Add the visual image
        let visual = scene.add.image(0, 0, 'map2_terrain').setOrigin(0, 0);

        // Add physics blocks (invisible)
        for (let x = 0; x <= mapW; x += 20) {
            let ty = h - 100 + Math.sin(x / 300) * 40;
            if (x > mapW - 400) ty = h - 100;
            
            if (x > 0) {
                let rect = scene.add.rectangle(x - 10, ty, 20, terrainHeight - ty, 0x000000, 0).setOrigin(0.5, 0);
                scene.physics.add.existing(rect, true);
                groundGroup.add(rect);
            }
        }
        
        return groundGroup;
    }

    static getGrassTerrainY(x, mapW, h) {
        let groundY = h - 100 + Math.sin(x / 300) * 40;
        if (x > mapW - 400) groundY = h - 100;
        return groundY;
    }
}