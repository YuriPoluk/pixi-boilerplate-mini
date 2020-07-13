import { LayoutManager } from './libs/LayoutManager';
import GameController from "./GameController";

export default abstract class GameScene extends PIXI.Container  {
    gameController = GameController.getInstance();
    constructor() {
        super();
    }

    abstract onResize(): void;
    tick(delta: number): void {};
}