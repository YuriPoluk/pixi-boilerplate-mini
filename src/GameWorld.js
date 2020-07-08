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
        this.objectsToSpawn = [];
        LayoutManager.fitLayout();
        this.WIDTH = LayoutManager.gameWidth;
        this.HEIGHT = LayoutManager.gameHeight;
        this.FLOOR_TILE_WIDTH = this.WIDTH / 7;
        this.WORLD_SCALE = this.FLOOR_TILE_WIDTH / 200;
        this.FLOOR_TILES_QUANTITY = 8;
        this.PLAYER_MOVE_SPEED = 0.5;
        this.SKY_OBJ_BASE_SPEED = 0.25;
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
            this.spawnWorldObject(WorldObject.TYPES.FLOOR);
        }
        this.spawnWorldObject(WorldObject.TYPES.OBSTACLE);
        this.spawnWorldObject(WorldObject.TYPES.SKY_OBJECT);


        this.player = this.addChild(new Sprite(PIXI.Texture.from('cactus_1')));
        this.player.scale.set(this.floorTiles[0].scale.x);
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

    spawnWorldObject(type) {
        const worldObj = this.addChild(WorldObject.getRandomObj(type));
        worldObj.view.scale.set(this.WORLD_SCALE);
        if(type == WorldObject.TYPES.FLOOR) {
            const lastTilePosX = this.floorTiles.length > 0 ? this.floorTiles[this.floorTiles.length - 1].x : 0;
            worldObj.position.set(lastTilePosX + worldObj.view.width, this.HEIGHT * 0.95);
            this.floorTiles.push(worldObj);
        }
        else if(type == WorldObject.TYPES.SKY_OBJECT) {
            worldObj.position.set(this.WIDTH + worldObj.view.width, this.HEIGHT * 0.1);
            worldObj.speed = this.SKY_OBJ_BASE_SPEED * (1 + Math.random());
            this.skyObjects.push(worldObj);
        }
        else if(type == WorldObject.TYPES.OBSTACLE) {
            worldObj.position.set(this.WIDTH + worldObj.view.width, this.HEIGHT * 0.95);
            this.obstacles.push(worldObj);
        }
    }

    destroyGarbageObjects() {
        for(let arr of this.allObjectsArrays) {
            while(arr[0]?.isGarbage) {
                const obj = arr.shift();
                obj.parent.removeChild(obj);
                if(obj.type == WorldObject.TYPES.FLOOR) {
                    this.spawnWorldObject(WorldObject.TYPES.FLOOR)
                }
                else {
                    this.queueWorldObject(obj.type);
                }
            }
        }
    }

    queueWorldObject(type) {
        if(type == WorldObject.TYPES.SKY_OBJECT) {
            this.objectsToSpawn.push({
                type: type,
                spawnIn: Math.random() * 3000,
            });
        }
        else if(type == WorldObject.TYPES.OBSTACLE) {
            this.objectsToSpawn.push({
                type: type,
                spawnIn: Math.random() * 1000,
            });
        }
    }

    spawnQueuedObjects(delta) {
        for (const obj of this.objectsToSpawn) {
            obj.spawnIn -= delta;
            if(obj.spawnIn <= 0) {
                this.spawnWorldObject(obj.type)
            }
        }

        let arrCleared = !Boolean(this.objectsToSpawn.length);
        while (!arrCleared) {
            for(let i = 0; i < this.objectsToSpawn.length; i++) {
                if(i == this.objectsToSpawn.length - 1)
                    arrCleared = true;
                if(this.objectsToSpawn[i].spawnIn <= 0) {
                    this.objectsToSpawn.splice(i, 1);
                    break;
                }
            }
        }
    }

    moveWorldObjects(delta) {
        for(let arr of this.allObjectsArrays) {
            for(let gameObj of arr) {
                const speed = gameObj.type === WorldObject.TYPES.SKY_OBJECT ? gameObj.speed : this.PLAYER_MOVE_SPEED;
                gameObj.x -= speed * delta;
                if(gameObj.x < -gameObj.view.width/2) {
                    gameObj.isGarbage = true;
                }
            }
        }
    }

    tick(delta) {

        console.log(delta)
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

        this.moveWorldObjects(delta);
        this.destroyGarbageObjects();
        this.spawnQueuedObjects(delta);
    }

}
