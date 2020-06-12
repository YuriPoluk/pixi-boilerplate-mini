import Sprite from './libs/Sprite.js'
import LayoutManager from "./libs/LayoutManager";
import GameController from "./GameController";

export default class MainGame extends Sprite {
    constructor() {
        super();
        this.createChildren();
    }

    createChildren() {
        this.background = this.addChild(new Sprite('color_grid'));
    }

    onResize() {
        let w = LayoutManager.gameWidth;
        let h = LayoutManager.gameHeight;

        this.background.width = w;
        this.background.height = h;
    }

    tick(delta) {

    }

}
