import MainGame from './MainGame'
import AssetsPreloader from './utils/AssetsPreloader'
import GameScene from './GameScene'
import { LayoutManager } from './utils/LayoutManager'
import * as PIXI from 'pixi.js'
import UI from './UI'

export default class GameController {
    app: PIXI.Application
    size = { w: 800, h: 600 }
    layoutManager!: LayoutManager

    private static instance: GameController
    private preloader: AssetsPreloader
    private currentScene!: GameScene
    private ui!: UI

    private constructor(parent: HTMLCanvasElement) {
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
        window.PIXI = PIXI
    }

    static get Instance(): GameController {
        const parent = document.getElementById('scene') as HTMLCanvasElement
        return GameController.instance || (GameController.instance = new GameController(parent))
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

    showScene(w: GameScene): GameScene {
        if (this.currentScene) this.app.stage.removeChild(this.currentScene)
        this.app.stage.addChildAt(w, 0)
        w.position.set(
            this.app.renderer.width / 2,
            this.app.renderer.height / 2,
        )
        w.resize()
        this.currentScene = w
        return this.currentScene
    }

    resize(): void {
        if (this.currentScene) {
            this.currentScene.position.set(
                this.app.renderer.width / 2,
                this.app.renderer.height / 2,
            )
            this.currentScene.resize()
        }
    }

    start(): void {
        this.showScene(new MainGame())
        document.getElementById('loader')!.style.display = 'none'
        this.ui = new UI()
        this.app.stage.addChildAt(this.ui, 0)
        this.ui.position.set(
            this.app.renderer.width / 2,
            this.app.renderer.height / 2,
        )
        this.ui.resize()
    }

    update(): void {
        const delta = PIXI.Ticker.shared.elapsedMS

        this.currentScene?.update?.(delta)
    }
}
