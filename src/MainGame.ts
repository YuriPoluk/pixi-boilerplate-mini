import Sprite from './utils/Sprite'
import { Orientation } from './utils/LayoutManager'
import GameScene from './GameScene'

export default class MainGame extends GameScene {
    background!: Sprite

    constructor() {
        super()
        this.init()
    }

    init(): void {
        this.background = this.addChild(new Sprite('cards_background'))
    }

    resize(): void {
        const layoutManager = this.gameController.layoutManager
        this.background.width = layoutManager.width
        this.background.height = layoutManager.height

        // if (layoutManager.orientation == Orientation.LANDSCAPE) {
        // } else {
        // }
    }
}
