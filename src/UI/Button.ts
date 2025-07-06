import Sprite from '../utils/Sprite'
import { TextStyle, Text } from 'pixi.js'

export default class Button extends Sprite {
    constructor(
        backgroundAssetName: string,
        onClick: () => void,
        text?: string,
    ) {
        super(backgroundAssetName)

        if (text) {
            const style = new TextStyle({
                fontFamily: 'RobotoCondensed-VariableFont_wght.ttf',
                fontSize: 50,
                fill: 'white',
                stroke: '#8c6600',
                strokeThickness: 4,
            })

            const richText = new Text(text, style)
            this.addChild(richText)
            richText.position.set(-richText.width / 2, -richText.height / 2)
        }

        this.eventMode = 'static'
        this.on('pointerdown', onClick)
    }
}
