import Sprite from './libs/Sprite.js'


export default class WorldObject extends Sprite {
    constructor(texture_name, type) {
        super();
        this.view = this.addChild(new Sprite(PIXI.Texture.from('cactus_1')));
        this.type = type;
    }
}

WorldObject.TYPES = {
    FLOOR: 0,
    SKY_OBJECT: 1,
    OBSTACLE: 2
}

