import Sprite from '../utils/Sprite'
import { Orientation } from '../utils/LayoutManager'
import GameScene from '../GameScene'
import GameController from '../GameController'
import Button from './Button'
import { gsap } from 'gsap'
import { Container } from 'pixi.js'

export default class UI extends GameScene {
    private background!: Sprite
    private button1!: Sprite
    private button2!: Sprite
    private button3!: Sprite
    private buttonBack!: Sprite
    private overlayContainer!: Container

    constructor(gameController: GameController) {
        super(gameController)

        this.setScene1 = this.setScene1.bind(this)
        this.setScene2 = this.setScene2.bind(this)
        this.setScene3 = this.setScene3.bind(this)
        this.switchOverlayVisibility = this.switchOverlayVisibility.bind(this)

        this.overlayContainer = this.addChild(new Container())
        this.background = this.overlayContainer.addChild(
            new Sprite('./assets/images/ui_background.jpg'),
        )
        this.button1 = this.overlayContainer.addChild(
            new Button('bt_b', this.setScene1, 'CARDS'),
        )
        this.button2 = this.overlayContainer.addChild(
            new Button('bt_p', this.setScene2, 'DIALOG'),
        )
        this.button3 = this.overlayContainer.addChild(
            new Button('bt_y', this.setScene3, 'FIRE'),
        )
        this.buttonBack = this.addChild(
            new Button('arrow_left', this.switchOverlayVisibility),
        )
    }

    private overlayVisibility = true

    setOverlayVisibility(v: boolean) {
        if (v == this.overlayVisibility) return

        this.overlayVisibility = v
        const targetOpacity = v ? 1 : 0
        gsap.to(this.overlayContainer, {
            alpha: targetOpacity,
            duration: 0.25,
        })
    }

    switchOverlayVisibility() {
        this.setOverlayVisibility(!this.overlayVisibility)
        this.overlayVisibility
            ? this.gameController.currentScene?.onHide?.()
            : this.gameController.currentScene?.onShow?.()
    }

    setScene1() {
        this.gameController.showScene(this.gameController.scenes[0])
        this.setOverlayVisibility(false)
    }

    setScene2() {
        this.gameController.showScene(this.gameController.scenes[1])
        this.setOverlayVisibility(false)
    }

    setScene3() {
        this.gameController.showScene(this.gameController.scenes[2])
        this.setOverlayVisibility(false)
    }

    resize(): void {
        const { width, height, orientation } = this.gameController.layoutManager

        const backgroundRatio = this.background.width / this.background.height
        const screenRatio = width / height

        if (backgroundRatio < screenRatio) {
            this.background.width = width
            this.background.scale.y = this.background.scale.x
        } else {
            this.background.height = height
            this.background.scale.x = this.background.scale.y
        }

        if (orientation == Orientation.LANDSCAPE) {
            const buttonWidth = width * 0.25

            this.button1.width = buttonWidth
            this.button1.scale.y = this.button1.scale.x
            this.button1.position.set(0, -0.25 * height)

            this.button2.width = buttonWidth
            this.button2.scale.y = this.button2.scale.x
            this.button2.position.set(0, 0)

            this.button3.width = buttonWidth
            this.button3.scale.y = this.button3.scale.x
            this.button3.position.set(0, 0.25 * height)

            this.buttonBack.width = width * 0.05
            this.buttonBack.scale.y = this.buttonBack.scale.x
            this.buttonBack.position.set(
                width / 2 - this.buttonBack.width,
                -height / 2 + this.buttonBack.height,
            )
        } else if (orientation == Orientation.PORTRAIT) {
            const buttonHeight = height * 0.1

            this.button1.height = buttonHeight
            this.button1.scale.x = this.button1.scale.y
            this.button1.position.set(0, -0.2 * height)

            this.button2.height = buttonHeight
            this.button2.scale.x = this.button2.scale.y
            this.button2.position.set(0, 0)

            this.button3.height = buttonHeight
            this.button3.scale.x = this.button3.scale.y
            this.button3.position.set(0, 0.2 * height)

            this.buttonBack.height = height * 0.05
            this.buttonBack.scale.x = this.buttonBack.scale.y
            this.buttonBack.position.set(
                width / 2 - this.buttonBack.width,
                -height / 2 + this.buttonBack.height,
            )
        }
    }
}
