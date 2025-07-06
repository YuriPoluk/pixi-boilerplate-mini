import Sprite from '../utils/Sprite'
import { Orientation } from '../utils/LayoutManager'
import GameScene from '../GameScene'
import GameController from '../GameController'
import getRandomInt from '../utils/getRandomInt'
import { Point, Texture } from 'pixi.js'
import { gsap } from 'gsap'

const CARD_SUITS = ['spades', 'hearts', 'diamonds', 'clubs']
const CARD_TYPES = [
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    'jack',
    'queen',
    'king',
    'ace',
]

export default class SceneCards extends GameScene {
    private background: Sprite
    private deckStartContainer: Sprite
    private deckFinishContainer: Sprite
    private maskCardStart: Sprite
    private maskCardFinish: Sprite

    constructor(gameController: GameController) {
        super(gameController)

        this.background = this.addChild(
            new Sprite('./assets/images/cards_background.jpg'),
        )
        this.deckStartContainer = this.addChild(new Sprite())
        this.maskCardStart = this.deckStartContainer.addChild(
            new Sprite('card_empty'),
        )
        this.deckFinishContainer = this.addChild(new Sprite())
        this.maskCardFinish = this.deckFinishContainer.addChild(
            new Sprite('card_empty'),
        )
        this.maskCardFinish.visible = false

        const cardsQuantity = 144
        for (let i = 0; i < cardsQuantity; i++) {
            const suit = CARD_SUITS[getRandomInt(0, 3)]
            const type = CARD_TYPES[getRandomInt(0, 12)]

            const card = this.deckStartContainer.addChild(
                new Sprite(suit + '_' + type),
            )
            const cardPos = this.getPositionInDeck(this.deckStartContainer)
            card.position.set(cardPos.x, cardPos.y)
            card.visible = false
        }

        this.deckStartContainer.children[
            this.deckStartContainer.children.length - 1
        ].visible = true
    }

    getPositionInDeck(deckContainer: Sprite) {
        return {
            x: 0,
            y: -(deckContainer.children.length - 1) * 0.4,
        }
    }

    onShow() {
        if (this.tween) this.tween.play()
        else this.startAnimation()
    }

    onHide() {
        this.tween?.pause()
    }

    private tween?: gsap.core.Tween

    animateCard() {
        //the idea is to render only couple of cards. Place empty white cards which are used to make the 'volume',
        // keep all of the cards invisible except for the ones that are actually visible
        const cards = this.deckStartContainer.children
        const card = this.deckStartContainer.removeChildAt(cards.length - 1)
        const currentPositionInLocalCoords = this.deckFinishContainer.toLocal(
            card,
            this.deckStartContainer,
        )
        this.deckFinishContainer.addChild(card)
        card.position.set(
            currentPositionInLocalCoords.x,
            currentPositionInLocalCoords.y,
        )
        const finishPosition = this.getPositionInDeck(this.deckFinishContainer)

        return gsap.to(card.position, {
            x: finishPosition.x,
            y: finishPosition.y,
            duration: 2,
            delay: 0.2,
            ease: 'power2.out',
            onStart: () => {
                const maskCard =
                    this.deckStartContainer.children[cards.length - 1]
                if (this.deckStartContainer.children.length > 1) {
                    //make next card in top deck visible
                    maskCard.visible = true
                } else {
                    //or remove the last white mask card if there's no cards left
                    maskCard.visible = false
                }
            },
            onComplete: () => {
                if (this.deckStartContainer.children.length > 1)
                    this.tween = this.animateCard()
                const cards = this.deckFinishContainer.children
                const card = this.deckFinishContainer.children[cards.length - 3]
                //make covered card invisible
                card.visible = false
                this.maskCardFinish.visible = true
            },
        })
    }

    startAnimation() {
        this.animateCard()
    }

    resize(): void {
        const { width, height, orientation } = this.gameController.layoutManager

        this.background.width = width
        this.background.height = height

        const CARD_WIDTH = 120
        const cardScale = CARD_WIDTH / this.maskCardFinish.width
        this.deckFinishContainer.scale.set(cardScale)
        this.deckStartContainer.scale.set(cardScale)

        if (orientation == Orientation.LANDSCAPE) {
            this.background.width = width
            this.background.scale.y = this.background.scale.x
            this.deckStartContainer.position.set(-width * 0.25, 0)
            this.deckFinishContainer.position.set(width * 0.25, 0)
        } else {
            this.background.height = height
            this.background.scale.x = this.background.scale.y
            this.deckStartContainer.position.set(0, -height * 0.25)
            this.deckFinishContainer.position.set(0, height * 0.25)
        }
    }
}
