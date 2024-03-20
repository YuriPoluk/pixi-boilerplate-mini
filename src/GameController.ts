import MainGame from './MainGame'
import AssetsPreloader from './utils/AssetsPreloader'
import GameScene from './GameScene'
import { LayoutManager } from './utils/LayoutManager'

export default class GameController {
    app: PIXI.Application
    size = { w: 800, h: 600 }
    layoutManager!: LayoutManager

    private static instance: GameController
    private preloader: AssetsPreloader
    private currentWindow!: GameScene

    constructor(parent: HTMLCanvasElement) {
        this.app = new PIXI.Application({
            transparent: false,
            width: this.size.w,
            height: this.size.h,
            backgroundColor: 0x000000,
            view: parent || document.body,
            antialias: true,
        })

        this.app.ticker.add(this.update, this)

        this.preloader = new AssetsPreloader(this.start.bind(this))
        this.preloader.preload()
        this.initLayoutManager()

        let resizeTimeout: number
        window.addEventListener('resize', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(this.resize.bind(this), 100)
        })

        ;(<any>window).GAME = this
        window.PIXI = PIXI
    }

    static getInstance(): GameController {
        const parent = document.getElementById('scene') as HTMLCanvasElement
        if (!GameController.instance) {
            GameController.instance = new GameController(parent)
        }

        return GameController.instance
    }

    initLayoutManager(): void {
        this.layoutManager = new LayoutManager(this)
        this.layoutManager.fitLayout()
        window.addEventListener('resize', this.resize.bind(this))
        let resizeTimeout: number
        window.addEventListener('resize', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(
                this.layoutManager.fitLayout.bind(this.layoutManager),
                100,
            )
        })
    }

    showWindow(w: GameScene): GameScene {
        if (this.currentWindow) this.app.stage.removeChild(this.currentWindow)
        this.app.stage.addChildAt(w, 0)
        w.position.set(
            this.app.renderer.width / 2,
            this.app.renderer.height / 2,
        )
        w.resize()
        this.currentWindow = w
        return this.currentWindow
    }

    resize(): void {
        if (this.currentWindow) {
            this.currentWindow.position.set(
                this.app.renderer.width / 2,
                this.app.renderer.height / 2,
            )
            this.currentWindow.resize()
        }
    }

    start(): void {
        document.getElementById('loader')!.style.display = 'none'
        this.showWindow(new MainGame())
    }

    update(): void {
        const delta = PIXI.Ticker.shared.elapsedMS

        if (this?.currentWindow) {
            this.currentWindow.update(delta)
        }
    }
}
