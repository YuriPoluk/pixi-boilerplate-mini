import GameController from './GameController'
import * as PIXI from 'pixi.js'

export default abstract class GameScene extends PIXI.Container {
    gameController: GameController

    constructor(gameController: GameController) {
        super()
        this.gameController = gameController
    }

    init?(): Promise<any>

    onShow?(): void

    onHide?(): void

    abstract resize(): void

    update?(delta: number): void
}
