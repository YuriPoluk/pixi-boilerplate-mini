import * as PIXI from 'pixi.js'

class Sprite extends PIXI.Sprite {
    constructor(tex?: string | PIXI.Texture | undefined) {
        if (typeof tex == 'string') {
            try {
                tex = PIXI.Texture.from(tex)
            } catch (err) {
                console.log('no texture with name ' + tex)
                tex = undefined
            }
        }

        super(tex)
        this.anchor.set(0.5)
    }
}

export default Sprite
