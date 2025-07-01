import GameController from './GameController'
import * as PIXI from 'pixi.js'

export default abstract class GameScene extends PIXI.Container {
    gameController = GameController.Instance

    constructor() {
        super()
    }

    init?(): void

    abstract resize(): void

    update?(delta: number): void

    beforeDestroy?(): void
}
