import BootScene from './scenes/BootScene.js';
import IntroScene from './scenes/IntroScene.js';
import MapScene from './scenes/MapScene.js';
import RunnerScene from './scenes/RunnerScene.js';
import DialogueScene from './scenes/DialogueScene.js';
import SurvivalScene from './scenes/SurvivalScene.js';
import EndingScene from './scenes/EndingScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import MenuScene from './scenes/MenuScene.js';
import PauseScene from './scenes/PauseScene.js';
import TextTransitionScene from './scenes/TextTransitionScene.js';
import UIScene from './scenes/UIScene.js';
import MapSelectionScene from './scenes/MapSelectionScene.js';
import TransitionScene from './scenes/TransitionScene.js';
import Map2Scene from './scenes/Map2Scene.js';
import Map3Scene from './scenes/Map3Scene.js';
import Map4Scene from './scenes/Map4Scene.js';
import Map5Scene from './scenes/Map5Scene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    roundPixels: true,
    physics: {
        default: 'arcade',
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

const game = new Phaser.Game(config);