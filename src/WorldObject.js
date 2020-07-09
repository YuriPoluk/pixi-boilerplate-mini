import Sprite from './libs/Sprite.js'


export default class WorldObject extends Sprite {
    constructor(type, textureName) {
        super();
        this.type = type;
        if(typeof textureName == 'string') {
            this.view = this.addChild(new Sprite(textureName));
        }
        else if(Array.isArray(textureName)) {
            this.view = this.addChild(PIXI.AnimatedSprite.fromFrames(textureName));
            this.view.play();
            this.view.animationSpeed = textureName.length / 24;
        }
    }
}

WorldObject.TYPES = {
    FLOOR: 0,
    SKY_OBJECT: 1,
    OBSTACLE: 2
}

WorldObject.getRandomObj = (objType) => {
    switch (objType) {
        case WorldObject.TYPES.FLOOR:
            return new WorldObject(WorldObject.TYPES.FLOOR, 'floor_tile_' + Math.floor(Math.random() * 3));
        case WorldObject.TYPES.SKY_OBJECT:
            const rand = Math.random();
            if(rand <= 0.5) {
                return new WorldObject(WorldObject.TYPES.SKY_OBJECT, 'cloud');
            }
            else {
                return new WorldObject(WorldObject.TYPES.SKY_OBJECT, ['bird_1', 'bird_2']);
            }
        case WorldObject.TYPES.OBSTACLE:
            return new WorldObject(WorldObject.TYPES.OBSTACLE, 'cactus_' + Math.floor(Math.random() * 11));
        default:
            throw 'incorrect WorldObject type'
    }
}

