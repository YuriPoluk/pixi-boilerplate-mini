import CONFIG from '../config'
import GameController from '../GameController'

export enum Orientation {
    PORTRAIT,
    LANDSCAPE,
}

export class LayoutManager {
    width = 0
    height = 0
    orientation!: Orientation
    gameController: GameController

    constructor(gameController: GameController) {
        this.gameController = gameController
    }

    fitLayout(): void {
        const w = window.innerWidth
        const h = window.innerHeight

        if (this.width === w && this.height === h) return

        this.gameController.app.view.style.width = w + 'px'
        this.gameController.app.view.style.height = h + 'px'

        this.orientation = w > h ? Orientation.LANDSCAPE : Orientation.PORTRAIT

        if (!CONFIG.portraitEnabled) this.orientation = Orientation.LANDSCAPE
        if (!CONFIG.landscapeEnabled) this.orientation = Orientation.PORTRAIT

        const gameRatio =
            this.gameController.size.w / this.gameController.size.h
        const canvasRatio = w / h
        let gw, gh //new renderer dimentions

        if (gameRatio > canvasRatio) {
            gh = this.gameController.size.h
            gw = Math.floor(gh * canvasRatio)
        } else {
            gw = this.gameController.size.w
            gh = Math.floor(gw * canvasRatio)
        }

        if (this.orientation == Orientation.LANDSCAPE) {
            const temp = gw
            gw = gh
            gh = temp
        }

        this.width = gw
        this.height = gh

        this.gameController.app.renderer.resize(gw, gh)
        this.gameController.resize()
    }
}
