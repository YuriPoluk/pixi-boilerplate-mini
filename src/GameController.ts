import AssetsPreloader from './utils/AssetsPreloader'
import GameScene from './GameScene'
import { LayoutManager } from './utils/LayoutManager'
import * as PIXI from 'pixi.js'
import UI from './UI/UI'
import SceneCards from './scenes/SceneCards'
import SceneDialog from './scenes/SceneDialog'
import SceneFire from './scenes/SceneFire'
import './utils/loadParser'

export default class GameController {
    app: PIXI.Application
    size = { w: 800, h: 600 }
    layoutManager!: LayoutManager
    scenes: GameScene[] = []
    currentScene!: GameScene

    private static instance: GameController
    private preloader: AssetsPreloader
    private ui!: UI
    private domElement: HTMLElement

    private constructor(canvas: HTMLCanvasElement) {
        this.app = new PIXI.Application({
            width: this.size.w,
            height: this.size.h,
            backgroundColor: 0x000000,
            view: canvas || document.body,
            antialias: true,
        })

        this.domElement = canvas.parentElement!

        this.app.ticker.add(this.update, this)

        this.preloader = new AssetsPreloader(this.start.bind(this))
        this.preloader.preload()
        
        this.layoutManager = new LayoutManager(this)
        this.layoutManager.fitLayout()

        let resizeTimeout: number
        window.addEventListener('resize', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(this.resize.bind(this), 100)
        })
        this.fullScrene = this.fullScrene.bind(this)
    }

    static get Instance(): GameController {
        const canvas = document.getElementById('scene') as HTMLCanvasElement
        GameController.instance =  GameController.instance || (GameController.instance = new GameController(canvas))
        return GameController.instance
    }

    showScene(w: PIXI.Container) {
        if (this.currentScene) {
            this.app.stage.removeChild(this.currentScene)
            this.currentScene.onHide?.()
        }
        this.app.stage.addChildAt(w, 0)
        w.position.set(
            this.app.renderer.width / 2,
            this.app.renderer.height / 2,
        )
        if(w instanceof GameScene) {
            w.resize()
            this.currentScene = w
            this.currentScene.onShow?.()
            return this.currentScene
        }
    }

    fullScrene() {
        this.domElement.requestFullscreen()
        this.ui.off('pointerdown', this.fullScrene)
    }

    resize(): void {
        this.layoutManager.fitLayout()

        const center = { 
            x: this.app.renderer.width / 2,
            y: this.app.renderer.height / 2,
        }

        if (this.currentScene) {
            this.currentScene.position.set(center.x, center.y)
            this.currentScene.resize()
        }

        this.ui.position.set(center.x, center.y)
        this.ui.resize()
    }

    async start() {
        this.scenes = [new SceneCards(this), new SceneDialog(this), new SceneFire(this)]
        await Promise.all(this.scenes.map(s => s.init ? s.init() : Promise.resolve()))

        this.showScene(new PIXI.Container())

        document.getElementById('loader')!.style.display = 'none'

        this.ui = new UI(this)
        this.ui.on('pointerdown', this.fullScrene)
        this.ui.eventMode = 'static'
        this.app.stage.addChildAt(this.ui, 1)
        this.ui.position.set(
            this.app.renderer.width / 2,
            this.app.renderer.height / 2,
        )
        
        this.resize()
    }

    update(): void {
        const delta = PIXI.Ticker.shared.elapsedMS

        this.currentScene?.update?.(delta)
    }
}
