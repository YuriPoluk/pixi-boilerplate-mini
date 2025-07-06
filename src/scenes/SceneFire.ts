import Sprite from '../utils/Sprite'
import { Orientation } from '../utils/LayoutManager'
import GameScene from '../GameScene'
import GameController from '../GameController'
import { Emitter, upgradeConfig } from '@pixi/particle-emitter'
import { Container, Graphics, Texture } from 'pixi.js'
import config from '../emitterConfig'

export default class SceneFire extends GameScene {
    background!: Graphics
    particleContainer: Container
    emitter: Emitter

    constructor(gameController: GameController) {
        super(gameController)

        let obj = new Graphics()
        obj.beginFill(0x898989)
        obj.drawRect(0, 0, 200, 100)
        this.background = this.addChild(obj)

        this.particleContainer = this.addChild(new Container())
        const particleTexture = Texture.from('smoke_particle')
        this.emitter = new Emitter(
            this.particleContainer,
            upgradeConfig(config, [particleTexture]),
        )
        this.emitter.emit = true
    }

    resize(): void {
        const lm = this.gameController.layoutManager
        const { width, height, orientation } = lm
        this.particleContainer.position.set(0, 0)
        this.background.width = width
        this.background.height = height
        this.background.position.set(-width / 2, -height / 2)
    }

    update(dt: number) {
        this.emitter.update(dt * 0.001)
    }
}
