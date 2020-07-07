import Sprite from './libs/Sprite.js'
import LayoutManager from "./libs/LayoutManager";
import WorldObject from "./WorldObject";

export default class GameWorld extends PIXI.Container {
    constructor() {
        super();
        this.floorTiles = [];
        this.skyObjects = [];
        this.obstacles = [];
        this.allObjectsArrays = [this.floorTiles, this.skyObjects, this.obstacles];
        LayoutManager.fitLayout();
        this.WIDTH = LayoutManager.gameWidth;
        this.HEIGHT = LayoutManager.gameHeight;
        this.FLOOR_TILE_WIDTH = 50;
        this.FLOOR_TILES_QUANTITY = 1 + Math.ceil(this.WIDTH / this.FLOOR_TILE_WIDTH) + 1;
        this.PLAYER_MOVE_SPEED = 0.5;
        this.isPlayerLocked = false;
        this.playerJumpImpulse = 0;
        this.isMaxJumpHeightReached = false;
        this.isMinJumpHeightReached = false;
        this.FLOOR_Y = undefined;
        this.jumpHeight = {
            min: this.HEIGHT * 0.15,
            max: this.HEIGHT * 0.35
        }
        this.initWorld();
    }

    initWorld() {
        for(let i = 0; i < this.FLOOR_TILES_QUANTITY; i++) {
            this.spawnGameObject(WorldObject.TYPES.FLOOR)
        }


        this.player = this.addChild(new Sprite('dinosaur'));
        this.player.scale.set(0.4);
        this.player.position.set(this.WIDTH * 0.1, this.HEIGHT*0.95 - this.FLOOR_TILE_WIDTH/2 - this.player.height/2);
        this.FLOOR_Y = this.player.y;
        this.jumpHeight.min  = this.player.y - this.jumpHeight.min;
        this.jumpHeight.max  = this.player.y - this.jumpHeight.max;
    }

    onJumpKeyDown() {
        if(this.isPlayerLocked)
            return;

        this.isJumpKeyPressed = true;
        this.isPlayerLocked = true;
    }

    onJumpKeyUp() {
        this.isJumpKeyPressed = false;
    }

    spawnGameObject(type) {
        if(type === WorldObject.TYPES.FLOOR || type === WorldObject.TYPES.SKY_OBJECT) {
            let floorTile = this.addChild(new WorldObject('floor_tile', WorldObject.TYPES.FLOOR));
            floorTile.view.scale.set(this.FLOOR_TILE_WIDTH / floorTile.view.width);
            const lastTilePosX = this.floorTiles.length > 0 ? this.floorTiles[this.floorTiles.length - 1].x : 0;
            floorTile.position.set(lastTilePosX + floorTile.view.width, this.HEIGHT * 0.95);
            this.floorTiles.push(floorTile);
        }
    }

    destroyGarbageObjects() {
        for(let arr of this.allObjectsArrays) {
            while(arr[0]?.isGarbage) {
                const obj = arr.shift();
                obj.parent.removeChild(obj);
                if(obj.type == WorldObject.TYPES.FLOOR) {
                    this.spawnGameObject(WorldObject.TYPES.FLOOR)
                }
            }
        }
    }

    tick(delta) {

        for(let arr of this.allObjectsArrays) {
            for(let gameObj of arr) {
                gameObj.x -= this.PLAYER_MOVE_SPEED * delta;
                if(gameObj.x < -gameObj.view.width/2) {
                    gameObj.isGarbage = true;
                }
            }
        }

        this.destroyGarbageObjects();

        //jump high
        if(this.isJumpKeyPressed && !this.isMaxJumpHeightReached) {
            this.player.y -= 30;
            if(this.player.y < this.jumpHeight.max) {
                this.player.y = this.jumpHeight.max;
                this.isMaxJumpHeightReached = true;
            }
        }
        //jump min
        else if(this.player.y < this.FLOOR_Y && this.isMinJumpHeightReached) {
            this.player.y -= 30;
            if(this.player.y < this.jumpHeight.min) {
                this.player.y = this.jumpHeight.min;
                this.isMinJumpHeightReached = true;
            }
        }
        //fall
        else if(this.player.y < this.FLOOR_Y) {
                this.player.y += 45;
                if(this.player.y > this.FLOOR_Y) {
                    this.player.y = this.FLOOR_Y;
                    this.isMaxJumpHeightReached = false;
                    this.isMinJumpHeightReached = false;
                    this.isPlayerLocked = false;
                }
        }
    }

}
