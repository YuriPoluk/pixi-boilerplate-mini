import GameController from './GameController'
import * as PIXI from 'pixi.js'

export default abstract class GameScene extends PIXI.Container {
    gameController = GameController.getInstance()

    constructor() {
        super()
    }

    abstract init?(): void

    abstract resize(): void

    abstract update(delta: number): void

    abstract beforeDestroy?(): void
}
