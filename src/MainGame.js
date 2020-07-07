import Sprite from './libs/Sprite.js'
import LayoutManager from "./libs/LayoutManager";
import GameController from "./GameController";
import GameWorld from "./GameWorld";

export default class MainGame extends Sprite {
    constructor() {
        super();
        this.createChildren();
        document.addEventListener('keydown', this.jumpStart.bind(this));
        document.addEventListener('keyup', this.jumpEnd.bind(this));
        this.onResize();
    }

    createChildren() {
        this.background = this.addChild(new Sprite('sky'));
        this.gameWorld = this.addChild(new GameWorld());
    }

    jumpStart(key) {
        if (key.key === ' ') {
            this.gameWorld.onJumpKeyDown.bind(this.gameWorld)();
        }
    }

    jumpEnd(key) {
        if (key.key === ' ') {
            this.gameWorld.onJumpKeyUp.bind(this.gameWorld)();
        }
    }

    onResize() {
        let w = LayoutManager.gameWidth;
        let h = LayoutManager.gameHeight;

        this.background.width = w;
        this.background.height = h;

        this.gameWorld.position.set(-w/2, -h/2);
    }

    tick(delta) {
        this.gameWorld.tick(delta);
    }

}
