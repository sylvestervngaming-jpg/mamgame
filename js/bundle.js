(() => {
  // src/utils/AssetManager.js
  var AssetManager = class {
    static preloadAll(scene) {
      const coreAssets = [
        { key: "war_bg", file: "assets/sprites/war_bg.jpg" },
        { key: "toxic_ground", file: "assets/sprites/toxic_ground.jpg" },
        { key: "bg", file: "assets/sprites/bg.jpg" },
        { key: "ground", file: "assets/sprites/ground.jpg" },
        { key: "sprout", file: "assets/sprites/sprout.png" }
      ];
      coreAssets.forEach((item) => {
        if (!scene.textures.exists(item.key)) {
          scene.load.image(item.key, item.file);
        }
      });
      if (typeof window !== "undefined" && window.require) {
        try {
          const fs = window.require("fs");
          const path = window.require("path");
          const candidateDirs = [
            path.join(process.cwd(), "assets", "sprites"),
            path.join(process.cwd(), "resources", "app", "assets", "sprites"),
            path.join(process.cwd(), "resources", "assets", "sprites"),
            path.join(process.resourcesPath || "", "app", "assets", "sprites"),
            path.join(process.resourcesPath || "", "assets", "sprites")
          ];
          for (let dir of candidateDirs) {
            if (fs.existsSync(dir)) {
              this.spritePath = dir;
              const files = fs.readdirSync(dir);
              for (let file of files) {
                if (file.endsWith(".png") || file.endsWith(".jpg")) {
                  const key = file.replace(".png", "").replace(".jpg", "");
                  if (!scene.textures.exists(key)) {
                    scene.load.image(key, "assets/sprites/" + file);
                  }
                }
              }
              break;
            }
          }
        } catch (e) {
          console.warn("[AssetManager] Dynamic scan warning:", e);
        }
      }
    }
    static generateAndSave(scene, key, width, height, drawCallback) {
      if (scene.textures.exists(key)) return;
      let g = scene.make.graphics({ x: 0, y: 0, add: false });
      drawCallback(g);
      g.generateTexture(key, width, height);
      g.destroy();
      if (typeof window !== "undefined" && window.require) {
        try {
          const fs = window.require("fs");
          const path = window.require("path");
          let texture = scene.textures.get(key);
          let canvas = texture.getSourceImage();
          if (canvas && canvas.toDataURL) {
            let base64Data = canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
            let targetDir = this.spritePath || path.join(process.cwd(), "assets", "sprites");
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            let filePath = path.join(targetDir, key + ".png");
            fs.writeFileSync(filePath, base64Data, "base64");
          }
        } catch (e) {
        }
      }
    }
  };

  // src/scenes/BootScene.js
  var BootScene = class extends Phaser.Scene {
    constructor() {
      super("BootScene");
    }
    preload() {
      this.add.text(640, 360, "\u0110ang t\u1EA3i...", { font: "32px Arial", fill: "#ffffff" }).setOrigin(0.5, 0.5);
      AssetManager.preloadAll(this);
    }
    create() {
      this.registry.set("playerColor", 3066993);
      this.registry.set("inventory", {
        seed: 0,
        dewdrop: 0,
        sun_crystal: 0,
        mushroom: 0,
        coin: 0,
        potion: 0
      });
      this.registry.set("health", 100);
      this.registry.set("water", 50);
      this.registry.set("sun", 50);
      this.registry.set("psyche", 100);
      this.registry.set("coins", 100);
      this.registry.set("affinity_map1", 50);
      this.registry.set("affinity_map2", 50);
      this.registry.set("affinity_map3", 50);
      this.registry.set("affinity_map4", 50);
      this.registry.set("affinity_map5", 50);
      this.scene.start("MenuScene");
    }
  };

  // src/scenes/IntroScene.js
  var IntroScene = class extends Phaser.Scene {
    constructor() {
      super("IntroScene");
    }
    create() {
      this.registry.set("showUI", false);
      this.registry.set("health", 100);
      this.registry.set("water", 50);
      this.registry.set("sun", 50);
      this.registry.set("psyche", 100);
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.videoPlaceholder = this.add.rectangle(w / 2, h / 2 - 50, 1e3, 500, 3355443);
      this.videoText = this.add.text(w / 2, h / 2 - 50, "[ VIDEO CLIP ]\nC\xE1\xBA\xA3nh bom \xC4\u2018\xE1\xBA\xA1n -> M\xE1\xBA\xA7m m\xE1\xBB\x8Dc l\xC3\xAAn -> N\xC6\xB0\xE1\xBB\u203Ac \xC3\xB4 nhi\xE1\xBB\u2026m", { font: "32px Arial", fill: "#ffffff", align: "center" }).setOrigin(0.5);
      this.skipBtn = this.add.text(w / 2, h - 100, ">> B\xE1\xBB\x8F qua / Ho\xC3\xA0n th\xC3\xA0nh Video", { font: "24px Arial", fill: "#ffff00", backgroundColor: "#000" }).setPadding(10).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.videoPlaceholder.setVisible(false);
        this.videoText.setVisible(false);
        this.skipBtn.setVisible(false);
        this.showChoice();
      });
    }
    showChoice() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.add.text(w / 2, h / 2 - 100, "B\xE1\xBA\xA1n c\xC3\xB3 mu\xE1\xBB\u2018n \xE1\xBB\u0178 l\xE1\xBA\xA1i?", { font: "40px Arial", fill: "#ffffff" }).setOrigin(0.5);
      this.add.text(w / 2 - 200, h / 2 + 50, "[ X ] R\xE1\xBB\x9Di \xC4\u2018i", { font: "32px Arial", fill: "#ff4444" }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", () => this.scene.start("MapScene"));
      this.add.text(w / 2 + 200, h / 2 + 50, "[ V ] \xE1\xBB\u017E l\xE1\xBA\xA1i", { font: "32px Arial", fill: "#44ff44" }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", () => this.scene.start("GameOverScene", { reason: "M\xE1\xBA\xA7m b\xE1\xBB\u2039 nhi\xE1\xBB\u2026m \xC4\u2018\xE1\xBB\u2122c ch\xE1\xBA\xBFt ngay t\xE1\xBB\xAB \xC4\u2018\xE1\xBA\xA7u." }));
    }
  };

  // src/scenes/MapScene.js
  var MapScene = class extends Phaser.Scene {
    constructor() {
      super("MapScene");
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.cameras.main.fadeIn(500, 0, 0, 0);
      this.registry.set("showUI", false);
      this.add.text(w / 2, 100, "B\xE1\xBA\xA2N \xC4\x90\xE1\xBB\u2019 TH\xE1\xBA\xBE GI\xE1\xBB\u0161I", { font: "bold 40px Arial", fill: "#ffffff" }).setOrigin(0.5);
      this.add.text(w / 2, 140, "Ph\xC3\xAD di chuy\xE1\xBB\u0192n: 100 Coins / Chuy\xE1\xBA\xBFn", { font: "20px Arial", fill: "#ffff00" }).setOrigin(0.5);
      let mapGraphics = this.add.graphics();
      mapGraphics.lineStyle(4, 11184810, 1);
      mapGraphics.beginPath();
      mapGraphics.moveTo(200, h / 2);
      mapGraphics.lineTo(400, h / 2 - 100);
      mapGraphics.lineTo(650, h / 2 + 50);
      mapGraphics.lineTo(900, h / 2 - 50);
      mapGraphics.lineTo(1100, h / 2 + 100);
      mapGraphics.strokePath();
      this.createMapNode(200, h / 2, "Map 1: V\xC3\xB9ng X\xC3\xA1m\n(Qu\xC3\xAA h\xC6\xB0\xC6\xA1ng)", 5592405, true, "RunnerScene");
      this.createMapNode(400, h / 2 - 100, "Map 2: C\xE1\xBB\u2018i Xay Gi\xC3\xB3\n(H\xC3\xA0 Lan)", 16711935, false, "RunnerScene");
      this.createMapNode(650, h / 2 + 50, "Map 3: L\xC3\xA0ng Sen\n(Vi\xE1\xBB\u2021t Nam)", 65280, false, "RunnerScene");
      this.createMapNode(900, h / 2 - 50, "Map 4: Th\xC3\xA1i D\xC6\xB0\xC6\xA1ng\n(Ph\xC3\xA1p)", 16776960, false, "RunnerScene");
      this.createMapNode(1100, h / 2 + 100, "Map 5: D\xE1\xBA\xA1 N\xE1\xBA\xA5m\n(Na Uy)", 35071, false, "RunnerScene");
    }
    createMapNode(x, y, label, color, isUnlocked, targetScene) {
      let circle = this.add.circle(x, y, 30, color);
      if (!isUnlocked) circle.setAlpha(0.5);
      circle.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        let coins = this.registry.get("coins");
        if (coins >= 100) {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.time.delayedCall(500, () => {
            this.scene.start(targetScene);
          });
        } else {
          this.showError(x, y, "Kh\xC3\xB4ng \xC4\u2018\xE1\xBB\xA7 Coins!");
        }
      });
      this.add.text(x, y + 50, label, { font: "18px Arial", fill: "#fff", align: "center" }).setOrigin(0.5);
    }
    showError(x, y, msg) {
      let err = this.add.text(x, y - 50, msg, { font: "bold 20px Arial", fill: "#ff0000" }).setOrigin(0.5);
      this.tweens.add({
        targets: err,
        y: y - 80,
        alpha: 0,
        duration: 1e3,
        onComplete: () => err.destroy()
      });
    }
  };

  // src/entities/CollectibleItem.js
  var ITEM_DEFS = {
    seed: {
      key: "item_seed",
      name: "H\u1EA1t Gi\u1ED1ng C\u1ED5 \u0110\u1EA1i",
      icon: "\u{1F331}",
      draw: (g) => {
        g.fillStyle(2600544, 1);
        g.fillEllipse(16, 16, 18, 26);
        g.fillStyle(3066993, 1);
        g.fillCircle(14, 12, 5);
      }
    },
    dewdrop: {
      key: "item_dewdrop",
      name: "Gi\u1ECDt S\u01B0\u01A1ng Mai",
      icon: "\u{1F4A7}",
      draw: (g) => {
        g.fillStyle(3447003, 1);
        g.fillCircle(16, 18, 10);
        g.fillTriangle(16, 4, 7, 18, 25, 18);
        g.fillStyle(16777215, 0.7);
        g.fillCircle(13, 15, 3);
      }
    },
    sun_crystal: {
      key: "item_sun_crystal",
      name: "Tinh Th\u1EC3 Th\xE1i D\u01B0\u01A1ng",
      icon: "\u2600\uFE0F",
      draw: (g) => {
        g.fillStyle(15844367, 1);
        g.beginPath();
        g.moveTo(16, 2);
        g.lineTo(28, 16);
        g.lineTo(16, 30);
        g.lineTo(4, 16);
        g.closePath();
        g.fillPath();
        g.fillStyle(16777215, 0.7);
        g.fillCircle(16, 16, 5);
      }
    },
    mushroom: {
      key: "item_mushroom",
      name: "N\u1EA5m Ph\xE1t Quang",
      icon: "\u{1F344}",
      draw: (g) => {
        g.fillStyle(15528177, 1);
        g.fillRect(12, 14, 8, 14);
        g.fillStyle(10181046, 1);
        g.fillEllipse(16, 14, 26, 18);
        g.fillStyle(14254330, 1);
        g.fillCircle(11, 10, 3);
        g.fillCircle(21, 12, 2.5);
        g.fillCircle(16, 6, 2);
      }
    },
    coin: {
      key: "item_coin",
      name: "\u0110\u1ED3ng Xu V\xE0ng",
      icon: "\u{1FA99}",
      draw: (g) => {
        g.fillStyle(15965202, 1);
        g.fillCircle(16, 16, 14);
        g.lineStyle(2, 14059792, 1);
        g.strokeCircle(16, 16, 14);
        g.fillStyle(15844367, 1);
        g.fillCircle(16, 16, 10);
      }
    },
    potion: {
      key: "item_potion",
      name: "B\xECnh Thu\u1ED1c Sinh M\u1EC7nh",
      icon: "\u{1F9EA}",
      draw: (g) => {
        g.fillStyle(12436423, 1);
        g.fillRect(13, 4, 6, 6);
        g.fillStyle(15158332, 1);
        g.fillCircle(16, 20, 10);
        g.fillStyle(16742005, 1);
        g.fillCircle(13, 17, 3);
      }
    }
  };
  var CollectibleItem = class extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, itemType = "seed") {
      const def = ITEM_DEFS[itemType] || ITEM_DEFS.seed;
      AssetManager.generateAndSave(scene, def.key, 32, 32, def.draw);
      super(scene, x, y, def.key);
      scene.add.existing(this);
      scene.physics.add.existing(this, true);
      this.itemType = itemType;
      this.def = def;
      this.isCollected = false;
      this.setOrigin(0.5, 0.5);
      this.setDepth(12);
      scene.tweens.add({
        targets: this,
        y: y - 8,
        duration: 1200 + Phaser.Math.Between(-200, 200),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
      scene.tweens.add({
        targets: this,
        scale: 1.15,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
    collect(player) {
      if (this.isCollected) return;
      this.isCollected = true;
      if (this.body) {
        this.body.enable = false;
      }
      let inv = this.scene.registry.get("inventory") || {};
      inv[this.itemType] = (inv[this.itemType] || 0) + 1;
      this.scene.registry.set("inventory", inv);
      this.scene.registry.events.emit("item-collected", {
        type: this.itemType,
        name: this.def.name,
        icon: this.def.icon,
        total: inv[this.itemType]
      });
      this.scene.tweens.add({
        targets: this,
        y: this.y - 45,
        alpha: 0,
        scale: 1.5,
        duration: 350,
        ease: "Back.easeOut",
        onComplete: () => {
          this.destroy();
        }
      });
    }
  };

  // src/scenes/RunnerScene.js
  var RunnerScene = class extends Phaser.Scene {
    constructor() {
      super("RunnerScene");
    }
    preload() {
      AssetManager.preloadAll(this);
    }
    create() {
      this.hasReachedEnd = false;
      this.isGameOvering = false;
      this.hasTriggeredArtillery = false;
      AssetManager.generateAndSave(this, "map1_stump", 30, 50, (g) => {
        g.fillStyle(5583633, 1);
        g.fillRect(0, 0, 30, 50);
        g.fillStyle(4465152, 1);
        g.fillRect(10, 35, 4, 15);
        g.fillRect(21, 42, 3, 10);
        g.fillStyle(6702114, 1);
        g.fillRect(27, 10, 15, 3);
      });
      AssetManager.generateAndSave(this, "map1_leaf", 20, 20, (g) => {
        g.fillStyle(5227117, 1);
        g.fillEllipse(10, 10, 10, 20);
      });
      AssetManager.generateAndSave(this, "map1_vine_bridge", 750, 100, (g) => {
        let vines = [
          { color: 4039517, thick: 8, sag: 25 },
          { color: 2984526, thick: 6, sag: 40 },
          { color: 1730099, thick: 12, sag: 15 }
        ];
        vines.forEach((vine, vi) => {
          g.lineStyle(vine.thick, vine.color, 1);
          g.beginPath();
          g.moveTo(0, 20 + vi * 3);
          for (let bx = 0; bx <= 750; bx += 20) {
            let progress = bx / 750;
            let curveY = Math.sin(progress * Math.PI) * vine.sag;
            g.lineTo(bx, 20 + vi * 3 + curveY);
          }
          g.strokePath();
        });
      });
      this.cratersCreated = false;
      this.isCinematic = false;
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      this.registry.set("showUI", true);
      this.scene.launch("UIScene");
      this.scene.bringToTop("UIScene");
      this.registry.set("showSurvival", false);
      for (let bi = 0; bi < 6; bi++) {
        this.add.image(w * bi, 0, "war_bg").setOrigin(0, 0).setDisplaySize(w, h).setScrollFactor(0.2);
      }
      let mgGraphics = this.add.graphics().setScrollFactor(0.4);
      mgGraphics.fillStyle(1052693, 1);
      for (let x = -200; x < w * 6; x += 300) {
        let width = 120;
        let height = 300;
        mgGraphics.fillRect(x, h - height, width, height + 1500);
        mgGraphics.beginPath();
        mgGraphics.moveTo(x, h - height);
        mgGraphics.lineTo(x + 40, h - height - 20);
        mgGraphics.lineTo(x + 80, h - height + 10);
        mgGraphics.lineTo(x + width, h - height);
        mgGraphics.fillPath();
      }
      this.add.rectangle(1536, h - 30, 512, 1500, 1703970, 0.95).setOrigin(0, 0);
      this.add.rectangle(1536, h - 45, 512, 40, 3342413, 0.7).setOrigin(0, 0);
      AssetManager.generateAndSave(this, "toxic_lake", 512, 20, (g) => {
        g.fillStyle(8913066, 0.4);
        g.fillRect(0, 2, 512, 15);
        g.fillStyle(11154380, 0.25);
        g.fillRect(0, 0, 512, 6);
      });
      let surfaceG1 = this.add.image(1536, h - 57, "toxic_lake").setOrigin(0, 0);
      for (let rx = 1550; rx < 2030; rx += Phaser.Math.Between(30, 70)) {
        let shimmer = this.add.ellipse(rx, h - 53, Phaser.Math.Between(15, 40), 3, 13395711, 0.3);
        this.tweens.add({ targets: shimmer, alpha: 0.05, duration: Phaser.Math.Between(1e3, 2e3), yoyo: true, repeat: -1 });
      }
      AssetManager.generateAndSave(this, "smoke", 16, 16, (g) => {
        g.fillStyle(11141375, 0.5);
        g.fillCircle(8, 8, 8);
      });
      AssetManager.generateAndSave(this, "firefly", 8, 8, (g) => {
        g.fillStyle(65280, 1);
        g.fillCircle(4, 4, 4);
      });
      this.add.particles(0, 0, "smoke", {
        x: { min: 1560, max: 2020 },
        y: h - 60,
        speedY: { min: -15, max: -35 },
        scale: { start: 0.3, end: 0.1 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 2e3,
        frequency: 400,
        tint: 11158732
      });
      this.toxicPit = this.add.rectangle(1536, h - 55, 512, 200, 0, 0).setOrigin(0, 0);
      this.physics.add.existing(this.toxicPit, true);
      this.groundGroup = this.add.group();
      for (let x = 0; x <= w * 6; x += 20) {
        let ty = this.getTerrainY(x);
        if (!(x > 1536 && x <= 2048)) {
          let rect = this.add.rectangle(x, ty, 20, h + 1500 - ty, 0, 0).setOrigin(0, 0);
          this.physics.add.existing(rect, true);
          this.groundGroup.add(rect);
        }
      }
      this.groundGraphics = this.make.graphics({ x: 0, y: 0 });
      this.groundGraphics.fillStyle(16777215, 1);
      this.groundGraphics.beginPath();
      this.groundGraphics.moveTo(0, h + 1500);
      for (let x = 0; x <= w * 6; x += 10) {
        let ty = this.getTerrainY(x);
        if (x > 1536 && x <= 2048) {
          this.groundGraphics.lineTo(x, h + 1500);
        } else {
          this.groundGraphics.lineTo(x, ty);
        }
      }
      this.groundGraphics.lineTo(w * 6, h + 1500);
      this.groundGraphics.fillPath();
      let groundMask = this.groundGraphics.createGeometryMask();
      for (let x = 0; x <= w * 6; x += 512) {
        if (x === 1536) continue;
        for (let yOffset = 0; yOffset <= 1500; yOffset += 145) {
          let groundImg = this.add.image(x, h + 322 + yOffset, "toxic_ground").setOrigin(0, 1).setScale(0.5);
          groundImg.setCrop(0, 160, 1024, 300);
          groundImg.setMask(groundMask);
          groundImg.setDepth(5);
        }
      }
      this.borderGraphics = this.add.graphics();
      this.borderGraphics.lineStyle(4, 1710626, 1);
      this.borderGraphics.beginPath();
      let firstBorder = true;
      for (let x = 0; x <= w * 6; x += 20) {
        let ty = this.getTerrainY(x);
        if (x > 1536 && x <= 2048) {
          firstBorder = true;
        } else {
          if (firstBorder) {
            this.borderGraphics.moveTo(x, ty);
            firstBorder = false;
          } else this.borderGraphics.lineTo(x, ty);
        }
      }
      this.borderGraphics.strokePath();
      this.borderGraphics.setDepth(6);
      this.deathZone = this.add.rectangle(0, h + 1500, w * 6, 200, 16711680, 0).setOrigin(0, 0);
      this.physics.add.existing(this.deathZone, true);
      this.add.particles(0, 0, "smoke", {
        x: { min: w * 6, max: w * 6 + 800 },
        y: { min: h - 100, max: h },
        lifespan: 4e3,
        speedY: { min: -20, max: -50 },
        scale: { start: 1, end: 3 },
        alpha: { start: 0.8, end: 0 },
        frequency: 100
      });
      this.add.particles(0, 0, "smoke", {
        x: { min: 1560, max: 2020 },
        y: h - 80,
        lifespan: 3e3,
        speedY: { min: -10, max: -30 },
        scale: { start: 0.5, end: 2 },
        alpha: { start: 0.4, end: 0 },
        frequency: 300
      });
      this.flowers = [];
      for (let fx = 500; fx < w * 6; fx += 300) {
        if (fx > 1400 && fx < 2100) continue;
        let ty = this.getTerrainY(fx);
        let flowerContainer = this.add.container(fx, ty);
        let stem = this.add.rectangle(0, 0, 3, 30, 4473907).setOrigin(0.5, 1);
        let bud = this.add.circle(0, -30, 6, 6710869);
        let petal1 = this.add.ellipse(-7, -33, 8, 5, 16746666).setAlpha(0).setAngle(-30);
        let petal2 = this.add.ellipse(7, -33, 8, 5, 16746666).setAlpha(0).setAngle(30);
        let petal3 = this.add.ellipse(0, -38, 5, 8, 16746666).setAlpha(0);
        flowerContainer.add([stem, bud, petal1, petal2, petal3]);
        flowerContainer.stem = stem;
        flowerContainer.bud = bud;
        flowerContainer.petals = [petal1, petal2, petal3];
        flowerContainer.isBloomed = false;
        this.flowers.push(flowerContainer);
      }
      this.fKey = this.input.keyboard.addKey("F");
      this.stumps = [];
      this.createStump(1480, 1536, 512);
      let pillar1Bottom = h - 260;
      this.wallJumpLeft = this.add.rectangle(5100, 0, 80, pillar1Bottom, 328968, 1).setOrigin(0, 0);
      let pillar2Top = 150;
      let pillar2Height = h - 110 - pillar2Top;
      this.wallJumpRight = this.add.rectangle(5300, pillar2Top, 80, pillar2Height, 328968, 1).setOrigin(0, 0);
      this.physics.add.existing(this.wallJumpLeft, true);
      this.physics.add.existing(this.wallJumpRight, true);
      this.player = this.add.rectangle(200, h - 150, 40, 80, 0, 0);
      this.physics.add.existing(this.player);
      this.player.body.setDragX(800);
      this.player.body.setMaxVelocity(400, 800);
      this.player.body.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.groundGroup);
      this.physics.add.collider(this.player, this.wallJumpLeft);
      this.physics.add.collider(this.player, this.wallJumpRight);
      this.shadow = this.add.ellipse(200, h - 110, 60, 15, 0, 0.6);
      this.aura = this.add.circle(200, h - 150, 70, 8978312, 0.15);
      this.aura.setBlendMode("ADD");
      AssetManager.generateAndSave(this, "green_circle", 50, 50, (g) => {
        g.fillStyle(16777215);
        g.fillCircle(25, 25, 25);
      });
      this.player.body.setGravityY(1200);
      this.player.body.setCollideWorldBounds(true);
      let initialColor = this.registry.get("playerColor") || 3066993;
      if (this.aura) this.aura.setFillStyle(initialColor, 0.15);
      this.playerSprite = this.add.sprite(200, h - 150, "green_circle");
      this.playerSprite.setTint(initialColor);
      this.registry.events.on("changedata-playerColor", (parent, color) => {
        if (this.playerSprite) this.playerSprite.setTint(color);
        if (this.aura) this.aura.setFillStyle(color, 0.15);
      });
      this.playerSprite.setOrigin(0.5, 1);
      this.playerSprite.baseScale = 1;
      this.playerSprite.setScale(this.playerSprite.baseScale);
      this.playerEmitter = this.add.particles(0, 0, "firefly", {
        speed: { min: -15, max: 15 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 2e3,
        blendMode: "ADD",
        frequency: 300
      });
      this.playerEmitter.startFollow(this.player);
      this.itemGroup = this.physics.add.staticGroup();
      const rItems = [
        { x: 650, y: h - 160, type: "seed" },
        { x: 1250, y: h - 160, type: "coin" },
        { x: 2350, y: h - 160, type: "seed" },
        { x: 3150, y: h - 160, type: "potion" },
        { x: 4300, y: h - 160, type: "coin" },
        { x: 5240, y: 190, type: "sun_crystal" }
      ];
      rItems.forEach((i) => {
        let item = new CollectibleItem(this, i.x, i.y, i.type);
        this.itemGroup.add(item);
      });
      this.physics.add.overlap(this.player, this.itemGroup, (player, item) => item.collect(player));
      this.physics.world.setBounds(0, 0, w * 6, h + 1500);
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      this.isCinematic = true;
      this.playerState = "none";
      this.playerTween = null;
      this.cameras.main.setBounds(0, 0, w * 6, h + 1500);
      this.cameras.main.scrollX = 0;
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: 800,
        duration: 4e3,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.tweens.add({
            targets: this.cameras.main,
            scrollX: 0,
            duration: 3e3,
            ease: "Sine.easeInOut",
            onComplete: () => {
              let msg = this.add.text(this.player.x, this.player.y - 80, "...t\xF4i l\xE0 ai?", { font: "bold 24px Arial", fill: "#ffffff" }).setOrigin(0.5);
              this.tweens.add({
                targets: msg,
                alpha: 0,
                delay: 2e3,
                duration: 1e3,
                onComplete: () => {
                  this.isCinematic = false;
                  this.registry.set("showUI", true);
                  this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -w / 4, 200);
                  let tutContainer = this.add.container(this.player.x + 300, this.player.y - 120);
                  let tutBg = this.add.rectangle(0, 0, 500, 100, 0, 0.7).setStrokeStyle(2, 65280);
                  let tutText1 = this.add.text(0, -20, "D\xF9ng c\xE1c ph\xEDm A, D (M\u0169i t\xEAn) \u0111\u1EC3 \u0111i l\u1EA1i", { font: "bold 20px Arial", fill: "#ffffff", align: "center" }).setOrigin(0.5);
                  let tutText2 = this.add.text(0, 20, "D\xF9ng ph\xEDm Space \u0111\u1EC3 Nh\u1EA3y", { font: "bold 20px Arial", fill: "#00ff00", align: "center" }).setOrigin(0.5);
                  tutContainer.add([tutBg, tutText1, tutText2]);
                  tutContainer.setAlpha(0);
                  this.tweens.add({ targets: tutContainer, alpha: 1, duration: 1e3, yoyo: true, hold: 6e3 });
                }
              });
            }
          });
        }
      });
      this.grassClumps = [];
      for (let i = 200; i < w * 6; i += Phaser.Math.Between(120, 280)) {
        if (i > 1480 && i < 2100) continue;
        let ty = this.getTerrainY(i);
        let clump = this.add.container(i, ty);
        let bladeCount = Phaser.Math.Between(3, 5);
        let blades = [];
        for (let b = 0; b < bladeCount; b++) {
          let bx = Phaser.Math.Between(-8, 8);
          let bh = Phaser.Math.Between(12, 25);
          let bw = Phaser.Math.Between(3, 5);
          let colors = [3359795, 2241314, 4469572, 3355443, 2767402];
          let color = colors[Phaser.Math.Between(0, colors.length - 1)];
          let blade = this.add.triangle(bx, 0, 0, bh, bw, bh, bw / 2, 0, color).setOrigin(0.5, 1);
          blade.origAngle = Phaser.Math.Between(-10, 10);
          blade.setAngle(blade.origAngle);
          blades.push(blade);
        }
        clump.add(blades);
        clump.blades = blades;
        clump.isSwaying = false;
        clump.hasBeenTouched = false;
        this.grassClumps.push(clump);
      }
      this.dustEmitter = this.add.particles(0, 0, "smoke", {
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        speedY: { min: -10, max: -30 },
        speedX: { min: -10, max: 10 },
        lifespan: 500,
        tint: 5592405
      });
      this.dustEmitter.stop();
      this.triggerGameOver = () => {
        if (this.isGameOvering || this.hasReachedEnd) return;
        this.isGameOvering = true;
        this.cameras.main.fadeOut(1e3, 0, 0, 0);
        this.time.delayedCall(1e3, () => {
          this.scene.start("GameOverScene", { reason: "M\xC3\xA1\xC2\xBA\xC2\xA7m \xC3\u201E\xE2\u20AC\u02DC\xC3\u0192\xC2\xA3 r\xC3\u2020\xC2\xA1i xu\xC3\xA1\xC2\xBB\xE2\u20AC\u02DCng h\xC3\xA1\xC2\xBB\xE2\u20AC\u02DC n\xC3\u2020\xC2\xB0\xC3\xA1\xC2\xBB\xE2\u20AC\xBAc \xC3\u201E\xE2\u20AC\u02DC\xC3\xA1\xC2\xBB\xE2\u201E\xA2c v\xC3\u0192\xC2\xA0 tan bi\xC3\xA1\xC2\xBA\xC2\xBFn.", retryScene: "RunnerScene" });
        });
      };
      this.physics.add.overlap(this.player, this.toxicPit, this.triggerGameOver);
      this.physics.add.overlap(this.player, this.toxicWater, this.triggerGameOver);
      this.physics.add.overlap(this.player, this.deathZone, this.triggerGameOver);
      this.highWall = this.add.rectangle(3500, h - 280, 400, 180, 0, 0).setOrigin(0, 0);
      this.physics.add.existing(this.highWall, true);
      this.physics.add.collider(this.player, this.highWall);
      AssetManager.generateAndSave(this, "map1_wall", 400, 250, (g) => {
        g.fillStyle(4869972, 1);
        g.fillRect(0, 50, 400, 180);
        g.fillStyle(6975606, 1);
        g.fillRect(0, 50, 400, 8);
        g.fillStyle(16753920, 1);
        for (let sx = 0; sx < 400; sx += 40) {
          g.beginPath();
          g.moveTo(sx, 50 + 10);
          g.lineTo(sx + 20, 50 + 10);
          g.lineTo(sx - 10, 50 + 180);
          g.lineTo(sx - 30, 50 + 180);
          g.fillPath();
        }
        g.lineStyle(2, 2237736, 0.8);
        g.beginPath();
        g.moveTo(40, 50);
        g.lineTo(50, 90);
        g.lineTo(35, 130);
        g.lineTo(60, 180);
        g.moveTo(180, 50);
        g.lineTo(170, 100);
        g.lineTo(190, 150);
        g.lineTo(175, 200);
        g.strokePath();
        g.lineStyle(3, 9127187, 1);
        g.beginPath();
        g.moveTo(100, 50);
        g.lineTo(95, 30);
        g.lineTo(105, 15);
        g.moveTo(250, 50);
        g.lineTo(260, 35);
        g.lineTo(255, 10);
        g.moveTo(320, 50);
        g.lineTo(315, 25);
        g.strokePath();
      });
      let wallX = 3500;
      let wallY = h - 280;
      this.add.image(wallX, wallY - 50, "map1_wall").setOrigin(0, 0);
      AssetManager.generateAndSave(this, "map1_box", 60, 60, (g) => {
        g.fillStyle(6045747, 1);
        g.fillRect(0, 0, 60, 60);
        g.fillStyle(7360319, 1);
        g.fillRect(2, 2, 56, 12);
        g.fillRect(2, 22, 56, 12);
        g.fillRect(2, 42, 56, 12);
        g.lineStyle(6, 4862503, 1);
        g.beginPath();
        g.moveTo(2, 2);
        g.lineTo(58, 58);
        g.strokePath();
        g.lineStyle(4, 3811100, 1);
        g.strokeRect(0, 0, 60, 60);
        g.fillStyle(1118481, 1);
        g.fillCircle(7, 7, 2);
        g.fillCircle(53, 7, 2);
        g.fillCircle(7, 53, 2);
        g.fillCircle(53, 53, 2);
      });
      this.box = this.add.rectangle(3100, h - 110, 60, 60, 0, 0).setOrigin(0.5, 1);
      this.physics.add.existing(this.box, true);
      this.boxCollider = this.physics.add.collider(this.player, this.box);
      this.boxVisuals = this.add.container(3100, h - 110);
      let boxImg = this.add.image(0, -30, "map1_box").setOrigin(0.5, 0.5);
      this.boxVisuals.add(boxImg);
      this.boxPrompt = this.add.text(0, 0, "", { font: "bold 20px Arial", fill: "#ffff00", backgroundColor: "#000000aa", padding: { x: 5, y: 5 } }).setOrigin(0.5).setAlpha(0);
      this.isAttachedToBox = false;
      this.boxOrigY = h - 110;
      AssetManager.generateAndSave(this, "map1_fg", 5500, h + 1500, (fgGraphics) => {
        fgGraphics.fillStyle(328968, 0.95);
        for (let x = 600; x < 5500; x += Phaser.Math.Between(400, 800)) {
          fgGraphics.beginPath();
          fgGraphics.moveTo(x, h + 1500);
          fgGraphics.lineTo(x, h);
          fgGraphics.lineTo(x + Phaser.Math.Between(20, 60), h - Phaser.Math.Between(30, 80));
          fgGraphics.lineTo(x + Phaser.Math.Between(80, 150), h - Phaser.Math.Between(20, 50));
          fgGraphics.lineTo(x + 200, h);
          fgGraphics.lineTo(x + 200, h + 1500);
          fgGraphics.fillPath();
          if (Math.random() > 0.5) {
            fgGraphics.lineStyle(5, 328968, 0.95);
            fgGraphics.beginPath();
            let poleStartX = x + 50;
            let poleEndX = x + Phaser.Math.Between(20, 80);
            let poleEndY = h - Phaser.Math.Between(100, 150);
            fgGraphics.moveTo(poleStartX + (poleStartX - poleEndX) * 10, h + 1500);
            fgGraphics.lineTo(poleEndX, poleEndY);
            fgGraphics.strokePath();
          }
        }
        fgGraphics.lineStyle(4, 328968, 0.9);
        for (let x = 200; x < w * 6; x += Phaser.Math.Between(500, 1e3)) {
          fgGraphics.beginPath();
          fgGraphics.moveTo(x, 0);
          let endX = x + Phaser.Math.Between(150, 400);
          let sagY = Phaser.Math.Between(50, 200);
          fgGraphics.lineTo(x + (endX - x) * 0.25, sagY * 0.75);
          fgGraphics.lineTo(x + (endX - x) * 0.5, sagY);
          fgGraphics.lineTo(x + (endX - x) * 0.75, sagY * 0.75);
          fgGraphics.lineTo(endX, 0);
          fgGraphics.strokePath();
          if (Math.random() > 0.5) {
            fgGraphics.beginPath();
            fgGraphics.moveTo(x + 50, 0);
            fgGraphics.lineTo(x + 50 + Phaser.Math.Between(-30, 30), Phaser.Math.Between(100, 300));
            fgGraphics.strokePath();
          }
        }
      });
      this.toxicWater = this.add.rectangle(7250, h + 800, 2e3, 1500, 0, 0).setOrigin(0, 0);
      this.physics.add.existing(this.toxicWater, true);
      let endLake = this.add.container(6500, h + 800).setDepth(3);
      let el1 = this.add.rectangle(0, -70, 3e3, 1500, 1703970, 0.95).setOrigin(0, 0);
      let el2 = this.add.rectangle(0, -85, 3e3, 30, 3342413, 0.7).setOrigin(0, 0);
      AssetManager.generateAndSave(this, "end_lake_surface", 3e3, 18, (g) => {
        g.fillStyle(8913066, 0.4);
        g.fillRect(0, 0, 3e3, 18);
      });
      let elG = this.add.image(0, -100, "end_lake_surface").setOrigin(0, 0);
      endLake.add([el1, el2, elG]);
      this.add.particles(0, 0, "smoke", {
        x: { min: 0, max: w * 6 },
        y: { min: 0, max: h },
        speedX: { min: -20, max: 20 },
        speedY: { min: -10, max: 10 },
        scale: { start: 3, end: 5 },
        alpha: { start: 0, end: 0.1, yoyo: true },
        lifespan: 8e3,
        frequency: 300,
        tint: 3355443
      }).setScrollFactor(1.1).setDepth(99);
    }
    update() {
      this.playerSprite.x = this.player.x;
      this.playerSprite.y = this.player.y + 40;
      this.aura.x = this.player.x;
      this.aura.y = this.player.y;
      let groundY = this.getTerrainY(this.player.x);
      this.shadow.x = this.player.x;
      this.shadow.y = groundY;
      let distToGround = groundY - (this.player.y + 40);
      if (distToGround < 0) distToGround = 0;
      let shadowScale = Math.max(0, 1 - distToGround / 200);
      this.shadow.setScale(shadowScale);
      this.shadow.setAlpha(0.6 * shadowScale);
      if (this.isCinematic) return;
      let pX = this.player.x;
      let pY = this.player.y;
      let isGrounded = this.player.body.touching.down;
      let touch = this.registry.get("touchControls");
      let isTouchLeft = !!(touch && touch.isLeft);
      let isTouchRight = !!(touch && touch.isRight);
      let isTouchJump = !!(touch && touch.isJump);
      if (touch && touch.isJump) {
        touch.isJump = false;
      }
      let isMovingLeft = this.cursors.left && this.cursors.left.isDown || this.keyA && this.keyA.isDown || isTouchLeft;
      let isMovingRight = this.cursors.right && this.cursors.right.isDown || this.keyD && this.keyD.isDown || isTouchRight;
      let isMoving = false;
      let isJumping = false;
      let isJumpPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW) || isTouchJump;
      let isSpacePressed = isJumpPressed;
      let inWallJumpZone = this.player.x > 5160 && this.player.x < 5320 && this.player.y > 150;
      if (isSpacePressed && !this.isAttachedToBox) {
        if (isGrounded) {
          this.player.body.setVelocityY(-600);
          isJumping = true;
          this.dustEmitter.explode(10, this.player.x, this.player.y + 40);
          this.lastWallJump = null;
        } else if (inWallJumpZone) {
          if (this.player.x < 5240 && this.lastWallJump !== "left") {
            this.player.body.setVelocity(400, -600);
            this.lastWallJump = "left";
            isJumping = true;
            this.dustEmitter.explode(10, this.player.x - 20, this.player.y);
          } else if (this.player.x >= 5240 && this.lastWallJump !== "right") {
            this.player.body.setVelocity(-400, -600);
            this.lastWallJump = "right";
            isJumping = true;
            this.dustEmitter.explode(10, this.player.x + 20, this.player.y);
          }
        }
      }
      let topOfTower = 160;
      if (this.player.y <= topOfTower) {
        this.lastWallJump = null;
      }
      if (inWallJumpZone && !isGrounded && this.player.y > topOfTower) {
      } else {
        if (isMovingLeft) {
          this.player.body.setVelocityX(-350);
          isMoving = true;
          this.playerSprite.setFlipX(true);
        } else if (isMovingRight) {
          this.player.body.setVelocityX(350);
          isMoving = true;
          this.playerSprite.setFlipX(false);
        } else {
          this.player.body.setVelocityX(0);
        }
      }
      if (isGrounded) {
        let slope = this.getTerrainSlope(pX);
        if (slope < -0.1 && isMovingRight) {
          this.player.body.velocity.x *= 0.5;
        } else if (slope > 0.1 && isMovingLeft) {
          this.player.body.velocity.x *= 0.5;
        }
        if (!isMovingLeft && !isMovingRight) {
          if (slope > 0.1) {
            this.player.body.velocity.x += slope * 15;
          } else if (slope < -0.1) {
            this.player.body.velocity.x += slope * 15;
          }
        } else {
          if (slope > 0.1 && isMovingRight) {
            this.player.body.velocity.x += 100;
          } else if (slope < -0.1 && isMovingLeft) {
            this.player.body.velocity.x -= 100;
          }
        }
      }
      if (isMoving && isGrounded) {
        if (!this.lastDustTime || this.time.now - this.lastDustTime > 150) {
          this.dustEmitter.emitParticleAt(this.player.x, this.player.y + 40);
          this.lastDustTime = this.time.now;
        }
      }
      let newState = "idle";
      if (!isGrounded) newState = "jump";
      else if (isMoving) newState = "walk";
      if (this.playerState !== newState) {
        this.playerState = newState;
        if (this.playerTween) this.playerTween.stop();
        this.playerSprite.setAngle(0);
        this.playerSprite.setScale(this.playerSprite.baseScale);
        if (newState === "idle") {
          this.playerTween = this.tweens.add({
            targets: this.playerSprite,
            scaleY: this.playerSprite.baseScale * 0.95,
            scaleX: this.playerSprite.baseScale * 1.05,
            duration: 1e3,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        } else if (newState === "walk") {
          this.playerTween = this.tweens.add({
            targets: this.playerSprite,
            angle: { from: -15, to: 15 },
            scaleY: this.playerSprite.baseScale * 0.9,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        } else if (newState === "jump") {
          this.playerTween = this.tweens.add({
            targets: this.playerSprite,
            scaleY: this.playerSprite.baseScale * 1.2,
            scaleX: this.playerSprite.baseScale * 0.8,
            duration: 300,
            yoyo: true,
            ease: "Quad.easeOut"
          });
        }
      }
      let px = this.player.x;
      let py = this.player.y + 40;
      let vx = this.player.body.velocity.x;
      let hitRadius = this.player.body.width / 2;
      this.grassClumps.forEach((clump) => {
        if (!clump.isSwaying && Math.abs(px - clump.x) <= hitRadius && Math.abs(py - clump.y) < 30 && Math.abs(vx) > 5) {
          clump.isSwaying = true;
          if (!clump.hasBeenTouched) {
            clump.hasBeenTouched = true;
            clump.blades.forEach((b) => b.setFillStyle(43520));
          }
          let swayDir = vx > 0 ? 1 : -1;
          clump.blades.forEach((blade, idx) => {
            let delay = idx * 50;
            let swayAngle = blade.origAngle + swayDir * Phaser.Math.Between(25, 45);
            this.tweens.add({
              targets: blade,
              angle: swayAngle,
              duration: 150,
              delay,
              ease: "Quad.easeOut",
              yoyo: true,
              repeat: 1,
              onComplete: () => {
                blade.setAngle(blade.origAngle);
                if (idx === clump.blades.length - 1) {
                  clump.isSwaying = false;
                }
              }
            });
          });
        }
      });
      this.flowers.forEach((flower) => {
        if (!flower.isBloomed && Math.abs(px - flower.x) <= hitRadius && Math.abs(py - flower.y) < 30) {
          flower.isBloomed = true;
          flower.stem.setFillStyle(2263091);
          flower.bud.setFillStyle(16763904);
          flower.petals.forEach((petal, idx) => {
            this.tweens.add({
              targets: petal,
              alpha: 1,
              scaleX: 1.5,
              scaleY: 1.5,
              duration: 400,
              delay: idx * 100,
              ease: "Back.easeOut"
            });
          });
          let emitter = this.add.particles(flower.x, flower.y - 30, "firefly", {
            speed: { min: -50, max: 50 },
            scale: { start: 1, end: 0 },
            lifespan: 2e3,
            blendMode: "ADD"
          });
          emitter.explode(10);
        }
      });
      let distToBox = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.box.x, this.box.y - 30);
      let isNearBox = distToBox < 100;
      if (this.isAttachedToBox) {
        this.boxCollider.active = false;
        this.player.body.setMaxVelocityX(150);
        let wallLeftEdge = 3500;
        let boxHalfW = 30;
        let playerHalfW = 20;
        let boxTargetX;
        if (this.boxSide === "right") {
          boxTargetX = this.player.x + 50;
        } else {
          boxTargetX = this.player.x - 50;
        }
        let boxMaxX = wallLeftEdge - boxHalfW;
        let boxMinX = boxHalfW;
        boxTargetX = Phaser.Math.Clamp(boxTargetX, boxMinX, boxMaxX);
        this.box.setPosition(boxTargetX, this.boxOrigY);
        this.box.body.updateFromGameObject();
        this.boxVisuals.setPosition(boxTargetX, this.boxOrigY);
        if (this.boxSide === "right" && this.player.x > boxTargetX - 50) {
          this.player.x = boxTargetX - 50;
          this.player.body.setVelocityX(0);
        } else if (this.boxSide === "left" && this.player.x < boxTargetX + 50) {
          this.player.x = boxTargetX + 50;
          this.player.body.setVelocityX(0);
        }
        this.boxPrompt.x = this.box.x;
        this.boxPrompt.y = this.box.y - 80;
        this.boxPrompt.setText("B\u1EA5m F \u0111\u1EC3 Bu\xF4ng ra");
        this.boxPrompt.setAlpha(1);
        if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
          this.isAttachedToBox = false;
          this.player.body.setMaxVelocityX(400);
          this.boxCollider.active = true;
        }
      } else if (isNearBox) {
        this.boxPrompt.x = this.box.x;
        this.boxPrompt.y = this.box.y - 80;
        this.boxPrompt.setText("B\u1EA5m F \u0111\u1EC3 C\u1EA7m h\u1ED9p");
        this.boxPrompt.setAlpha(1);
        if (Phaser.Input.Keyboard.JustDown(this.fKey) && this.player.body.onFloor()) {
          this.isAttachedToBox = true;
          this.boxSide = this.box.x > this.player.x ? "right" : "left";
        }
      } else {
        this.boxPrompt.setAlpha(0);
      }
      if (this.stumps) {
        this.stumps.forEach((stumpObj) => {
          let stump = stumpObj.container;
          let prompt = stumpObj.prompt;
          let isNearStump = !stump.isBloomed && Math.abs(px - stump.x) <= hitRadius * 3 && Math.abs(py - stump.y) < 40;
          if (isNearStump) {
            prompt.setAlpha(1);
            if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
              stump.isBloomed = true;
              prompt.setAlpha(0);
              let moss1 = this.add.ellipse(-6, -18, 14, 7, 1730099, 0.5);
              let moss2 = this.add.ellipse(8, -30, 10, 5, 2258756, 0.4);
              let leaf1 = this.add.triangle(18, -45, 0, 14, 16, 7, 8, 0, 2984526).setOrigin(0.5, 1).setAngle(25);
              let leaf2 = this.add.triangle(-12, -48, 0, 12, 14, 6, 7, 0, 4039517).setOrigin(0.5, 1).setAngle(-20);
              stump.add([moss1, moss2, leaf1, leaf2]);
              [moss1, moss2, leaf1, leaf2].forEach((item, i) => {
                item.setScale(0);
                this.tweens.add({ targets: item, scale: 1, duration: 500, delay: i * 120, ease: "Back.easeOut" });
              });
              let bridgeY = this.cameras.main.height - 112;
              let bridgeImg = this.add.image(stump.bridgeStartX, bridgeY - 20, "map1_vine_bridge").setOrigin(0, 0);
              bridgeImg.setCrop(0, 0, 0, 100);
              bridgeImg.setDisplaySize(stump.bridgeLength, 100);
              let drawObj = { w: 0 };
              this.tweens.add({
                targets: drawObj,
                w: stump.bridgeLength,
                duration: 1500,
                ease: "Linear",
                onUpdate: () => {
                  let progress = drawObj.w / stump.bridgeLength;
                  bridgeImg.setCrop(0, 0, 750 * progress, 100);
                },
                onComplete: () => {
                  allLeaves.forEach((leaf, i) => {
                    this.tweens.add({
                      targets: leaf,
                      alpha: 0.85,
                      scale: 1,
                      duration: 300,
                      delay: i * 30,
                      ease: "Back.easeOut"
                    });
                  });
                }
              });
              let allLeaves = [];
              for (let lx = 50; lx < stump.bridgeLength; lx += Phaser.Math.Between(30, 70)) {
                let progress = lx / stump.bridgeLength;
                let curveY = Math.sin(progress * Math.PI) * 25;
                let leaf = this.add.ellipse(stump.bridgeStartX + lx, bridgeY + curveY + 5 + Phaser.Math.Between(0, 15), 10, 20, 5227117).setOrigin(0.5, 0).setAlpha(0);
                if (Math.random() > 0.5) leaf.setAngle(Phaser.Math.Between(-30, 30));
                allLeaves.push(leaf);
              }
              let bridgePhysics = this.add.rectangle(stump.bridgeStartX, bridgeY + 2, stump.bridgeLength, 200, 0, 0).setOrigin(0, 0);
              this.physics.add.existing(bridgePhysics, true);
              this.physics.add.collider(this.player, bridgePhysics);
              let emitter = this.add.particles(stump.bridgeStartX, bridgeY + 2, "firefly", {
                speed: { min: -80, max: 80 },
                scale: { start: 0.8, end: 0 },
                lifespan: 2500,
                blendMode: "ADD"
              });
              emitter.explode(25);
            }
          } else {
            prompt.setAlpha(0);
          }
        });
      }
      if (this.player.x > 3950 && this.player.body.touching.down && !this.hasTriggeredArtillery) {
        this.hasTriggeredArtillery = true;
        this.isCinematic = true;
        this.player.body.setAccelerationX(0);
        this.player.body.setVelocityX(0);
        this.player.body.setVelocityY(0);
        this.cameras.main.stopFollow();
        this.tweens.add({
          targets: this.cameras.main,
          scrollX: 4200 - this.cameras.main.width / 2,
          duration: 1e3,
          ease: "Quad.easeInOut",
          onComplete: () => {
            this.triggerArtilleryStrike();
          }
        });
      }
      const w = this.cameras.main.width;
      if (this.player.x > 7250 && !this.hasReachedEnd && this.cratersCreated) {
        this.hasReachedEnd = true;
        this.isCinematic = true;
        this.player.body.setAccelerationX(0);
        this.player.body.setVelocityX(0);
        this.showChoiceUI();
      }
    }
    showChoiceUI() {
      const cx = this.cameras.main.scrollX + this.cameras.main.width / 2;
      const cy = this.cameras.main.scrollY + this.cameras.main.height / 2;
      let bg = this.add.rectangle(cx, cy, 500, 250, 0, 0.8).setStrokeStyle(2, 16777215);
      let text = this.add.text(cx, cy - 50, "Qu\xEA h\u01B0\u01A1ng \u0111\xE3 \xF4 nhi\u1EC5m n\u1EB7ng n\u1EC1...\nB\u1EA1n c\xF3 mu\u1ED1n \u1EDF l\u1EA1i?", { font: "bold 24px Arial", fill: "#ffffff", align: "center" }).setOrigin(0.5);
      let btnNo = this.add.rectangle(cx - 100, cy + 50, 120, 50, 11141120).setInteractive();
      let txtNo = this.add.text(cx - 100, cy + 50, "R\u1EDCI \u0110I", { font: "bold 20px Arial", fill: "#ffffff" }).setOrigin(0.5);
      btnNo.on("pointerdown", () => {
        this.cameras.main.fadeOut(1e3, 0, 0, 0);
        this.time.delayedCall(1e3, () => {
          this.scene.start("MapSelectionScene");
        });
      });
      let btnYes = this.add.rectangle(cx + 100, cy + 50, 120, 50, 43520).setInteractive();
      let txtYes = this.add.text(cx + 100, cy + 50, "\u1EDE L\u1EA0I", { font: "bold 20px Arial", fill: "#ffffff" }).setOrigin(0.5);
      btnYes.on("pointerdown", () => {
        this.cameras.main.fadeOut(1e3, 0, 0, 0);
        this.time.delayedCall(1e3, () => {
          this.scene.start("GameOverScene", { reason: "M\xC3\xA1\xC2\xBA\xC2\xA7m \xC3\u201E\xE2\u20AC\u02DC\xC3\u0192\xC2\xA3 b\xC3\xA1\xC2\xBB\xE2\u20AC\xB9 n\xC3\u2020\xC2\xB0\xC3\xA1\xC2\xBB\xE2\u20AC\xBAc \xC3\u201E\xE2\u20AC\u02DC\xC3\xA1\xC2\xBB\xE2\u201E\xA2c \xC3\u201E\xC6\u2019n m\xC3\u0192\xC2\xB2n v\xC3\u0192\xC2\xA0 ch\xC3\xA1\xC2\xBA\xC2\xBFt kh\xC3\u0192\xC2\xB4 c\xC3\u0192\xC2\xB9ng qu\xC3\u0192\xC2\xAA h\xC3\u2020\xC2\xB0\xC3\u2020\xC2\xA1ng.", retryScene: "RunnerScene" });
        });
      });
    }
    triggerArtilleryStrike() {
      let h = this.cameras.main.height;
      let w = this.cameras.main.width;
      let p1X = 4300;
      let p2X = 4600;
      this.cameras.main.shake(1e3, 5e-3);
      let msg = this.add.text(this.player.x, this.player.y - 80, "C\xE1i g\xEC v\u1EADy?", { font: "bold 24px Arial", fill: "#ffffff" }).setOrigin(0.5);
      this.time.delayedCall(1500, () => {
        msg.destroy();
        let shell1 = this.add.rectangle(p1X, -100, 10, 30, 16755200);
        let shell2 = this.add.rectangle(p2X, -200, 10, 30, 16755200);
        this.tweens.add({
          targets: shell1,
          y: h - 110,
          duration: 500,
          ease: "Linear",
          onComplete: () => {
            shell1.destroy();
            this.cameras.main.shake(500, 0.02);
            this.dustEmitter.explode(50, p1X, h - 110);
          }
        });
        this.tweens.add({
          targets: shell2,
          y: h - 110,
          duration: 600,
          ease: "Linear",
          onComplete: () => {
            shell2.destroy();
            this.cameras.main.shake(800, 0.03);
            this.dustEmitter.explode(80, p2X, h - 110);
            this.cratersCreated = true;
            this.rebuildTerrain();
            this.createStump(4050, 4100, 750);
            let floodContainer = this.add.container(4150, h + 200).setDepth(3);
            let w1 = this.add.rectangle(0, -70, 1e3, 400, 1703970, 0.95).setOrigin(0, 0);
            let w2 = this.add.rectangle(0, -85, 1e3, 30, 3342413, 0.7).setOrigin(0, 0);
            let wG = this.add.graphics();
            wG.fillStyle(8913066, 0.4);
            wG.fillRect(0, -100, 1e3, 18);
            wG.fillStyle(11154380, 0.25);
            wG.fillRect(0, -102, 1e3, 6);
            floodContainer.add([w1, w2, wG]);
            for (let rx = 20; rx < 980; rx += Phaser.Math.Between(30, 70)) {
              let shimmer = this.add.ellipse(rx, -96, Phaser.Math.Between(15, 40), 3, 13395711, 0.3);
              this.tweens.add({ targets: shimmer, alpha: 0.05, duration: Phaser.Math.Between(1e3, 2e3), yoyo: true, repeat: -1 });
              floodContainer.add(shimmer);
            }
            this.tweens.add({
              targets: floodContainer,
              y: h + 40,
              // Di chuyÃ¡Â»Æ’n y sao cho bÃ¡Â»Â mÃ¡ÂºÂ·t nÃ†Â°Ã¡Â»â€ºc nÃ¡ÂºÂ±m Ã¡Â»Å¸ h - 60
              duration: 3500,
              ease: "Sine.easeOut",
              onComplete: () => {
                this.floodZone = this.add.rectangle(4150, h - 40, 1e3, 200, 0, 0).setOrigin(0, 0);
                this.physics.add.existing(this.floodZone, true);
                this.physics.add.overlap(this.player, this.floodZone, this.triggerGameOver);
                this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -this.cameras.main.width / 4, 200);
                this.isCinematic = false;
              }
            });
          }
        });
      });
    }
    rebuildTerrain() {
      let h = this.cameras.main.height;
      let w = this.cameras.main.width;
      this.groundGraphics.clear();
      this.groundGraphics.fillStyle(16777215, 1);
      this.groundGraphics.beginPath();
      this.groundGraphics.moveTo(0, h + 1500);
      for (let x = 0; x <= w * 6; x += 10) {
        let ty = this.getTerrainY(x);
        if (x > 1536 && x <= 2048) this.groundGraphics.lineTo(x, h + 1500);
        else this.groundGraphics.lineTo(x, ty);
      }
      this.groundGraphics.lineTo(w * 6, h + 1500);
      this.groundGraphics.fillPath();
      this.borderGraphics.clear();
      this.borderGraphics.lineStyle(4, 1710626, 1);
      this.borderGraphics.beginPath();
      let firstBorder = true;
      for (let x = 0; x <= w * 6; x += 20) {
        let ty = this.getTerrainY(x);
        if (x > 1536 && x <= 2048) {
          firstBorder = true;
        } else {
          if (firstBorder) {
            this.borderGraphics.moveTo(x, ty);
            firstBorder = false;
          } else this.borderGraphics.lineTo(x, ty);
        }
      }
      this.borderGraphics.strokePath();
      this.groundGroup.clear(true, true);
      for (let x = 0; x <= w * 6; x += 20) {
        let ty = this.getTerrainY(x);
        if (!(x > 1536 && x <= 2048)) {
          let rect = this.add.rectangle(x, ty, 20, h + 1500 - ty, 0, 0).setOrigin(0, 0);
          this.physics.add.existing(rect, true);
          this.groundGroup.add(rect);
        }
      }
      if (this.grassClumps) {
        this.grassClumps.forEach((clump) => {
          if (clump.x > 4e3 && clump.x < 4800) {
            clump.destroy();
          }
        });
        this.grassClumps = this.grassClumps.filter((c) => c.active);
      }
      if (this.flowers) {
        this.flowers.forEach((clump) => {
          if (clump.x > 4e3 && clump.x < 4800) {
            clump.destroy();
          }
        });
        this.flowers = this.flowers.filter((c) => c.active);
      }
    }
    getTerrainY(x) {
      let h = this.cameras.main.height;
      let w = this.cameras.main.width;
      let baseY = h - 110;
      if (x > 1536 && x <= 2048) {
        return h + 1e3;
      }
      if (x >= 5500 && x <= 7500) {
        let t = (x - 5500) / 2e3;
        return baseY + t * 1e3;
      }
      if (x > 7500) {
        return baseY + 1e3;
      }
      if (x < 3900 || !this.cratersCreated) return baseY;
      let offset = 0;
      if (x >= 4100 && x <= 4800) {
        let t = (x - 4100) / 700;
        offset = Math.sin(t * Math.PI) * 120;
      }
      return baseY + offset;
    }
    getTerrainSlope(x) {
      let y1 = this.getTerrainY(x - 5);
      let y2 = this.getTerrainY(x + 5);
      return (y2 - y1) / 10;
    }
    createStump(x, bridgeStartX, bridgeLength) {
      let h = this.cameras.main.height;
      let stumpContainer = this.add.container(x, h - 110);
      let trunk = this.add.rectangle(0, 0, 30, 50, 5583633).setOrigin(0.5, 1);
      let bark1 = this.add.rectangle(-5, -15, 4, 15, 4465152).setOrigin(0.5, 1);
      let bark2 = this.add.rectangle(6, -8, 3, 10, 4465152).setOrigin(0.5, 1);
      let root1 = this.add.triangle(-18, 0, 0, 8, 20, 8, 10, 0, 4469538).setOrigin(0.5, 1);
      let root2 = this.add.triangle(18, 0, 20, 8, 0, 8, 10, 0, 4469538).setOrigin(0.5, 1);
      let branch = this.add.rectangle(12, -40, 15, 3, 6702114).setOrigin(0, 0.5).setAngle(30);
      stumpContainer.add([root1, root2, trunk, bark1, bark2, branch]);
      stumpContainer.isBloomed = false;
      stumpContainer.bridgeStartX = bridgeStartX;
      stumpContainer.bridgeLength = bridgeLength;
      let prompt = this.add.text(x, h - 200, "B\u1EA5m F \u0111\u1EC3 h\u1ED3i sinh g\u1ED1c c\xE2y", { font: "bold 18px Arial", fill: "#ffffff", backgroundColor: "#000000aa", padding: { x: 8, y: 5 } }).setOrigin(0.5).setAlpha(0);
      this.stumps = this.stumps || [];
      this.stumps.push({ container: stumpContainer, prompt });
    }
  };

  // src/scenes/DialogueScene.js
  var DialogueScene = class extends Phaser.Scene {
    constructor() {
      super("DialogueScene");
    }
    init(data) {
      this.nextScene = data.nextScene || "SurvivalScene";
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      this.registry.set("showUI", true);
      this.ground = this.add.rectangle(0, h - 50, w, 100, 4469538).setOrigin(0, 0);
      this.npc = this.add.rectangle(w - 300, h - 140, 60, 180, 4474111);
      this.add.text(w - 300, h - 250, "NPC / Tr\xC6\xB0\xE1\xBB\u0178ng l\xC3\xA0ng", { fill: "#fff" }).setOrigin(0.5);
      this.player = this.add.rectangle(-100, h - 90, 40, 80, 6750054);
      this.dialogBox = this.add.rectangle(w / 2, h - 150, 800, 150, 2236962).setStrokeStyle(4, 16777215).setAlpha(0);
      this.dialogText = this.add.text(w / 2 - 350, h - 200, "", { font: "24px Arial", fill: "#fff", wordWrap: { width: 700 } }).setAlpha(0);
      this.tweens.add({
        targets: this.player,
        x: 400,
        duration: 2e3,
        ease: "Power2",
        onComplete: () => this.showDialogue()
      });
    }
    showDialogue() {
      this.tweens.add({ targets: [this.dialogBox, this.dialogText], alpha: 1, duration: 500 });
      let fullText = "";
      let choices = [];
      if (this.nextScene === "SurvivalScene") {
        fullText = "Ng\xC6\xB0\xC6\xA1i c\xC3\xB3 h\xC3\xACnh h\xC3\xA0i k\xE1\xBB\xB3 l\xE1\xBA\xA1 qu\xC3\xA1... H\xC3\xA3y \xE1\xBB\u0178 l\xE1\xBA\xA1i \xC4\u2018\xC3\xA2y, nh\xC6\xB0ng ng\xC6\xB0\xC6\xA1i ph\xE1\xBA\xA3i g\xE1\xBB\x8Dt \xC4\u2018\xE1\xBA\xBDo b\xE1\xBA\xA3n th\xC3\xA2n \xC4\u2018\xE1\xBB\u0192 tr\xE1\xBB\u0178 n\xC3\xAAn gi\xE1\xBB\u2018ng ch\xC3\xBAng ta!";
        choices = [
          { text: "\xC4\x90\xE1\xBB\u201Cng \xC3\xBD (L\xE1\xBB\xB1a ch\xE1\xBB\x8Dn sai)", action: () => this.goto("GameOverScene", { reason: "M\xE1\xBA\xA7m ch\xE1\xBA\xA5p nh\xE1\xBA\xADn bi\xE1\xBA\xBFn ch\xE1\xBA\xA5t v\xC3\xA0 \xC4\u2018\xC3\xA1nh m\xE1\xBA\xA5t ch\xC3\xADnh m\xC3\xACnh." }) },
          { text: "T\xE1\xBB\xAB ch\xE1\xBB\u2018i", action: () => this.goto("SurvivalScene") }
        ];
      } else {
        fullText = "Ch\xC3\xA0o m\xE1\xBB\xABng b\xE1\xBA\xA1n \xC4\u2018\xE1\xBA\xBFn v\xE1\xBB\u203Ai v\xC3\xB9ng \xC4\u2018\xE1\xBA\xA5t m\xE1\xBB\u203Ai. B\xE1\xBA\xA1n \xC4\u2018\xC3\xA3 v\xC6\xB0\xE1\xBB\xA3t qua sa m\xE1\xBA\xA1c. B\xE1\xBA\xA1n c\xC3\xB3 mu\xE1\xBB\u2018n \xE1\xBB\u0178 l\xE1\xBA\xA1i \xC4\u2018\xC3\xA2y kh\xC3\xB4ng?";
        choices = [
          { text: "R\xE1\xBB\x9Di \xC4\u2018i", action: () => this.goto("MapScene") },
          { text: "\xE1\xBB\u017E l\xE1\xBA\xA1i", action: () => this.goto("EndingScene") }
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
        let btn = this.add.text(w / 2 - 200 + index * 400, h - 100, `[ ${choice.text} ]`, { font: "24px Arial", fill: "#ff0", backgroundColor: "#555" }).setPadding(10).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on("pointerdown", choice.action);
      });
    }
    goto(sceneKey, data) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start(sceneKey, data);
      });
    }
  };

  // src/scenes/SurvivalScene.js
  var SurvivalScene = class extends Phaser.Scene {
    constructor() {
      super("SurvivalScene");
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      this.cameras.main.setBackgroundColor("#ffbb77");
      this.physics.world.setBounds(0, 0, w * 3, h);
      this.registry.set("showUI", true);
      this.registry.set("showSurvival", true);
      this.ground = this.add.rectangle(0, h - 50, w * 3, 100, 11167266).setOrigin(0, 0);
      this.physics.add.existing(this.ground, true);
      this.sunOverlay = this.add.rectangle(0, 0, w * 3, h, 16755200, 0.2).setOrigin(0, 0);
      this.shades = this.physics.add.staticGroup();
      this.createPagoda(600, h - 50);
      this.createPagoda(1500, h - 50);
      this.createPagoda(2600, h - 50);
      this.player = this.add.rectangle(100, h - 100, 40, 80, 6750054);
      this.physics.add.existing(this.player);
      this.player.body.setGravityY(1e3);
      this.physics.add.collider(this.player, this.ground);
      this.cameras.main.setBounds(0, 0, w * 3, h);
      this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -w / 4, 200);
      this.add.text(w / 2, 50, "C\xE1\xBA\xA3nh 17: Ch\xE1\xBA\xA1y tr\xE1\xBB\u2018n kh\xE1\xBB\x8Fi m\xE1\xBA\xB7t tr\xE1\xBB\x9Di! N\xE1\xBA\xA5p v\xC3\xA0o c\xC3\xA1c m\xC3\xA1i \xC4\u2018\xC3\xACnh (b\xC3\xB3ng r\xC3\xA2m).", { fontSize: "24px", fill: "#000", backgroundColor: "#fff" }).setOrigin(0.5).setScrollFactor(0);
      this.cursors = this.input.keyboard.createCursorKeys();
      this.registry.set("showUI", true);
    }
    createPagoda(x, y) {
      this.add.rectangle(x, y - 60, 20, 120, 3351057);
      this.add.rectangle(x + 160, y - 60, 20, 120, 3351057);
      this.add.triangle(x + 80, y - 120, 0, 60, 80, 0, 160, 60, 11149858).setScale(1.5);
      let shade = this.add.rectangle(x + 80, y - 60, 160, 120, 0, 0.4);
      this.shades.add(shade);
    }
    update() {
      if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(350);
      } else if (this.cursors.left.isDown) {
        this.player.body.setVelocityX(-350);
      } else {
        this.player.body.setVelocityX(0);
      }
      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.body.setVelocityY(-500);
      }
      let inShade = false;
      this.physics.overlap(this.player, this.shades, () => {
        inShade = true;
      });
      let sun = this.registry.get("sun");
      let water = this.registry.get("water");
      if (inShade) {
        sun = Math.max(0, sun - 0.05);
        this.player.setFillStyle(6750054);
      } else {
        sun = Math.min(100, sun + 0.1);
        water = Math.max(0, water - 0.02);
        this.player.setFillStyle(16746598);
      }
      this.registry.set("sun", sun);
      this.registry.set("water", water);
      if (this.player.x > this.physics.world.bounds.width - 100) {
        this.registry.set("showUI", false);
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start("TextTransitionScene", {
            text: "C\xE1\xBA\xA3nh 18 & 20\nB\xE1\xBA\xA1n ch\xE1\xBB\x8Dn r\xE1\xBB\x9Di \xC4\u2018i?\n...\nHay \xE1\xBB\u0178 l\xE1\xBA\xA1i?",
            nextScene: "DialogueScene",
            nextData: { nextScene: "EndingScene" }
          });
        });
      }
    }
  };

  // src/scenes/EndingScene.js
  var EndingScene = class extends Phaser.Scene {
    constructor() {
      super("EndingScene");
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.videoPlaceholder = this.add.rectangle(w / 2, h / 2 - 100, 800, 450, 4474026);
      this.add.text(w / 2, h / 2 - 100, "[ CUTSCENE VIDEO ]\nM\xE1\xBA\xA7m \xC4\u2018\xC6\xB0\xE1\xBB\xA3c ch\xC3\xA0o \xC4\u2018\xC3\xB3n trong m\xC3\xB4i tr\xC6\xB0\xE1\xBB\x9Dng m\xE1\xBB\u203Ai\nM\xE1\xBA\xA7m nh\xC3\xACn tay m\xC3\xACnh b\xE1\xBB\u2018i r\xE1\xBB\u2018i.", { font: "28px Arial", fill: "#fff", align: "center" }).setOrigin(0.5);
      this.time.delayedCall(3e3, () => {
        this.add.text(w / 2, h - 100, "T\xC3\u201DI L\xC3\u20AC AI?", { font: "bold 64px Arial", fill: "#ffffff" }).setOrigin(0.5);
      });
    }
  };

  // src/scenes/GameOverScene.js
  var GameOverScene = class extends Phaser.Scene {
    constructor() {
      super("GameOverScene");
    }
    init(data) {
      this.reason = data.reason || "B\u1EA1n \u0111\xE3 ch\u1EBFt.";
      this.win = data.win || false;
      this.retryScene = data.retryScene || "RunnerScene";
    }
    create() {
      this.scene.bringToTop();
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.cameras.main.setBackgroundColor(this.win ? "#003300" : "#880000");
      let title = this.win ? "S\u1ED0NG S\xD3T" : "GAME OVER";
      this.add.text(w / 2, h / 2 - 60, title, {
        font: "bold 64px Arial",
        fill: "#ffffff"
      }).setOrigin(0.5);
      if (!this.win) {
        this.add.text(w / 2, h / 2 + 20, this.reason, {
          font: "28px Arial",
          fill: "#ffcccc"
        }).setOrigin(0.5);
      }
      let btnText = this.win ? "R\u1EDDi \u0111i" : "Th\u1EED l\u1EA1i";
      let btn = this.add.text(w / 2, h / 2 + 120, btnText, {
        font: "bold 32px Arial",
        fill: "#ffff00",
        backgroundColor: "#000000aa",
        padding: { x: 30, y: 12 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on("pointerover", () => btn.setStyle({ fill: "#00ffcc" }));
      btn.on("pointerout", () => btn.setStyle({ fill: "#ffff00" }));
      btn.on("pointerdown", () => {
        if (this.win) {
          this.scene.start("MapSelectionScene");
        } else {
          this.scene.start(this.retryScene);
        }
      });
    }
  };

  // src/scenes/MenuScene.js
  var MenuScene = class extends Phaser.Scene {
    constructor() {
      super("MenuScene");
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.add.text(w / 2, h / 3, "M\u1EA6M: H\xC0NH TR\xCCNH T\xCCM N\u1EAENG", { font: "bold 60px Arial", fill: "#66ff66" }).setOrigin(0.5);
      let startBtn = this.add.text(w / 2, h / 2 - 40, "B\u1EAET \u0110\u1EA6U T\u1EEA M\xC0N 1", { font: "bold 40px Arial", fill: "#fff" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      startBtn.on("pointerdown", () => {
        try {
          if (!this.scale.isFullscreen && this.scale.startFullscreen) {
            this.scale.startFullscreen();
          }
        } catch (e) {
        }
        this.registry.set("health", 100);
        this.registry.set("water", 50);
        this.registry.set("sun", 50);
        this.registry.set("psyche", 100);
        this.scene.launch("UIScene");
        this.scene.start("RunnerScene");
      });
      startBtn.on("pointerover", () => startBtn.setFill("#ffff00"));
      startBtn.on("pointerout", () => startBtn.setFill("#fff"));
      let mapSelectBtn = this.add.text(w / 2, h / 2 + 40, "CH\u1ECCN M\xC0N CH\u01A0I", { font: "bold 40px Arial", fill: "#fff" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      mapSelectBtn.on("pointerdown", () => {
        this.scene.start("MapSelectionScene");
      });
      mapSelectBtn.on("pointerover", () => mapSelectBtn.setFill("#00ffff"));
      mapSelectBtn.on("pointerout", () => mapSelectBtn.setFill("#fff"));
      let exitBtn = this.add.text(w / 2, h / 2 + 120, "THO\xC1T GAME", { font: "bold 40px Arial", fill: "#fff" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      exitBtn.on("pointerdown", () => window.close());
      exitBtn.on("pointerover", () => exitBtn.setFill("#ff0000"));
      exitBtn.on("pointerout", () => exitBtn.setFill("#fff"));
    }
  };

  // src/scenes/PauseScene.js
  var PauseScene = class extends Phaser.Scene {
    constructor() {
      super("PauseScene");
    }
    create(data) {
      this.scene.bringToTop();
      this.pausedScene = data.scene;
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.add.rectangle(0, 0, w, h, 0, 0.8).setOrigin(0);
      this.add.text(w / 2, h / 3 - 50, "T\u1EA0M D\u1EEANG", { font: "bold 60px Arial", fill: "#fff" }).setOrigin(0.5);
      let resBtn = this.add.text(w / 2, h / 2, "TI\u1EBEP T\u1EE4C", { font: "bold 40px Arial", fill: "#fff" }).setOrigin(0.5).setInteractive();
      resBtn.on("pointerdown", () => {
        this.scene.resume(this.pausedScene);
        this.scene.stop();
      });
      resBtn.on("pointerover", () => resBtn.setFill("#ffff00"));
      resBtn.on("pointerout", () => resBtn.setFill("#fff"));
      let menuBtn = this.add.text(w / 2, h / 2 + 80, "V\u1EC0 MENU CH\xCDNH", { font: "bold 40px Arial", fill: "#fff" }).setOrigin(0.5).setInteractive();
      menuBtn.on("pointerdown", () => {
        this.scene.stop(this.pausedScene);
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      menuBtn.on("pointerover", () => menuBtn.setFill("#ffff00"));
      menuBtn.on("pointerout", () => menuBtn.setFill("#fff"));
      let exitBtn = this.add.text(w / 2, h / 2 + 160, "THO\xC1T GAME", { font: "bold 40px Arial", fill: "#fff" }).setOrigin(0.5).setInteractive();
      exitBtn.on("pointerdown", () => window.close());
      exitBtn.on("pointerover", () => exitBtn.setFill("#ff0000"));
      exitBtn.on("pointerout", () => exitBtn.setFill("#fff"));
      this.input.keyboard.on("keydown-ESC", () => {
        this.scene.resume(this.pausedScene);
        this.scene.stop();
      });
    }
  };

  // src/scenes/TextTransitionScene.js
  var TextTransitionScene = class extends Phaser.Scene {
    constructor() {
      super("TextTransitionScene");
    }
    init(data) {
      this.text = data.text || "";
      this.nextScene = data.nextScene || "MapScene";
      this.nextData = data.nextData || {};
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      let t = this.add.text(w / 2, h / 2, this.text, { font: "40px Arial", fill: "#fff", align: "center" }).setOrigin(0.5);
      t.setAlpha(0);
      this.tweens.add({
        targets: t,
        alpha: 1,
        duration: 1500,
        ease: "Linear",
        yoyo: true,
        hold: 2e3,
        onComplete: () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.time.delayedCall(500, () => this.scene.start(this.nextScene, this.nextData));
        }
      });
    }
  };

  // src/ui/TouchControls.js
  var TouchControls = class extends Phaser.GameObjects.Container {
    constructor(scene) {
      super(scene, 0, 0);
      scene.add.existing(this);
      this.setScrollFactor(0);
      this.setDepth(2400);
      scene.input.addPointer(3);
      this.isLeft = false;
      this.isRight = false;
      this.isJump = false;
      this.isInteract = false;
      const w = scene.cameras.main.width;
      const h = scene.cameras.main.height;
      let btnY = h - 85;
      let leftX = 85;
      let rightX = 205;
      let btnRadius = 42;
      this.btnLeft = this.createTouchButton(leftX, btnY, btnRadius, "\u25C4", 3094080, () => {
        this.isLeft = true;
      }, () => {
        this.isLeft = false;
      });
      this.btnRight = this.createTouchButton(rightX, btnY, btnRadius, "\u25BA", 3094080, () => {
        this.isRight = true;
      }, () => {
        this.isRight = false;
      });
      let jumpX = w - 90;
      let jumpY = h - 90;
      let jumpRadius = 48;
      this.btnJump = this.createTouchButton(jumpX, jumpY, jumpRadius, "\u2B06", 53971, () => {
        this.isJump = true;
      }, () => {
        this.isJump = false;
      }, 1976110);
      let interactX = w - 90;
      let interactY = h - 205;
      let interactRadius = 38;
      this.btnInteract = this.createTouchButton(interactX, interactY, interactRadius, "\u{1F4AC} F", 15105570, () => {
        this.isInteract = true;
        if (scene.fKey) {
          scene.input.keyboard.emit("keydown-F");
        }
      }, () => {
        this.isInteract = false;
      }, "#ffffff");
      this.add([this.btnLeft, this.btnRight, this.btnJump, this.btnInteract]);
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0 || scene.sys.game.device.input.touch;
      this.setVisible(isTouchDevice);
    }
    createTouchButton(x, y, radius, label, color, onDown, onUp, textColor = "#ffffff") {
      let container = this.scene.add.container(x, y);
      let circle = this.scene.add.circle(0, 0, radius, color, 0.75).setStrokeStyle(3, 16777215, 0.8).setInteractive({ useHandCursor: true });
      let text = this.scene.add.text(0, 0, label, {
        font: "bold 24px Arial",
        fill: textColor
      }).setOrigin(0.5);
      container.add([circle, text]);
      circle.on("pointerdown", () => {
        circle.setFillStyle(4774907, 0.95);
        container.setScale(0.92);
        onDown();
      });
      circle.on("pointerup", () => {
        circle.setFillStyle(color, 0.75);
        container.setScale(1);
        onUp();
      });
      circle.on("pointerout", () => {
        circle.setFillStyle(color, 0.75);
        container.setScale(1);
        onUp();
      });
      return container;
    }
  };

  // src/ui/InventoryPopup.js
  var OUTFIT_COLORS = [
    { name: "Xanh L\xE1 (G\u1ED1c)", color: 3066993, hex: "#2ecc71" },
    { name: "\u0110\u1ECF L\u1EEDa", color: 15158332, hex: "#e74c3c" },
    { name: "Xanh Bi\u1EC3n", color: 3447003, hex: "#3498db" },
    { name: "V\xE0ng N\u1EAFng", color: 15844367, hex: "#f1c40f" },
    { name: "T\xEDm N\u1EA5m", color: 10181046, hex: "#9b59b6" },
    { name: "Tr\u1EAFng Tuy\u1EBFt", color: 15528177, hex: "#ecf0f1" },
    { name: "B\xF3ng \u0110\xEAm", color: 3426654, hex: "#34495e" },
    { name: "H\u1ED3ng Sen", color: 16742777, hex: "#ff7979" }
  ];
  var InventoryPopup = class {
    constructor(scene) {
      this.scene = scene;
      this.isOpen = false;
      this.currentTab = "bag";
      this.elements = [];
    }
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
    open() {
      this.isOpen = true;
      this.render();
    }
    close() {
      this.isOpen = false;
      this.destroyElements();
    }
    destroyElements() {
      this.elements.forEach((el) => el.destroy());
      this.elements = [];
    }
    render() {
      this.destroyElements();
      const w = this.scene.cameras.main.width;
      const h = this.scene.cameras.main.height;
      const cx = w / 2;
      const cy = h / 2;
      let overlay = this.scene.add.rectangle(cx, cy, w, h, 0, 0.6).setScrollFactor(0).setDepth(3e3).setInteractive();
      overlay.on("pointerdown", () => this.close());
      this.elements.push(overlay);
      let panelW = 680;
      let panelH = 440;
      let modalBg = this.scene.add.rectangle(cx, cy, panelW, panelH, 1976110, 0.96).setStrokeStyle(3, 53971).setScrollFactor(0).setDepth(3001).setInteractive();
      this.elements.push(modalBg);
      let headerText = this.scene.add.text(cx, cy - panelH / 2 + 30, "\u{1F392} T\xDAI \u0110\u1ED2 & T\u1EE6 QU\u1EA6N \xC1O", {
        font: "bold 24px Arial",
        fill: "#00d2d3"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3002);
      this.elements.push(headerText);
      let closeBtn = this.scene.add.text(cx + panelW / 2 - 30, cy - panelH / 2 + 30, "\u2716", {
        font: "bold 22px Arial",
        fill: "#ff6b6b"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3002).setInteractive({ useHandCursor: true });
      closeBtn.on("pointerover", () => closeBtn.setStyle({ fill: "#ff4757" }));
      closeBtn.on("pointerout", () => closeBtn.setStyle({ fill: "#ff6b6b" }));
      closeBtn.on("pointerdown", () => this.close());
      this.elements.push(closeBtn);
      let tabY = cy - panelH / 2 + 75;
      let tab1Bg = this.scene.add.rectangle(cx - 130, tabY, 200, 36, this.currentTab === "bag" ? 53971 : 3094080).setScrollFactor(0).setDepth(3002).setInteractive({ useHandCursor: true });
      let tab1Text = this.scene.add.text(cx - 130, tabY, "\u{1F4E6} Kho V\u1EADt Ph\u1EA9m", {
        font: "bold 16px Arial",
        fill: this.currentTab === "bag" ? "#1e272e" : "#ffffff"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
      let tab2Bg = this.scene.add.rectangle(cx + 130, tabY, 200, 36, this.currentTab === "wardrobe" ? 53971 : 3094080).setScrollFactor(0).setDepth(3002).setInteractive({ useHandCursor: true });
      let tab2Text = this.scene.add.text(cx + 130, tabY, "\u{1F3A8} T\u1EE7 \u0110\u1ED3 (M\xE0u S\u1EAFc)", {
        font: "bold 16px Arial",
        fill: this.currentTab === "wardrobe" ? "#1e272e" : "#ffffff"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
      tab1Bg.on("pointerdown", () => {
        if (this.currentTab !== "bag") {
          this.currentTab = "bag";
          this.render();
        }
      });
      tab2Bg.on("pointerdown", () => {
        if (this.currentTab !== "wardrobe") {
          this.currentTab = "wardrobe";
          this.render();
        }
      });
      this.elements.push(tab1Bg, tab1Text, tab2Bg, tab2Text);
      if (this.currentTab === "bag") {
        this.renderBagTab(cx, cy);
      } else {
        this.renderWardrobeTab(cx, cy);
      }
    }
    renderBagTab(cx, cy) {
      const inv = this.scene.registry.get("inventory") || {};
      const itemKeys = Object.keys(ITEM_DEFS);
      let startX = cx - 200;
      let startY = cy - 25;
      let colW = 200;
      let rowH = 75;
      itemKeys.forEach((key, index) => {
        let col = index % 2;
        let row = Math.floor(index / 2);
        let itemX = startX + col * colW;
        let itemY = startY + row * rowH;
        let def = ITEM_DEFS[key];
        let count = inv[key] || 0;
        let slotBg = this.scene.add.rectangle(itemX, itemY, 185, 62, 3094080, 0.9).setStrokeStyle(2, count > 0 ? 4774907 : 5726319).setScrollFactor(0).setDepth(3002);
        let iconText = this.scene.add.text(itemX - 60, itemY, def.icon, {
          fontSize: "26px"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
        let nameText = this.scene.add.text(itemX - 32, itemY - 12, def.name, {
          font: "bold 13px Arial",
          fill: count > 0 ? "#ffffff" : "#a4b0be"
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(3003);
        let countText = this.scene.add.text(itemX + 70, itemY + 12, "x" + count, {
          font: "bold 15px Arial",
          fill: count > 0 ? "#f1c40f" : "#747d8c"
        }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(3003);
        this.elements.push(slotBg, iconText, nameText, countText);
      });
      let footerHint = this.scene.add.text(cx, cy + 185, "\u{1F4A1} M\u1EB9o: Nh\u1EB7t c\xE1c v\u1EADt ph\u1EA9m ph\xE1t s\xE1ng r\u1EA3i r\xE1c tr\xEAn \u0111\u01B0\u1EDDng \u0111i c\u1EE7a m\u1ED7i map!", {
        font: "italic 14px Arial",
        fill: "#7bed9f"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
      this.elements.push(footerHint);
    }
    renderWardrobeTab(cx, cy) {
      let currentColor = this.scene.registry.get("playerColor") || 3066993;
      let previewBox = this.scene.add.rectangle(cx - 180, cy + 50, 160, 200, 3094080, 0.8).setStrokeStyle(2, 5726319).setScrollFactor(0).setDepth(3002);
      let previewTitle = this.scene.add.text(cx - 180, cy - 30, "Xem tr\u01B0\u1EDBc:", {
        font: "bold 14px Arial",
        fill: "#dfe4ea"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
      let previewCircle = this.scene.add.circle(cx - 180, cy + 30, 32, currentColor).setStrokeStyle(3, 16777215).setScrollFactor(0).setDepth(3003);
      let previewTween = this.scene.tweens.add({
        targets: previewCircle,
        scaleY: 0.88,
        scaleX: 1.12,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
      let currentDef = OUTFIT_COLORS.find((c) => c.color === currentColor) || OUTFIT_COLORS[0];
      let colorNameText = this.scene.add.text(cx - 180, cy + 90, currentDef.name, {
        font: "bold 14px Arial",
        fill: currentDef.hex
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
      this.elements.push(previewBox, previewTitle, previewCircle, colorNameText);
      let swStartCol = cx - 40;
      let swStartY = cy - 20;
      let swColW = 145;
      let swRowH = 50;
      OUTFIT_COLORS.forEach((outfit, index) => {
        let col = index % 2;
        let row = Math.floor(index / 2);
        let swX = swStartCol + col * swColW;
        let swY = swStartY + row * swRowH;
        let isSelected = outfit.color === currentColor;
        let swBg = this.scene.add.rectangle(swX, swY, 135, 42, 3094080).setStrokeStyle(2, isSelected ? 53971 : 5726319).setScrollFactor(0).setDepth(3002).setInteractive({ useHandCursor: true });
        let colorCircle = this.scene.add.circle(swX - 45, swY, 12, outfit.color).setStrokeStyle(1, 16777215).setScrollFactor(0).setDepth(3003);
        let swText = this.scene.add.text(swX - 25, swY, outfit.name, {
          font: isSelected ? "bold 13px Arial" : "13px Arial",
          fill: isSelected ? "#00d2d3" : "#ffffff"
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(3003);
        swBg.on("pointerover", () => {
          if (!isSelected) swBg.setFillStyle(4016470);
        });
        swBg.on("pointerout", () => {
          if (!isSelected) swBg.setFillStyle(3094080);
        });
        swBg.on("pointerdown", () => {
          this.scene.registry.set("playerColor", outfit.color);
          previewCircle.setFillStyle(outfit.color);
          colorNameText.setText(outfit.name);
          colorNameText.setFill(outfit.hex);
          this.render();
        });
        this.elements.push(swBg, colorCircle, swText);
      });
      let wardrobeHint = this.scene.add.text(cx, cy + 185, "\u2728 Click ch\u1ECDn m\xE0u y\xEAu th\xEDch \u0111\u1EC3 thay trang ph\u1EE5c cho M\u1EA7m t\u1EE9c th\xEC!", {
        font: "italic 14px Arial",
        fill: "#7bed9f"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
      this.elements.push(wardrobeHint);
    }
  };

  // src/scenes/UIScene.js
  var UIScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "UIScene", active: false });
    }
    create() {
      if (!this.registry.get("showUI")) {
        this.scene.sleep();
      }
      this.registry.events.on("changedata-showUI", (parent, value) => {
        if (value) {
          this.scene.wake();
        } else {
          this.scene.sleep();
        }
      });
      const h = this.cameras.main.height;
      const w = this.cameras.main.width;
      this.inventoryPopup = new InventoryPopup(this);
      this.touchControls = new TouchControls(this);
      this.registry.set("touchControls", this.touchControls);
      this.fsBtnBg = this.add.rectangle(w - 95, 65, 44, 40, 1976110, 0.85).setStrokeStyle(2, 53971).setScrollFactor(0).setDepth(2500).setInteractive({ useHandCursor: true });
      this.fsBtnText = this.add.text(w - 95, 65, "\u26F6", {
        font: "bold 20px Arial",
        fill: "#00d2d3"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
      this.fsBtnBg.on("pointerover", () => {
        this.fsBtnBg.setFillStyle(53971);
        this.fsBtnText.setFill("#1e272e");
      });
      this.fsBtnBg.on("pointerout", () => {
        this.fsBtnBg.setFillStyle(1976110);
        this.fsBtnText.setFill("#00d2d3");
      });
      this.fsBtnBg.on("pointerdown", () => {
        this.toggleFullscreen();
      });
      this.pauseBtnBg = this.add.rectangle(w - 45, 65, 44, 40, 1976110, 0.85).setStrokeStyle(2, 53971).setScrollFactor(0).setDepth(2500).setInteractive({ useHandCursor: true });
      this.pauseBtnText = this.add.text(w - 45, 65, "\u23F8", {
        font: "bold 18px Arial",
        fill: "#00d2d3"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
      this.pauseBtnBg.on("pointerover", () => {
        this.pauseBtnBg.setFillStyle(53971);
        this.pauseBtnText.setFill("#1e272e");
      });
      this.pauseBtnBg.on("pointerout", () => {
        this.pauseBtnBg.setFillStyle(1976110);
        this.pauseBtnText.setFill("#00d2d3");
      });
      this.pauseBtnBg.on("pointerdown", () => {
        this.triggerPause();
      });
      this.bagBtnBg = this.add.rectangle(85, 65, 120, 40, 1976110, 0.85).setStrokeStyle(2, 53971).setScrollFactor(0).setDepth(2500).setInteractive({ useHandCursor: true });
      this.bagBtnText = this.add.text(85, 65, "\u{1F392} T\xFAi \u0110\u1ED3 [B]", {
        font: "bold 14px Arial",
        fill: "#00d2d3"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
      this.bagBtnBg.on("pointerover", () => {
        this.bagBtnBg.setFillStyle(53971);
        this.bagBtnText.setFill("#1e272e");
      });
      this.bagBtnBg.on("pointerout", () => {
        this.bagBtnBg.setFillStyle(1976110);
        this.bagBtnText.setFill("#00d2d3");
      });
      this.bagBtnBg.on("pointerdown", () => {
        this.inventoryPopup.toggle();
      });
      this.input.keyboard.on("keydown-B", () => {
        if (this.registry.get("showUI")) {
          this.inventoryPopup.toggle();
        }
      });
      this.input.keyboard.on("keydown-I", () => {
        if (this.registry.get("showUI")) {
          this.inventoryPopup.toggle();
        }
      });
      this.toastContainer = this.add.container(0, 0).setDepth(2600).setScrollFactor(0);
      this.registry.events.on("item-collected", (item) => {
        this.showPickupToast(item);
      });
      this.uiContainer = this.add.container(0, 0);
      this.survivalContainer = this.add.container(0, 0);
      this.gauges = {};
      let baseY = 80;
      this.createDSTGauge(w - 230, baseY, "health", 16711680, "\u2764\uFE0F");
      this.createDSTGauge(w - 175, baseY, "psyche", 11141290, "\u{1F9E0}");
      this.createDSTGauge(w - 120, baseY, "water", 35071, "\u{1F4A7}");
      this.createDSTGauge(w - 65, baseY, "sun", 16755200, "\u2600\uFE0F");
      this.uiContainer.setVisible(false);
      this.survivalContainer.setVisible(false);
      this.events.on("shutdown", () => {
        this.registry.events.off("changedata-showUI");
        this.registry.events.off("changedata", this.updateData, this);
      });
      this.registry.events.on("changedata", this.updateData, this);
      this.updateData(this.registry, "showUI", this.registry.get("showUI"));
      this.updateData(this.registry, "showSurvival", this.registry.get("showSurvival"));
      this.time.addEvent({
        delay: 1e3,
        callback: this.survivalTick,
        callbackScope: this,
        loop: true
      });
      this.input.keyboard.on("keydown-ESC", () => {
        this.triggerPause();
      });
    }
    toggleFullscreen() {
      try {
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        } else {
          this.scale.startFullscreen();
        }
      } catch (e) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
          });
        } else {
          document.exitFullscreen().catch(() => {
          });
        }
      }
    }
    triggerPause() {
      if (!this.registry.get("showUI")) return;
      if (this.inventoryPopup && this.inventoryPopup.isOpen) {
        this.inventoryPopup.close();
        return;
      }
      if (this.scene.isActive("PauseScene")) return;
      let activeScene = this.scene.manager.getScenes(true).find(
        (s) => s.scene.key !== "UIScene" && s.scene.key !== "PauseScene" && s.scene.key !== "MenuScene" && s.scene.key !== "MapSelectionScene"
      );
      if (activeScene) {
        this.scene.pause(activeScene.scene.key);
        this.scene.launch("PauseScene", { scene: activeScene.scene.key });
        this.scene.bringToTop("PauseScene");
      }
    }
    showPickupToast(item) {
      const w = this.cameras.main.width;
      let toastY = 80;
      let toastBg = this.add.rectangle(w / 2, toastY, 280, 36, 1976110, 0.9).setStrokeStyle(2, 53971).setScrollFactor(0).setDepth(2601);
      let toastText = this.add.text(w / 2, toastY, "+1 " + item.icon + " " + item.name, {
        font: "bold 14px Arial",
        fill: "#00d2d3"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2602);
      this.tweens.add({
        targets: [toastBg, toastText],
        y: toastY + 15,
        duration: 250,
        ease: "Back.easeOut",
        onComplete: () => {
          this.time.delayedCall(1200, () => {
            this.tweens.add({
              targets: [toastBg, toastText],
              alpha: 0,
              y: toastY - 20,
              duration: 350,
              onComplete: () => {
                toastBg.destroy();
                toastText.destroy();
              }
            });
          });
        }
      });
    }
    createDSTGauge(x, y, key, color, emoji) {
      let bg = this.add.circle(x, y, 22, 2236962).setStrokeStyle(2, 14540253);
      let shape = this.make.graphics();
      shape.fillStyle(16777215);
      shape.fillCircle(x, y, 22);
      let mask = shape.createGeometryMask();
      let fill = this.add.rectangle(x, y + 22, 44, 44, color).setOrigin(0.5, 1);
      fill.setMask(mask);
      let icon = this.add.text(x, y, emoji, { fontSize: "18px" }).setOrigin(0.5);
      let text = this.add.text(x, y + 32, "100%", { font: "bold 12px Arial", fill: "#ffffff" }).setOrigin(0.5).setShadow(1, 1, "#000", 2);
      this.survivalContainer.add([bg, fill, icon, text]);
      this.gauges[key] = { fill, text };
    }
    updateData(parent, key, data) {
      if (key === "showUI") {
        this.uiContainer.setVisible(!!data);
        if (this.bagBtnBg) this.bagBtnBg.setVisible(!!data);
        if (this.bagBtnText) this.bagBtnText.setVisible(!!data);
      }
      if (key === "showSurvival") {
        this.survivalContainer.setVisible(!!data);
      }
      if (["health", "psyche", "water", "sun"].includes(key)) {
        let val = Math.max(0, Math.min(100, data));
        if (this.gauges[key]) {
          this.gauges[key].fill.height = val / 100 * 44;
          this.gauges[key].text.setText(Math.round(val) + "%");
        }
      }
    }
    survivalTick() {
      if (!this.registry.get("showUI") || !this.registry.get("showSurvival")) return;
      let water = this.registry.get("water");
      let sun = this.registry.get("sun");
      let psyche = this.registry.get("psyche");
      let health = this.registry.get("health");
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
        this.registry.set("health", health);
        this.tweens.add({
          targets: this.gauges["health"].fill,
          alpha: 0.2,
          yoyo: true,
          duration: 150
        });
        if (health <= 0) {
          this.registry.set("showUI", false);
          let activeScene = this.scene.manager.getScenes(true).find((s) => s.scene.key !== "UIScene");
          if (activeScene) {
            activeScene.scene.start("GameOverScene", { reason: "M\u1EA7m \u0111\xE3 ch\u1EBFt do m\u1EA5t c\xE2n b\u1EB1ng sinh t\u1ED3n.", retryScene: activeScene.scene.key });
          }
        }
      }
    }
  };

  // src/scenes/MapSelectionScene.js
  var MapSelectionScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "MapSelectionScene" });
    }
    create() {
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      let bgParticles = this.add.particles(0, 0, "firefly", {
        x: { min: 0, max: w },
        y: { min: 0, max: h },
        lifespan: 3e3,
        speed: { min: 10, max: 20 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.3, end: 0 },
        quantity: 2,
        blendMode: "ADD"
      });
      this.add.text(w / 2, 80, "B\u1EA2N \u0110\u1ED2 TH\u1EBE GI\u1EDAI", { font: "bold 50px Arial", fill: "#ffffff", shadow: { offsetX: 2, offsetY: 2, color: "#00ff00", blur: 10, stroke: true, fill: true } }).setOrigin(0.5);
      let g = this.add.graphics();
      g.lineStyle(4, 11184810, 0.5);
      g.beginPath();
      g.moveTo(w / 2 - 300, h / 2);
      g.lineTo(w / 2 - 100, h / 2 - 150);
      g.lineTo(w / 2 + 100, h / 2 + 50);
      g.lineTo(w / 2 + 300, h / 2 - 100);
      g.lineTo(w / 2 + 450, h / 2 + 50);
      g.strokePath();
      let map1 = this.add.circle(w / 2 - 300, h / 2, 50, 21896).setStrokeStyle(6, 43775);
      this.add.text(w / 2 - 300, h / 2, "1", { font: "bold 30px Arial", fill: "#ffffff" }).setOrigin(0.5);
      this.add.text(w / 2 - 300, h / 2 + 80, "MAP 1\nV\xF9ng X\xE1m", { font: "bold 20px Arial", fill: "#00aaff", align: "center" }).setOrigin(0.5);
      map1.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: map1, scale: 1.1, duration: 1e3, yoyo: true, repeat: -1 });
      map1.on("pointerdown", () => {
        this.cameras.main.fadeOut(500, 255, 255, 255);
        this.time.delayedCall(500, () => this.scene.start("RunnerScene"));
      });
      let map2 = this.add.circle(w / 2 - 100, h / 2 - 150, 60, 34816).setStrokeStyle(6, 65280);
      this.add.text(w / 2 - 100, h / 2 - 150, "2", { font: "bold 40px Arial", fill: "#ffffff" }).setOrigin(0.5);
      this.add.text(w / 2 - 100, h / 2 - 150 + 90, "MAP 2\nC\u1ED1i Xay Gi\xF3", { font: "bold 20px Arial", fill: "#00ff00", align: "center" }).setOrigin(0.5);
      map2.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: map2, scale: 1.1, duration: 1e3, yoyo: true, repeat: -1 });
      map2.on("pointerdown", () => {
        this.cameras.main.fadeOut(500, 255, 255, 255);
        this.time.delayedCall(500, () => this.scene.start("TransitionScene"));
      });
      let map3 = this.add.circle(w / 2 + 100, h / 2 + 50, 50, 941687).setStrokeStyle(6, 770786);
      this.add.text(w / 2 + 100, h / 2 + 50, "3", { font: "bold 30px Arial", fill: "#ffffff" }).setOrigin(0.5);
      this.add.text(w / 2 + 100, h / 2 + 50 + 80, "MAP 3\nL\xE0ng Sen", { font: "bold 20px Arial", fill: "#0bc2e2", align: "center" }).setOrigin(0.5);
      map3.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: map3, scale: 1.1, duration: 1e3, yoyo: true, repeat: -1 });
      map3.on("pointerdown", () => {
        this.cameras.main.fadeOut(500, 255, 255, 255);
        this.time.delayedCall(500, () => this.scene.start("Map3Scene"));
      });
      let map4 = this.add.circle(w / 2 + 300, h / 2 - 100, 50, 8912896).setStrokeStyle(6, 16733525);
      this.add.text(w / 2 + 300, h / 2 - 100, "4", { font: "bold 30px Arial", fill: "#ffffff" }).setOrigin(0.5);
      this.add.text(w / 2 + 300, h / 2 - 100 + 80, "MAP 4\nTh\xE1i D\u01B0\u01A1ng", { font: "bold 20px Arial", fill: "#ff5555", align: "center" }).setOrigin(0.5);
      map4.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: map4, scale: 1.1, duration: 1e3, yoyo: true, repeat: -1 });
      map4.on("pointerdown", () => {
        this.cameras.main.fadeOut(500, 255, 255, 255);
        this.time.delayedCall(500, () => this.scene.start("Map4Scene"));
      });
      let map5 = this.add.circle(w / 2 + 450, h / 2 + 50, 50, 4855115).setStrokeStyle(6, 14254330);
      this.add.text(w / 2 + 450, h / 2 + 50, "5", { font: "bold 30px Arial", fill: "#ffffff" }).setOrigin(0.5);
      this.add.text(w / 2 + 450, h / 2 + 50 + 80, "MAP 5\nD\u1EA1 N\u1EA5m", { font: "bold 20px Arial", fill: "#d980fa", align: "center" }).setOrigin(0.5);
      map5.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: map5, scale: 1.1, duration: 1e3, yoyo: true, repeat: -1 });
      map5.on("pointerdown", () => {
        this.cameras.main.fadeOut(500, 255, 255, 255);
        this.time.delayedCall(500, () => this.scene.start("Map5Scene"));
      });
      let backBtn = this.add.text(50, 50, "< QUAY L\u1EA0I MENU", { font: "bold 24px Arial", fill: "#ffffff" }).setInteractive({ useHandCursor: true });
      backBtn.on("pointerdown", () => this.scene.start("MenuScene"));
      backBtn.on("pointerover", () => backBtn.setFill("#ff0000"));
      backBtn.on("pointerout", () => backBtn.setFill("#ffffff"));
    }
  };

  // src/scenes/TransitionScene.js
  var TransitionScene = class extends Phaser.Scene {
    constructor() {
      super({ key: "TransitionScene" });
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      this.add.rectangle(0, 0, w * 3, h, 0).setOrigin(0, 0);
      this.ambient = this.add.rectangle(0, 0, w * 3, h, 16777215, 0).setOrigin(0, 0);
      this.ambient.setBlendMode("ADD");
      let groundY = h - 110;
      let startY = groundY - 40;
      this.add.rectangle(0, groundY, w * 3, 2, 16777215, 0.3).setOrigin(0, 0);
      for (let i = 0; i < w * 3; i += 150) {
        this.add.rectangle(i, groundY, 20, 5, 16777215, 0.4).setOrigin(0, 0);
      }
      this.msg = this.add.text(w, startY - 150, "C\xE1c v\xF9ng \u0111\u1EA5t m\u1EDBi,\nnh\u1EEFng ng\u01B0\u1EDDi b\u1EA1n m\u1EDBi...", { font: "italic 30px Arial", fill: "#ffffff", align: "center" }).setOrigin(0.5).setAlpha(0);
      this.player = this.add.rectangle(200, startY, 40, 80, 0, 0);
      this.physics.add.existing(this.player);
      this.player.body.setCollideWorldBounds(true);
      this.physics.world.setBounds(0, 0, w * 3, h);
      AssetManager.generateAndSave(this, "green_circle", 50, 50, (g) => {
        g.fillStyle(16777215);
        g.fillCircle(25, 25, 25);
      });
      let initialColor = this.registry.get("playerColor") || 3066993;
      this.playerSprite = this.add.sprite(200, startY, "green_circle");
      this.playerSprite.setOrigin(0.5, 1);
      this.playerSprite.setTint(initialColor);
      this.light = this.add.circle(200, startY, 100, initialColor, 0.25);
      this.light.setBlendMode("ADD");
      this.registry.events.on("changedata-playerColor", (parent, color) => {
        if (this.playerSprite) this.playerSprite.setTint(color);
        if (this.light) this.light.setFillStyle(color, 0.25);
      });
      AssetManager.generateAndSave(this, "white_firefly", 8, 8, (g) => {
        g.fillStyle(16777215, 1);
        g.fillCircle(4, 4, 4);
      });
      this.add.particles(0, 0, "white_firefly", {
        x: { min: 0, max: w * 3 },
        y: { min: 0, max: h },
        speed: { min: -20, max: 20 },
        scale: { start: 0, end: 1, yoyo: true },
        alpha: { start: 0, end: 0.8, yoyo: true },
        lifespan: 4e3,
        frequency: 80,
        blendMode: "ADD"
      });
      this.cursors = this.input.keyboard.createCursorKeys();
      this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.cameras.main.setBounds(0, 0, w * 3, h);
      this.cameras.main.startFollow(this.player);
      this.hasTriggered = false;
    }
    update() {
      this.playerSprite.x = this.player.x;
      this.playerSprite.y = this.player.y + 40;
      this.light.x = this.player.x;
      this.light.y = this.player.y;
      let progress = this.player.x / (this.cameras.main.width * 2);
      this.light.setRadius(100 + progress * 800);
      this.light.setAlpha(0.2 + progress * 0.8);
      this.ambient.setAlpha(progress * 0.5);
      if (this.player.x > this.cameras.main.width && this.msg.alpha === 0) {
        this.tweens.add({ targets: this.msg, alpha: 1, duration: 2e3 });
      }
      if (this.player.x > this.cameras.main.width * 2 && !this.hasTriggered) {
        this.hasTriggered = true;
        this.cameras.main.fadeOut(2e3, 255, 255, 255);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("Map2Scene");
        });
      }
      if (this.cursors.right.isDown || this.dKey.isDown) {
        this.player.body.setVelocityX(300);
      } else if (this.cursors.left.isDown || this.aKey.isDown) {
        this.player.body.setVelocityX(-300);
      } else {
        this.player.body.setVelocityX(0);
      }
    }
  };

  // src/entities/Player.js
  var Player = class extends Phaser.GameObjects.Sprite {
    /**
     * @param {Phaser.Scene} scene - The scene this player belongs to.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     */
    constructor(scene, x, y) {
      super(scene, x, y);
      AssetManager.generateAndSave(scene, "green_circle", 50, 50, (g) => {
        g.fillStyle(16777215);
        g.fillCircle(25, 25, 25);
      });
      this.setTexture("green_circle");
      scene.add.existing(this);
      this.hitbox = scene.add.rectangle(x, y, 40, 40, 0, 0).setOrigin(0.5, 0.5);
      scene.physics.add.existing(this.hitbox);
      this.hitbox.body.setCircle(20);
      this.hitbox.body.setGravityY(1200);
      this.hitbox.body.setCollideWorldBounds(true);
      this.setOrigin(0.5, 1);
      this.baseScale = 1;
      this.setScale(this.baseScale);
      this.setDepth(10);
      let initialColor = scene.registry.get("playerColor") || 3066993;
      this.setTint(initialColor);
      this.colorChangeListener = (parent, color) => {
        this.setTint(color);
      };
      scene.registry.events.on("changedata-playerColor", this.colorChangeListener);
      this.on("destroy", () => {
        scene.registry.events.off("changedata-playerColor", this.colorChangeListener);
      });
      this.shadow = scene.add.ellipse(x, y + 20, 60, 15, 0, 0.6).setDepth(9);
      this.playerState = "idle";
      this.playerTween = null;
      if (!scene.keyW) scene.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      if (!scene.keyA) scene.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      if (!scene.keyD) scene.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }
    /**
     * Cập nhật logic nhân vật mỗi frame
     * @param {object} cursors - Đối tượng chứa thông tin phím bấm
     * @param {Phaser.Input.Keyboard.Key} spaceKey - Phím cách
     * @param {number} groundY - Vị trí Y của mặt đất tại vị trí X hiện tại để vẽ bóng
     */
    updateLogic(cursors, spaceKey, groundY) {
      let isGrounded = this.hitbox.body.touching.down;
      let speed = 350;
      let isMoving = false;
      let touch = this.scene.registry.get("touchControls");
      let isTouchLeft = touch && touch.isLeft;
      let isTouchRight = touch && touch.isRight;
      let isTouchJump = touch && touch.isJump;
      let isLeft = cursors && cursors.left && cursors.left.isDown || this.scene.keyA && this.scene.keyA.isDown || isTouchLeft;
      let isRight = cursors && cursors.right && cursors.right.isDown || this.scene.keyD && this.scene.keyD.isDown || isTouchRight;
      if (isLeft) {
        this.hitbox.body.setVelocityX(-speed);
        isMoving = true;
      } else if (isRight) {
        this.hitbox.body.setVelocityX(speed);
        isMoving = true;
      } else {
        this.hitbox.body.setVelocityX(0);
      }
      let isW = this.scene.keyW && this.scene.keyW.isDown;
      let isUp = cursors && cursors.up && cursors.up.isDown;
      let isSpace = spaceKey && spaceKey.isDown;
      let isJumpPressed = isW || isUp || isSpace || isTouchJump;
      if (isJumpPressed && isGrounded) {
        this.hitbox.body.setVelocityY(-600);
      }
      this.x = this.hitbox.x;
      this.y = this.hitbox.y + 20;
      this.shadow.x = this.hitbox.x;
      this.shadow.y = groundY;
      let dist = groundY - (this.hitbox.y + 20);
      this.shadow.setAlpha(Phaser.Math.Clamp(0.5 - dist / 400, 0, 0.6));
      let newState = "idle";
      if (!isGrounded) newState = "jump";
      else if (isMoving) newState = "walk";
      if (newState !== this.playerState) {
        this.playerState = newState;
        if (this.playerTween) this.playerTween.stop();
        this.setAngle(0);
        this.setScale(this.baseScale);
        if (newState === "idle") {
          this.playerTween = this.scene.tweens.add({
            targets: this,
            scaleY: this.baseScale * 0.95,
            scaleX: this.baseScale * 1.05,
            duration: 1e3,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        } else if (newState === "walk") {
          this.playerTween = this.scene.tweens.add({
            targets: this,
            angle: { from: -15, to: 15 },
            scaleY: this.baseScale * 0.9,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        } else if (newState === "jump") {
          this.playerTween = this.scene.tweens.add({
            targets: this,
            scaleY: this.baseScale * 1.2,
            scaleX: this.baseScale * 0.8,
            duration: 300,
            yoyo: true,
            repeat: 0,
            ease: "Quad.easeOut"
          });
        }
      }
    }
  };

  // src/entities/Windmill.js
  var Windmill = class extends Phaser.GameObjects.Container {
    constructor(scene, x, y, groundDepthY) {
      super(scene, x, y);
      this.speed = Phaser.Math.FloatBetween(0.01, 0.03);
      let bodyHeight = groundDepthY - y;
      AssetManager.generateAndSave(scene, "windmill_body", 100, bodyHeight + 22, (g) => {
        g.fillStyle(16777215, 0.9);
        g.beginPath();
        g.moveTo(0, bodyHeight + 22);
        g.lineTo(100, bodyHeight + 22);
        g.lineTo(70, 22);
        g.lineTo(30, 22);
        g.fillPath();
        g.fillStyle(13391104, 1);
        g.fillCircle(50, 22, 22);
      });
      AssetManager.generateAndSave(scene, "windmill_blade", 10, 100, (g) => {
        g.fillStyle(14535833, 1);
        g.fillRect(0, 0, 10, 100);
      });
      AssetManager.generateAndSave(scene, "windmill_hub", 20, 20, (g) => {
        g.fillStyle(9127187, 1);
        g.fillCircle(10, 10, 10);
      });
      let body = scene.add.image(0, 0, "windmill_body").setOrigin(0.5, 22 / (bodyHeight + 22));
      this.add(body);
      this.blades = scene.add.container(0, 0);
      for (let j = 0; j < 4; j++) {
        let blade = scene.add.image(0, 0, "windmill_blade").setOrigin(0.5, 1);
        blade.rotation = Math.PI / 2 * j;
        this.blades.add(blade);
      }
      let hub = scene.add.image(0, 0, "windmill_hub").setOrigin(0.5, 0.5);
      this.blades.add(hub);
      this.add(this.blades);
      this.setScrollFactor(0.5);
      scene.add.existing(this);
    }
    updateLogic() {
      this.blades.rotation += this.speed;
    }
  };

  // src/environment/TerrainGenerator.js
  var TerrainGenerator = class {
    static generateGrassTerrain(scene, mapW, h) {
      let groundGroup = scene.add.group();
      let terrainHeight = h + 500;
      AssetManager.generateAndSave(scene, "map2_terrain", mapW, terrainHeight, (g) => {
        g.fillStyle(3329330, 1);
        g.beginPath();
        g.moveTo(0, terrainHeight);
        for (let x = 0; x <= mapW; x += 20) {
          let ty = h - 100 + Math.sin(x / 300) * 40;
          if (x > mapW - 400) ty = h - 100;
          g.lineTo(x, ty);
        }
        g.lineTo(mapW, terrainHeight);
        g.fillPath();
        g.lineStyle(6, 2263842, 1);
        g.beginPath();
        g.moveTo(0, h - 100);
        for (let x = 0; x <= mapW; x += 20) {
          let ty = h - 100 + Math.sin(x / 300) * 40;
          if (x > mapW - 400) ty = h - 100;
          g.lineTo(x, ty);
        }
        g.strokePath();
      });
      let visual = scene.add.image(0, 0, "map2_terrain").setOrigin(0, 0);
      for (let x = 0; x <= mapW; x += 20) {
        let ty = h - 100 + Math.sin(x / 300) * 40;
        if (x > mapW - 400) ty = h - 100;
        if (x > 0) {
          let rect = scene.add.rectangle(x - 10, ty, 20, terrainHeight - ty, 0, 0).setOrigin(0.5, 0);
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
  };

  // src/scenes/Map2Scene.js
  var Map2Scene = class extends Phaser.Scene {
    constructor() {
      super({ key: "Map2Scene" });
    }
    preload() {
    }
    create() {
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.mapW = w * 4;
      this.registry.set("showUI", true);
      this.registry.set("showSurvival", false);
      this.scene.launch("UIScene");
      this.scene.bringToTop("UIScene");
      this.physics.world.setBounds(0, 0, this.mapW, h);
      this.cameras.main.setBounds(0, 0, this.mapW, h);
      this.add.rectangle(0, 0, this.mapW, h, 8900331).setOrigin(0, 0);
      AssetManager.generateAndSave(this, "sun", 120, 120, (g) => {
        g.fillStyle(16768768, 1);
        g.fillCircle(60, 60, 60);
      });
      this.add.image(w - 150, 150, "sun").setScrollFactor(0.1);
      AssetManager.generateAndSave(this, "cloud", 140, 80, (g) => {
        g.fillStyle(16777215, 1);
        g.fillCircle(70, 40, 40);
        g.fillCircle(110, 50, 30);
        g.fillCircle(30, 50, 30);
      });
      for (let i = 0; i < 20; i++) {
        let cx = Phaser.Math.Between(0, this.mapW);
        let cy = Phaser.Math.Between(50, 250);
        let alpha = Phaser.Math.FloatBetween(0.6, 0.9);
        let scale = Phaser.Math.FloatBetween(0.5, 1.2);
        let cloudImg = this.add.image(cx, cy, "cloud").setAlpha(alpha).setScale(scale);
        this.tweens.add({
          targets: cloudImg,
          x: cx + Phaser.Math.Between(50, 150),
          duration: Phaser.Math.Between(1e4, 2e4),
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      }
      this.windmills = [];
      for (let i = 0; i < 5; i++) {
        let wx = 400 + i * 800 + Phaser.Math.Between(-100, 100);
        let wy = h - 350;
        let wm = new Windmill(this, wx, wy, h + 500);
        this.windmills.push(wm);
      }
      this.groundGroup = TerrainGenerator.generateGrassTerrain(this, this.mapW, h);
      AssetManager.generateAndSave(this, "flower_stem", 2, 15, (g) => {
        g.fillStyle(25600, 1);
        g.fillRect(0, 0, 2, 15);
      });
      AssetManager.generateAndSave(this, "flower_petal", 14, 14, (g) => {
        g.fillStyle(16777215, 1);
        g.fillCircle(7, 7, 7);
      });
      let flowerColors = [16711680, 16776960, 16711935, 16753920, 16777215];
      for (let i = 0; i < 200; i++) {
        let fx = Phaser.Math.Between(50, this.mapW - 50);
        let fy = TerrainGenerator.getGrassTerrainY(fx, this.mapW, h);
        let stem = this.add.image(fx, fy, "flower_stem").setOrigin(0.5, 1);
        let fcolor = Phaser.Utils.Array.GetRandom(flowerColors);
        let petalSize = Phaser.Math.FloatBetween(0.5, 1.2);
        let petal = this.add.image(fx, fy - 15, "flower_petal").setOrigin(0.5, 0.5).setTint(fcolor).setScale(petalSize);
        this.tweens.add({
          targets: [stem, petal],
          x: fx + Phaser.Math.Between(-5, 5),
          duration: Phaser.Math.Between(1500, 3e3),
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      }
      AssetManager.generateAndSave(this, "petal", 8, 4, (g) => {
        g.fillStyle(16761035, 1);
        g.fillEllipse(4, 2, 4, 2);
      });
      this.add.particles(0, 0, "petal", {
        x: { min: 0, max: this.mapW },
        y: { min: h - 300, max: h - 50 },
        lifespan: 6e3,
        speedX: { min: 50, max: 150 },
        speedY: { min: -20, max: 20 },
        scale: { start: 1, end: 0.5 },
        alpha: { start: 1, end: 0 },
        rotate: { start: 0, end: 360 },
        frequency: 150,
        quantity: 2
      }).setDepth(8);
      this.playerObj = new Player(this, 200, h - 250);
      this.physics.add.collider(this.playerObj.hitbox, this.groundGroup);
      this.itemGroup = this.physics.add.staticGroup();
      const m2Items = [
        { x: 600, y: h - 260, type: "dewdrop" },
        { x: 1200, y: h - 260, type: "coin" },
        { x: 1800, y: h - 260, type: "seed" },
        { x: 2400, y: h - 260, type: "dewdrop" },
        { x: 2800, y: h - 260, type: "potion" }
      ];
      m2Items.forEach((i) => {
        let item = new CollectibleItem(this, i.x, i.y, i.type);
        this.itemGroup.add(item);
      });
      this.physics.add.overlap(this.playerObj.hitbox, this.itemGroup, (hitbox, item) => item.collect(hitbox));
      this.cameras.main.startFollow(this.playerObj.hitbox, true, 0.1, 0.1, -w / 4, 100);
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.endZone = this.add.rectangle(this.mapW - 100, h / 2, 200, h, 65280, 0).setOrigin(0.5, 0.5);
      this.physics.add.existing(this.endZone, true);
      this.hasReachedEnd = false;
      this.add.text(400, h - 250, "V\u01B0\u01A1ng qu\u1ED1c c\u1ED1i xay gi\xF3 - C\u1EE9 thong th\u1EA3 t\u1EADn h\u01B0\u1EDFng gi\xF3 m\xE1t", { font: "bold 24px Arial", fill: "#ffffff", backgroundColor: "#000000aa", padding: { x: 10, y: 5 } }).setOrigin(0.5).setDepth(15);
    }
    update(time, delta) {
      this.windmills.forEach((wm) => wm.updateLogic());
      if (this.hasReachedEnd) return;
      let groundY = TerrainGenerator.getGrassTerrainY(this.playerObj.hitbox.x, this.mapW, this.cameras.main.height);
      this.playerObj.updateLogic(this.cursors, this.spaceKey, groundY);
      if (this.playerObj.hitbox.x > this.mapW - 200 && !this.hasReachedEnd) {
        this.hasReachedEnd = true;
        this.playerObj.hitbox.body.setVelocityX(0);
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.time.delayedCall(1500, () => {
          this.scene.stop("UIScene");
          this.scene.start("Map3Scene");
        });
      }
    }
  };

  // src/entities/LotusPlatform.js
  var LotusPlatform = class extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = "leaf") {
      let key = type === "flower" ? "lotus_flower" : "lotus_leaf";
      AssetManager.generateAndSave(scene, "lotus_leaf", 120, 40, (g) => {
        g.fillStyle(3066993, 1);
        g.fillEllipse(60, 20, 120, 40);
        g.lineStyle(2, 2600544, 1);
        g.strokeEllipse(60, 20, 120, 40);
      });
      AssetManager.generateAndSave(scene, "lotus_flower", 100, 60, (g) => {
        g.fillStyle(16752627, 1);
        g.fillEllipse(50, 30, 40, 60);
        g.fillEllipse(30, 40, 40, 40);
        g.fillEllipse(70, 40, 40, 40);
        g.fillStyle(16697943, 1);
        g.fillEllipse(50, 40, 30, 15);
      });
      super(scene, x, y, key);
      scene.add.existing(this);
      scene.physics.add.existing(this, true);
      this.type = type;
      if (type === "leaf") {
        this.body.setSize(110, 24);
        this.body.setOffset(5, 8);
      } else {
        this.body.setSize(90, 24);
        this.body.setOffset(5, 30);
      }
      this.refreshBody();
      this.lastBounceTime = 0;
    }
    bouncePlayer(hitbox) {
      let now = this.scene.time.now;
      if (now - this.lastBounceTime < 200) return;
      this.lastBounceTime = now;
      let bounceForce = -650;
      let touch = this.scene.registry.get("touchControls");
      let isHoldingJump = this.scene.cursors && this.scene.cursors.up.isDown || this.scene.spacebar && this.scene.spacebar.isDown || touch && touch.isJump;
      if (isHoldingJump) {
        bounceForce = -850;
      }
      hitbox.body.setVelocityY(bounceForce);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.25,
        scaleY: 0.7,
        duration: 90,
        yoyo: true,
        ease: "Quad.easeOut",
        onComplete: () => {
          this.setScale(1, 1);
        }
      });
    }
  };

  // src/entities/NPC.js
  var NPC = class extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      AssetManager.generateAndSave(scene, "npc_blue", 60, 60, (g) => {
        g.fillStyle(623843, 1);
        g.fillCircle(30, 30, 28);
        g.lineStyle(3, 0, 1);
        g.strokeCircle(30, 30, 28);
      });
      super(scene, x, y, "npc_blue");
      scene.add.existing(this);
      scene.physics.add.existing(this, true);
      this.setOrigin(0.5, 1);
      this.promptText = scene.add.text(x, y - 75, "B\u1EA5m F", {
        font: "bold 16px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setAlpha(0).setDepth(100);
      this.isPlayerNear = false;
      scene.input.keyboard.on("keydown-F", () => {
        if (this.isPlayerNear && !scene.dialogueBox?.active) {
          this.interact();
        }
      });
    }
    update(player) {
      if (!player) return;
      let dx = Math.abs(this.x - player.x);
      let dy = this.y - player.y;
      let inRange = dx <= 250 && dy >= -80 && dy <= 450;
      if (inRange) {
        if (!this.isPlayerNear) {
          this.isPlayerNear = true;
          this.scene.tweens.killTweensOf(this.promptText);
          this.scene.tweens.add({ targets: this.promptText, alpha: 1, duration: 150 });
        }
      } else {
        if (this.isPlayerNear) {
          this.isPlayerNear = false;
          this.scene.tweens.killTweensOf(this.promptText);
          this.scene.tweens.add({ targets: this.promptText, alpha: 0, duration: 150 });
        }
      }
    }
    interact() {
      if (this.onInteract) {
        this.onInteract();
      }
    }
  };

  // src/ui/DialogueBox.js
  var DialogueBox = class {
    constructor(scene) {
      this.scene = scene;
      this.elements = [];
      this.active = false;
    }
    show(options) {
      this.hide();
      this.active = true;
      const cam = this.scene.cameras.main;
      const cx = cam.worldView.centerX;
      const cy = cam.worldView.centerY;
      let overlay = this.scene.add.rectangle(cx, cy, cam.worldView.width, cam.worldView.height, 0, 0.4).setDepth(999);
      this.elements.push(overlay);
      let bg = this.scene.add.rectangle(cx, cy, 620, 340, 1713455, 0.95).setStrokeStyle(3, 623843).setDepth(1e3);
      this.elements.push(bg);
      let title = this.scene.add.text(cx, cy - 110, "Ng\u01B0\u1EDDi b\xED \u1EA9n:", {
        font: "bold 24px Arial",
        fill: "#ffffff"
      }).setOrigin(0.5).setDepth(1001);
      this.elements.push(title);
      options.forEach((opt, index) => {
        let by = cy - 40 + index * 55;
        let btnBg = this.scene.add.rectangle(cx, by, 460, 42, 2899536).setStrokeStyle(2, 3426654).setDepth(1001).setInteractive({ useHandCursor: true });
        let btnText = this.scene.add.text(cx, by, opt.text, {
          font: "bold 18px Arial",
          fill: "#ecf0f1"
        }).setOrigin(0.5).setDepth(1002);
        btnBg.on("pointerover", () => {
          btnBg.setFillStyle(3447003);
          btnBg.setStrokeStyle(2, 2719929);
          btnText.setFill("#ffffff");
        });
        btnBg.on("pointerout", () => {
          btnBg.setFillStyle(2899536);
          btnBg.setStrokeStyle(2, 3426654);
          btnText.setFill("#ecf0f1");
        });
        btnBg.on("pointerdown", () => {
          this.hide();
          if (opt.callback) opt.callback();
        });
        this.elements.push(btnBg, btnText);
      });
    }
    hide() {
      this.active = false;
      this.elements.forEach((el) => el.destroy());
      this.elements = [];
    }
  };

  // src/scenes/Map3Scene.js
  var Map3Scene = class extends Phaser.Scene {
    constructor() {
      super("Map3Scene");
    }
    preload() {
      AssetManager.preloadAll(this);
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      this.scene.launch("UIScene");
      this.scene.bringToTop("UIScene");
      this.registry.set("showUI", true);
      AssetManager.generateAndSave(this, "pond_water", 8e3, 300, (g) => {
        g.fillStyle(941687, 0.8);
        g.fillRect(0, 0, 8e3, 300);
        g.fillStyle(770786, 0.5);
        g.fillRect(0, 0, 8e3, 20);
      });
      this.cameras.main.setBackgroundColor("#81ecec");
      let waterY = h - 100;
      this.add.image(0, waterY, "pond_water").setOrigin(0, 0).setDepth(5);
      this.waterDeathZone = this.add.rectangle(0, waterY + 40, 8e3, 300, 0, 0).setOrigin(0, 0);
      this.physics.add.existing(this.waterDeathZone, true);
      this.lotusGroup = this.physics.add.staticGroup();
      let startBank = this.add.rectangle(0, waterY - 50, 280, 500, 6516338).setOrigin(0, 0);
      this.physics.add.existing(startBank, true);
      this.lotusGroup.add(startBank);
      this.player = new Player(this, 100, waterY - 100);
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const lotusLayout = [
        { x: 380, y: waterY - 20, type: "leaf" },
        { x: 590, y: waterY - 30, type: "leaf" },
        { x: 800, y: waterY - 15, type: "leaf" },
        { x: 1010, y: waterY - 35, type: "leaf" },
        { x: 1220, y: waterY - 20, type: "leaf" },
        { x: 1430, y: waterY - 30, type: "leaf" },
        { x: 1640, y: waterY - 15, type: "leaf" },
        { x: 1850, y: waterY - 35, type: "leaf" },
        { x: 2080, y: waterY - 20, type: "flower" }
      ];
      lotusLayout.forEach((pos) => {
        let lotus = new LotusPlatform(this, pos.x, pos.y, pos.type);
        this.lotusGroup.add(lotus);
        if (pos.type === "flower") {
          this.createNPC(pos.x, pos.y);
        }
      });
      let endBank = this.add.rectangle(2220, waterY - 50, 400, 500, 6516338).setOrigin(0, 0);
      this.physics.add.existing(endBank, true);
      this.lotusGroup.add(endBank);
      this.cameras.main.setBounds(0, 0, 2700, h);
      this.physics.world.setBounds(0, 0, 2700, h + 500);
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      this.physics.add.collider(this.player.hitbox, this.lotusGroup, (hitbox, platform) => {
        if (platform.bouncePlayer && hitbox.body.touching.down) {
          platform.bouncePlayer(hitbox);
        }
      });
      this.dialogueBox = new DialogueBox(this);
      this.isGameOver = false;
      this.itemGroup = this.physics.add.staticGroup();
      const m3Items = [
        { x: 590, y: waterY - 80, type: "dewdrop" },
        { x: 1010, y: waterY - 85, type: "mushroom" },
        { x: 1430, y: waterY - 80, type: "coin" },
        { x: 1850, y: waterY - 85, type: "mushroom" }
      ];
      m3Items.forEach((i) => {
        let item = new CollectibleItem(this, i.x, i.y, i.type);
        this.itemGroup.add(item);
      });
      this.physics.add.overlap(this.player.hitbox, this.itemGroup, (hitbox, item) => item.collect(hitbox));
      this.physics.add.overlap(this.player.hitbox, this.waterDeathZone, () => {
        if (!this.isGameOver) this.gameOver();
      });
    }
    createNPC(x, y) {
      this.npc = new NPC(this, x, y - 20);
      this.npc.onInteract = () => {
        if (this.dialogueBox.active) return;
        this.player.hitbox.body.setVelocityX(0);
        this.dialogueBox.show([
          { text: "A", callback: () => this.dialogueBox.hide() },
          { text: "B", callback: () => this.dialogueBox.hide() },
          { text: "C", callback: () => this.dialogueBox.hide() },
          { text: "R\u1EDDi kh\u1ECFi n\u01A1i n\xE0y", callback: () => {
            this.cameras.main.fadeOut(1e3, 0, 0, 0);
            this.cameras.main.once("camerafadeoutcomplete", () => {
              this.scene.start("Map4Scene");
            });
          } }
        ]);
      };
    }
    update() {
      if (this.isGameOver) return;
      if (this.npc) this.npc.update(this.player);
      if (!this.dialogueBox.active) {
        this.player.updateLogic(this.cursors, this.spacebar, this.cameras.main.height - 100);
      }
    }
    gameOver() {
      this.isGameOver = true;
      this.player.setTint(16711680);
      this.player.hitbox.body.setEnable(false);
      this.cameras.main.shake(500, 0.02);
      this.time.delayedCall(1e3, () => {
        this.scene.stop("UIScene");
        this.scene.start("GameOverScene", { reason: "M\u1EA7m \u0111\xE3 ch\u1EBFt \u0111u\u1ED1i d\u01B0\u1EDBi h\u1ED3 sen.", retryScene: "Map3Scene" });
      });
    }
  };

  // src/entities/SunAwning.js
  var SunAwning = class extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width = 200, height = 180) {
      super(scene, x, y);
      scene.add.existing(this);
      this.awningWidth = width;
      this.awningHeight = height;
      AssetManager.generateAndSave(scene, "sun_awning", width, 50, (g) => {
        let seg = width / 6;
        for (let i = 0; i < 6; i++) {
          g.fillStyle(i % 2 === 0 ? 15105570 : 15844367, 1);
          g.fillRect(i * seg, 0, seg, 40);
          g.fillEllipse(i * seg + seg / 2, 40, seg, 20);
        }
        g.lineStyle(2, 13849600, 1);
        g.strokeRect(0, 0, width, 40);
      });
      this.roof = scene.add.image(0, 0, "sun_awning").setOrigin(0.5, 0);
      this.pillarLeft = scene.add.rectangle(-width / 2 + 10, height / 2, 8, height, 9323693, 0.7);
      this.pillarRight = scene.add.rectangle(width / 2 - 10, height / 2, 8, height, 9323693, 0.7);
      this.shadeGfx = scene.add.graphics();
      this.shadeGfx.fillStyle(0, 0.25);
      this.shadeGfx.fillRect(-width / 2 + 5, 40, width - 10, height - 40);
      this.add([this.shadeGfx, this.pillarLeft, this.pillarRight, this.roof]);
      this.shadeBounds = new Phaser.Geom.Rectangle(
        x - width / 2 + 5,
        y + 40,
        width - 10,
        height - 30
      );
      this.setDepth(4);
    }
    /**
     * Kiểm tra xem nhân vật có đang đứng trong vùng bóng râm của mái hiên này không
     */
    isUnder(player) {
      if (!player || !player.hitbox) return false;
      let px = player.hitbox.x;
      let py = player.hitbox.y;
      return this.shadeBounds.contains(px, py);
    }
  };

  // src/ui/HeatIndicator.js
  var HeatIndicator = class extends Phaser.GameObjects.Container {
    constructor(scene) {
      super(scene, 0, 0);
      scene.add.existing(this);
      this.setScrollFactor(0);
      this.setDepth(2e3);
      const cx = scene.cameras.main.width / 2;
      const cy = 45;
      this.bg = scene.add.rectangle(cx, cy, 260, 48, 1710618, 0.85).setStrokeStyle(3, 15844367);
      this.barBg = scene.add.rectangle(cx, cy + 8, 220, 10, 3355443);
      this.barFill = scene.add.rectangle(cx - 110, cy + 8, 220, 10, 15844367).setOrigin(0, 0.5);
      this.statusText = scene.add.text(cx, cy - 8, "\u2600\uFE0F AN TO\xC0N: 5.0s", {
        font: "bold 15px Arial",
        fill: "#ffffff"
      }).setOrigin(0.5);
      this.add([this.bg, this.barBg, this.barFill, this.statusText]);
    }
    updateHeat(timeLeft, maxTime, isUnderShade) {
      let pct = Phaser.Math.Clamp(timeLeft / maxTime, 0, 1);
      this.barFill.width = 220 * pct;
      if (isUnderShade) {
        this.bg.setStrokeStyle(3, 3066993);
        this.barFill.setFillStyle(3066993);
        this.statusText.setText("\u{1F334} B\xD3NG R\xC2M (AN TO\xC0N)");
        this.statusText.setFill("#2ecc71");
      } else {
        let secStr = timeLeft.toFixed(1) + "s";
        if (timeLeft > 3) {
          this.bg.setStrokeStyle(3, 15844367);
          this.barFill.setFillStyle(15844367);
          this.statusText.setText("\u2600\uFE0F N\u1EAENG G\u1EAET: " + secStr);
          this.statusText.setFill("#f1c40f");
        } else if (timeLeft > 1.5) {
          this.bg.setStrokeStyle(3, 15105570);
          this.barFill.setFillStyle(15105570);
          this.statusText.setText("\u{1F525} QU\xC1 NHI\u1EC6T: " + secStr);
          this.statusText.setFill("#e67e22");
        } else {
          this.bg.setStrokeStyle(3, 15158332);
          this.barFill.setFillStyle(15158332);
          this.statusText.setText("\u26A0\uFE0F S\u1EAEP CH\xC1Y: " + secStr);
          this.statusText.setFill("#ff4d4d");
        }
      }
    }
  };

  // src/scenes/Map4Scene.js
  var Map4Scene = class extends Phaser.Scene {
    constructor() {
      super("Map4Scene");
    }
    preload() {
      AssetManager.preloadAll(this);
    }
    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      const mapWidth = 3200;
      this.cameras.main.fadeIn(1e3, 0, 0, 0);
      this.scene.launch("UIScene");
      this.scene.bringToTop("UIScene");
      this.registry.set("showUI", true);
      this.cameras.main.setBackgroundColor("#f39c12");
      AssetManager.generateAndSave(this, "sun_ground", 1e3, 120, (g) => {
        g.fillStyle(13849600, 1);
        g.fillRect(0, 0, 1e3, 120);
        g.fillStyle(15105570, 1);
        g.fillRect(0, 0, 1e3, 20);
        g.lineStyle(2, 10502144, 0.7);
        for (let x = 50; x < 1e3; x += 150) {
          g.beginPath();
          g.moveTo(x, 20);
          g.lineTo(x + 15, 60);
          g.lineTo(x + 5, 100);
          g.strokePath();
        }
      });
      this.sun = this.add.circle(w / 2, 140, 90, 16771899, 0.9).setScrollFactor(0.1).setDepth(1);
      this.sunRays = this.add.circle(w / 2, 140, 130, 16752640, 0.35).setScrollFactor(0.1).setDepth(0);
      this.tweens.add({
        targets: [this.sun, this.sunRays],
        scale: 1.12,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
      let groundY = h - 100;
      this.groundGroup = this.physics.add.staticGroup();
      for (let gx = 0; gx < mapWidth; gx += 1e3) {
        let groundImg = this.add.image(gx, groundY, "sun_ground").setOrigin(0, 0).setDepth(3);
        let groundBody = this.add.rectangle(gx + 500, groundY + 60, 1e3, 120, 0, 0);
        this.physics.add.existing(groundBody, true);
        this.groundGroup.add(groundBody);
      }
      this.player = new Player(this, 120, groundY - 40);
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.physics.add.collider(this.player.hitbox, this.groundGroup);
      this.itemGroup = this.physics.add.staticGroup();
      const m4Items = [
        { x: 350, y: groundY - 45, type: "sun_crystal" },
        { x: 800, y: groundY - 45, type: "coin" },
        { x: 1300, y: groundY - 45, type: "sun_crystal" },
        { x: 1800, y: groundY - 45, type: "potion" },
        { x: 2300, y: groundY - 45, type: "sun_crystal" },
        { x: 2750, y: groundY - 45, type: "mushroom" }
      ];
      m4Items.forEach((i) => {
        let item = new CollectibleItem(this, i.x, i.y, i.type);
        this.itemGroup.add(item);
      });
      this.physics.add.overlap(this.player.hitbox, this.itemGroup, (hitbox, item) => item.collect(hitbox));
      this.awnings = [];
      const awningPositions = [
        { x: 120, width: 220 },
        // Mái hiên điểm xuất phát (an toàn)
        { x: 550, width: 200 },
        { x: 1050, width: 220 },
        { x: 1550, width: 200 },
        { x: 2050, width: 220 },
        { x: 2550, width: 240 },
        { x: 2950, width: 260 }
        // Mái hiên cổng thành cuối map
      ];
      awningPositions.forEach((pos) => {
        let awning = new SunAwning(this, pos.x, groundY - 180, pos.width, 180);
        this.awnings.push(awning);
      });
      this.endGate = this.add.rectangle(2980, groundY - 90, 80, 180, 10181046, 0.4).setStrokeStyle(4, 14254330).setDepth(2);
      this.add.text(2980, groundY - 200, "\u{1F344} C\u1ED4NG V\u01AF\u01A0NG QU\u1ED0C D\u1EA0 N\u1EA4M", {
        font: "bold 16px Arial",
        fill: "#d980fa",
        backgroundColor: "#000000aa",
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setDepth(10);
      this.cameras.main.setBounds(0, 0, mapWidth, h);
      this.physics.world.setBounds(0, 0, mapWidth, h + 200);
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      this.heatIndicator = new HeatIndicator(this);
      this.maxSunTime = 5;
      this.sunTimeLeft = 5;
      this.isUnderShade = true;
      this.isGameOver = false;
      this.isTransitioning = false;
    }
    update(time, delta) {
      if (this.isGameOver || this.isTransitioning) return;
      this.player.updateLogic(this.cursors, this.spacebar, this.cameras.main.height - 100);
      this.isUnderShade = this.awnings.some((awning) => awning.isUnder(this.player));
      if (this.isUnderShade) {
        this.sunTimeLeft = Math.min(this.maxSunTime, this.sunTimeLeft + delta / 1e3 * 4);
      } else {
        this.sunTimeLeft -= delta / 1e3;
        if (this.sunTimeLeft <= 0) {
          this.sunTimeLeft = 0;
          this.triggerSunBurn();
        }
      }
      this.heatIndicator.updateHeat(this.sunTimeLeft, this.maxSunTime, this.isUnderShade);
      if (this.player.hitbox.x >= 2950 && !this.isTransitioning) {
        this.reachFinish();
      }
    }
    triggerSunBurn() {
      this.isGameOver = true;
      this.player.setTint(16724736);
      this.player.hitbox.body.setVelocity(0, 0);
      this.player.hitbox.body.setEnable(false);
      this.cameras.main.flash(700, 255, 60, 0);
      this.cameras.main.shake(600, 0.03);
      this.time.delayedCall(1200, () => {
        this.scene.stop("UIScene");
        this.scene.start("GameOverScene", {
          reason: "M\u1EA7m \u0111\xE3 b\u1ECB \xE1nh n\u1EAFng gay g\u1EAFt c\u1EE7a \u0110\u1EBF Qu\u1ED1c Th\xE1i D\u01B0\u01A1ng thi\xEAu r\u1EE5i.",
          retryScene: "Map4Scene"
        });
      });
    }
    reachFinish() {
      this.isTransitioning = true;
      this.player.hitbox.body.setVelocity(0, 0);
      this.cameras.main.fadeOut(1200, 30, 8, 38);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.stop("UIScene");
        this.scene.start("Map5Scene");
      });
    }
  };

  // src/scenes/Map5Scene.js
  var Map5Scene = class extends Phaser.Scene {
    constructor() {
      super("Map5Scene");
    }
    create() {
      const cx = this.cameras.main.width / 2;
      const cy = this.cameras.main.height / 2;
      this.cameras.main.setBackgroundColor("#1e0826");
      this.add.particles(0, 0, "firefly", {
        x: { min: 0, max: this.cameras.main.width },
        y: { min: 0, max: this.cameras.main.height },
        lifespan: 3500,
        speed: { min: 10, max: 25 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.5, end: 0 },
        tint: 14254330,
        quantity: 3,
        blendMode: "ADD"
      });
      this.add.text(cx, cy - 60, "\u{1F344} V\u01B0\u01A1ng Qu\u1ED1c D\u1EA1 N\u1EA5m", {
        font: "bold 46px Arial",
        fill: "#d980fa",
        shadow: { offsetX: 0, offsetY: 0, color: "#9b59b6", blur: 15, stroke: true, fill: true }
      }).setOrigin(0.5);
      this.add.text(cx, cy + 10, "(Tr\u1EA1ng th\xE1i \u0111ang ph\xE1t tri\u1EC3n...)", {
        font: "italic 22px Arial",
        fill: "#bdc3c7"
      }).setOrigin(0.5);
      let backBtn = this.add.text(cx, cy + 100, "[ Quay l\u1EA1i B\u1EA3n \u0110\u1ED3 Th\u1EBF Gi\u1EDBi ]", {
        font: "bold 22px Arial",
        fill: "#2ecc71",
        backgroundColor: "#000000aa",
        padding: { x: 24, y: 12 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      backBtn.on("pointerover", () => backBtn.setStyle({ fill: "#f1c40f" }));
      backBtn.on("pointerout", () => backBtn.setStyle({ fill: "#2ecc71" }));
      backBtn.on("pointerdown", () => {
        this.scene.start("MapSelectionScene");
      });
    }
  };

  // src/main.js
  var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
      BootScene,
      MenuScene,
      MapSelectionScene,
      MapScene,
      TransitionScene,
      RunnerScene,
      Map2Scene,
      Map3Scene,
      Map4Scene,
      Map5Scene,
      IntroScene,
      DialogueScene,
      SurvivalScene,
      UIScene,
      PauseScene,
      EndingScene,
      GameOverScene,
      TextTransitionScene
    ]
  };
  var game = new Phaser.Game(config);
})();
