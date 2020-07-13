import Sprite from './libs/Sprite'

export enum WorldObjectTypes {
    FLOOR,
    SKY_OBJECT,
    OBSTACLE
}

export class WorldObject extends Sprite {
    type: WorldObjectTypes;
    view: Sprite | PIXI.AnimatedSprite;
    isGarbage = false;
    speed?: number;

    constructor(type: WorldObjectTypes, textureName: string | string[]) {
        super();
        this.type = type;
        if(typeof textureName === 'string') {
            this.view = this.addChild(new Sprite(textureName));
        }
        else {
            this.view = this.addChild(PIXI.AnimatedSprite.fromFrames(textureName));
            if(this.view instanceof PIXI.AnimatedSprite) {
                this.view.play();
                this.view.animationSpeed = textureName.length / 24;
            }
        }
    }

    static getRandomObj(objType: WorldObjectTypes): WorldObject {
        switch (objType) {
            case WorldObjectTypes.FLOOR:
                return new WorldObject(WorldObjectTypes.FLOOR, 'floor_tile_' + Math.floor(Math.random() * 3));
            case WorldObjectTypes.SKY_OBJECT: {
                const rand = Math.random();
                if(rand <= 0.5) {
                    return new WorldObject(WorldObjectTypes.SKY_OBJECT, 'cloud');
                }
                else {
                    return new WorldObject(WorldObjectTypes.SKY_OBJECT, ['bird_1', 'bird_2']);
                }
            }
            case WorldObjectTypes.OBSTACLE:
                return new WorldObject(WorldObjectTypes.OBSTACLE, 'cactus_' + Math.floor(Math.random() * 11));
            default:
                throw 'incorrect WorldObject type'
        }
    }
}



