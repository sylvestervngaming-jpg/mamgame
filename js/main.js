let baseW = 1280;
let baseH = 720;
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: baseW,
        height: baseH
    },
    // Bắt buộc render nội bộ ở độ phân giải siêu cao (3x ~ 4K) để mọi text/UI sắc nét tuyệt đối
    resolution: Math.max(3, window.devicePixelRatio || 1),
    antialias: true, // Chống răng cưa
    antialiasGL: true,
    roundPixels: false,
    clearBeforeRender: true,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // Đổi thành true nếu muốn xem hitbox
        }
    },
    scene: [
        BootScene, 
        MenuScene, 
        IntroScene, 
        MapScene, 
        RunnerScene, 
        DialogueScene, 
        SurvivalScene, 
        EndingScene, 
        GameOverScene,
        TextTransitionScene,
        UIScene,
        PauseScene,
        MapSelectionScene,
        TransitionScene,
        Map2Scene, Map3Scene
    ]
};

const game = new Phaser.Game(config);
