import Sprite from './libs/Sprite.js'
import LayoutManager from "./libs/LayoutManager";
import WorldObject from "./WorldObject";
import Dino from "./Dino";

export default class GameWorld extends PIXI.Container {
    constructor() {
        super();
        this.floorTiles = [];
        this.skyObjects = [];
        this.obstacles = [];
        this.allObjectsArrays = [this.floorTiles, this.skyObjects, this.obstacles];
        this.objectsToSpawn = [];

        this.TILE_WIDTH = 200;
        this.FLOOR_TILES_QUANTITY = 8;
        this.HEIGHT = 160;
        this.WIDTH = this.FLOOR_TILES_QUANTITY * this.TILE_WIDTH;
        this.PLAYER_MOVE_SPEED = 0.3;
        this.SKY_OBJ_BASE_SPEED = 0.15;

        this.isGameOver = false;
        this.isPlayerLocked = false;
        this.playerJumpImpulse = 0;
        this.isMaxJumpHeightReached = false;
        this.isMinJumpHeightReached = false;
        this.FLOOR_Y = undefined;
        this.jumpHeight = {
            min: 40,
            max: 100
        }

        this.worldCnt = this.addChild(new PIXI.Container());
        this.playerCnt = this.addChild(new PIXI.Container());
        this.initWorld();
    }

    initWorld() {
        for(let i = 0; i < this.FLOOR_TILES_QUANTITY; i++) {
            this.spawnWorldObject(WorldObject.TYPES.FLOOR);
        }
        this.spawnWorldObject(WorldObject.TYPES.OBSTACLE);
        this.spawnWorldObject(WorldObject.TYPES.SKY_OBJECT);


        this.dino = this.playerCnt.addChild(new Dino());
        this.dino.position.set(100, this.HEIGHT - 2);
        this.FLOOR_Y = this.dino.y;
        this.jumpHeight.min  = this.dino.y - this.jumpHeight.min;
        this.jumpHeight.max  = this.dino.y - this.jumpHeight.max;
    }

    onJumpKeyDown() {
        this.isJumpKeyPressed = true;
        if(this.isPlayerLocked || this.dino.state == Dino.STATES.CROUCH)
            return;

        this.isPlayerLocked = true;
    }

    onJumpKeyUp() {
        this.isJumpKeyPressed = false;
        this.dino.jump();
    }

    onCrouchKeyDown() {
        this.isCrouchKeyPressed = true;
        if(!this.isPlayerLocked)
            this.dino.crouch();
    }

    onCrouchKeyUp() {
        this.isCrouchKeyPressed = false;
        if(this.dino.state == Dino.STATES.CROUCH)
            this.dino.run();
    }

    spawnWorldObject(type) {
        const worldObj = this.worldCnt.addChild(WorldObject.getRandomObj(type));
        if(type == WorldObject.TYPES.FLOOR) {
            const lastTilePosX = this.floorTiles.length > 0 ? this.floorTiles[this.floorTiles.length - 1].x : -this.TILE_WIDTH/2;
            worldObj.position.set(lastTilePosX + worldObj.view.width, this.HEIGHT - worldObj.view.height/2);
            this.floorTiles.push(worldObj);
        }
        else if(type == WorldObject.TYPES.SKY_OBJECT) {
            worldObj.position.set(this.WIDTH + worldObj.view.width, this.HEIGHT * 0.1);
            worldObj.speed = this.SKY_OBJ_BASE_SPEED * (1 + Math.random());
            this.skyObjects.push(worldObj);
        }
        else if(type == WorldObject.TYPES.OBSTACLE) {
            worldObj.position.set(this.WIDTH + worldObj.view.width, this.HEIGHT - worldObj.view.height/2);
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

    controls() {
        //Dino is in the air and crouch button pressed
        if(this.isCrouchKeyPressed && this.isPlayerLocked) {
            this.dino.y += 55;
            if(this.dino.y >= this.FLOOR_Y) {
                this.isMaxJumpHeightReached = false;
                this.isMinJumpHeightReached = false;
                this.isPlayerLocked = false;

                this.dino.y = this.FLOOR_Y;
                this.dino.crouch();
            }
        }
        else {
            //jump high
            if(this.isJumpKeyPressed && !this.isMaxJumpHeightReached) {
                this.dino.y -= 10;
                if(this.dino.y < this.jumpHeight.max) {
                    this.dino.y = this.jumpHeight.max;
                    this.isMaxJumpHeightReached = true;
                }
            }
            //jump min
            else if(this.dino.y < this.FLOOR_Y && this.isMinJumpHeightReached) {
                this.dino.y -= 3;
                if(this.dino.y < this.jumpHeight.min) {
                    this.dino.y = this.jumpHeight.min;
                    this.isMinJumpHeightReached = true;
                }
            }
            //fall
            else if(this.dino.y < this.FLOOR_Y) {
                this.dino.y += 5;
                if(this.dino.y >= this.FLOOR_Y) {
                    this.isMaxJumpHeightReached = false;
                    this.isMinJumpHeightReached = false;
                    this.isPlayerLocked = false;

                    this.dino.y = this.FLOOR_Y;
                    this.dino.run();
                }
            }
        }
    }

    checkCollisions() {
        for(const obstacle of this.obstacles) {
            if( Math.abs(this.dino.x - obstacle.x) < (this.dino.currentView.width + obstacle.view.width)*0.4 &&
                Math.abs(this.dino.y - obstacle.y) < (this.dino.currentView.height + obstacle.view.height)*0.4) {
                    this.onGameOver();
            }
        }
    }

    onGameOver() {
        this.dino.crash();
        this.isGameOver = true;
        this.emit('game_over');
    }

    tick(delta) {
        if(this.isGameOver) return;

        this.controls(delta);
        this.checkCollisions();

        this.moveWorldObjects(delta);
        this.destroyGarbageObjects();
        this.spawnQueuedObjects(delta);
    }

}
