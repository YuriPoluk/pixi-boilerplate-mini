import Sprite from './utils/Sprite'
import { Orientation } from './utils/LayoutManager'
import GameScene from './GameScene'
import GameController from './GameController'

export default class UI extends GameScene {

    background!: Sprite

    constructor() {
        super()
        this.init()
    }

    init(): void {
        this.background = this.addChild(new Sprite('ui_background'))
    }

    resize(): void {
        const lm = this.gameController.layoutManager

        if (lm.orientation == Orientation.LANDSCAPE) {
            this.background.width = lm.width
            this.background.scale.y = this.background.scale.x
        } else {
            this.background.height = lm.height
            this.background.scale.x = this.background.scale.y
        }
    }
}
