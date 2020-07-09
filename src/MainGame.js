import Sprite from './libs/Sprite.js'
import LayoutManager from "./libs/LayoutManager";
import GameController from "./GameController";
import GameWorld from "./GameWorld";

export default class MainGame extends Sprite {
    constructor() {
        super();
        this.createChildren();
        this.start();

        this.gameWorld.on('game_over', this.onGameOver, this);
        this.retryBtn.on('pointerdown', this.retry, this);
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    createChildren() {
        this.background = this.addChild(new Sprite('sky'));
        this.gameWorld = this.addChild(new GameWorld());
        this.UICnt = this.addChild(new Sprite());
        this.retryBtn = this.UICnt.addChild(new Sprite('retry'));
        this.retryBtn.interactive = true;
        this.retryBtn.visible = false;
    }

    onKeyDown(key) {
        const handlers = {
            ' ': this.gameWorld.onJumpKeyDown,
            'Control': this.gameWorld.onCrouchKeyDown
        }
        if(handlers[key.key])
            handlers[key.key].bind(this.gameWorld)();
    }

    onKeyUp(key) {
        const handlers = {
            ' ': this.gameWorld.onJumpKeyUp,
            'Control': this.gameWorld.onCrouchKeyUp
        }
        if(handlers[key.key])
            handlers[key.key].bind(this.gameWorld)();
    }

    onResize() {
        let w = LayoutManager.gameWidth;
        let h = LayoutManager.gameHeight;

        this.background.width = w;
        this.background.height = h;

        this.gameWorld.scale.set(h*0.5 / this.gameWorld.HEIGHT);
        this.gameWorld.position.set(-w/2, -h/4);

        console.log(w * 0.1, this.retryBtn.width)
        this.retryBtn.scale.set(w * 0.075 / this.retryBtn.width);
    }

    start() {

    }

    onGameOver() {
        this.retryBtn.visible = true;
    }

    retry() {
        GameController.start();
    }


    tick(delta) {
        this.gameWorld.tick(delta);
    }

}
