import { WorldObjectTypes, WorldObject} from "./WorldObject";
import { Dino, DinoStates } from "./Dino";

export default class GameWorld extends PIXI.Container {
    floorTiles: WorldObject[] = []
    skyObjects: WorldObject[] = [];
    obstacles: WorldObject[] = [];
    allObjectsArrays: WorldObject[][] = [];
    objectsToSpawn: { type: WorldObjectTypes, spawnIn: number }[] = [];

    TILE_WIDTH = 200;
    FLOOR_TILES_QUANTITY = 8;
    HEIGHT = 160;
    WIDTH = this.FLOOR_TILES_QUANTITY * this.TILE_WIDTH;
    PLAYER_MOVE_SPEED = 0.3;
    SKY_OBJ_BASE_SPEED = 0.15;

    isJumpKeyPressed = false;
    isCrouchKeyPressed = false;


    isGameOver = false;
    isPlayerLocked = false;
    isMaxJumpHeightReached = false;
    isMinJumpHeightReached = false;
    FLOOR_Y!: number;
    JUMP_HEIGHT = {
        min: 40,
        max: 100
    };

    worldCnt = this.addChild(new PIXI.Container());
    playerCnt = this.addChild(new PIXI.Container());
    dino!: Dino;

    constructor() {
        super();
        this.allObjectsArrays = [this.floorTiles, this.skyObjects, this.obstacles];
        this.initWorld();
    }

    initWorld(): void {
        for(let i = 0; i < this.FLOOR_TILES_QUANTITY; i++) {
            this.spawnWorldObject(WorldObjectTypes.FLOOR);
        }
        this.spawnWorldObject(WorldObjectTypes.OBSTACLE);
        this.spawnWorldObject(WorldObjectTypes.SKY_OBJECT);


        this.dino = this.playerCnt.addChild(new Dino());
        this.dino.position.set(100, this.HEIGHT - 2);
        this.FLOOR_Y = this.dino.y;
        this.JUMP_HEIGHT.min  = this.dino.y - this.JUMP_HEIGHT.min;
        this.JUMP_HEIGHT.max  = this.dino.y - this.JUMP_HEIGHT.max;
    }

    onJumpKeyDown(): void {
        this.isJumpKeyPressed = true;
        if(this.isPlayerLocked || this.dino.state == DinoStates.CROUCH)
            return;

        this.isPlayerLocked = true;
    }

    onJumpKeyUp(): void {
        this.isJumpKeyPressed = false;
        this.dino.jump();
    }

    onCrouchKeyDown(): void {
        this.isCrouchKeyPressed = true;
        if(!this.isPlayerLocked)
            this.dino.crouch();
    }

    onCrouchKeyUp(): void {
        this.isCrouchKeyPressed = false;
        if(this.dino.state == DinoStates.CROUCH)
            this.dino.run();
    }

    spawnWorldObject(type: WorldObjectTypes): void {
        const worldObj = this.worldCnt.addChild(WorldObject.getRandomObj(type));
        if(type == WorldObjectTypes.FLOOR) {

            const lastTilePosX = this.floorTiles.length > 0 ? this.floorTiles[this.floorTiles.length - 1].x : -this.TILE_WIDTH/2;

            worldObj.position.set(lastTilePosX + worldObj.view.width, this.HEIGHT - worldObj.view.height/2);
            this.floorTiles.push(worldObj);
        }
        else if(type == WorldObjectTypes.SKY_OBJECT) {
            worldObj.position.set(this.WIDTH + worldObj.view.width, this.HEIGHT * 0.1);
            worldObj.speed = this.SKY_OBJ_BASE_SPEED * (1 + Math.random());
            this.skyObjects.push(worldObj);
        }
        else if(type == WorldObjectTypes.OBSTACLE) {
            worldObj.position.set(this.WIDTH + worldObj.view.width, this.HEIGHT - worldObj.view.height/2);
            this.obstacles.push(worldObj);
        }
    }

    destroyGarbageObjects(): void {
        let garbageObjects: WorldObject[] = [];
        for(let i = 0; i < this.allObjectsArrays.length; i++) {
            garbageObjects = [...garbageObjects, ...this.allObjectsArrays[i].filter(e => e.isGarbage)];
            this.allObjectsArrays[i] = this.allObjectsArrays[i].filter(e => !e.isGarbage);

        }

        [ this.floorTiles, this.skyObjects, this.obstacles ] = this.allObjectsArrays;

        for(const obj of garbageObjects) {
            obj.parent.removeChild(obj);
            if(obj.type == WorldObjectTypes.FLOOR) {
                this.spawnWorldObject(WorldObjectTypes.FLOOR)
            }
            else {
                this.queueWorldObject(obj.type);
            }
        }
    }

    queueWorldObject(type: WorldObjectTypes): void {
        if(type == WorldObjectTypes.SKY_OBJECT) {
            this.objectsToSpawn.push({
                type: type,
                spawnIn: Math.random() * 3000,
            });
        }
        else if(type == WorldObjectTypes.OBSTACLE) {
            this.objectsToSpawn.push({
                type: type,
                spawnIn: Math.random() * 1000,
            });
        }
    }

    spawnQueuedObjects(delta: number): void {
        for (const obj of this.objectsToSpawn) {
            obj.spawnIn -= delta;
            if(obj.spawnIn <= 0) {
                this.spawnWorldObject(obj.type)
            }
        }

        let arrCleared = !this.objectsToSpawn.length;
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

    moveWorldObjects(delta: number): void {
        for(const arr of this.allObjectsArrays) {
            for(const gameObj of arr) {
                const speed = gameObj.type === WorldObjectTypes.SKY_OBJECT && gameObj['speed'] ? gameObj.speed : this.PLAYER_MOVE_SPEED;
                gameObj.x -= speed * delta;
                if(gameObj.x < -gameObj.view.width/2) {
                    gameObj.isGarbage = true;
                }
            }
        }
    }

    controls(): void {
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
                this.dino.y -= 7;
                if(this.dino.y < this.JUMP_HEIGHT.max) {
                    this.dino.y = this.JUMP_HEIGHT.max;
                    this.isMaxJumpHeightReached = true;
                }
            }
            //jump min
            else if(this.dino.y < this.FLOOR_Y && this.isMinJumpHeightReached) {
                this.dino.y -= 2;
                if(this.dino.y < this.JUMP_HEIGHT.min) {
                    this.dino.y = this.JUMP_HEIGHT.min;
                    this.isMinJumpHeightReached = true;
                }
            }
            //fall
            else if(this.dino.y < this.FLOOR_Y) {
                this.dino.y += 3;
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

    checkCollisions(): void {
        for(const obstacle of this.obstacles) {
            if( Math.abs(this.dino.x - obstacle.x) < (this.dino.currentView.width + obstacle.view.width)*0.4 &&
                Math.abs(this.dino.y - obstacle.y) < (this.dino.currentView.height + obstacle.view.height)*0.4) {
                    this.onGameOver();
            }
        }
    }

    onGameOver(): void {
        this.dino.crash();
        this.isGameOver = true;
        this.emit('game_over');
    }

    tick(delta: number): void {

        if(this.isGameOver) return;

        this.controls();
        this.checkCollisions();

        this.moveWorldObjects(delta);
        this.destroyGarbageObjects();
        this.spawnQueuedObjects(delta);
    }

}
