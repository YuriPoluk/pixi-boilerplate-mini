import Sprite from './libs/Sprite.js'


export default class Dino extends Sprite {
    constructor() {
        super();
        this.state =
        this.viewCrashed = this.addChild(new Sprite('dino_5'));
        this.viewJump = this.addChild(new Sprite('dino_1'));
        let frames = ['dino_2', 'dino_3', 'dino_4']
        this.viewRun = this.addChild(PIXI.AnimatedSprite.fromFrames(frames));
        this.viewRun.onLoop = () => {
            if (Math.random() < 0.1)
                this.viewRun.gotoAndPlay(0);
            else
                this.viewRun.gotoAndPlay(1);
        }

        frames = ['dino_crouched_1', 'dino_crouched_2'];
        this.viewCrouched = this.addChild(PIXI.AnimatedSprite.fromFrames(frames));

        this.viewRun.anchor.set(0.5, 1);
        this.viewCrouched.anchor.set(0.5, 1);
        this.viewCrashed.anchor.set(0.5, 1);
        this.viewJump.anchor.set(0.5, 1);

        this.viewRun.animationSpeed = this.viewCrouched.animationSpeed = 0.25;

        this.run();
    }

    run() {
        this.resetViews();
        this.currentView = this.viewRun;
        this.viewRun.visible = true;
        this.viewRun.play();
        this.state = Dino.STATES.RUN;
    }

    crouch() {
        this.resetViews();
        this.currentView = this.viewCrouched;
        this.viewCrouched.visible = true;
        this.viewCrouched.play();
        this.state = Dino.STATES.CROUCH;
    }

    jump() {
        this.resetViews();
        this.currentView = this.viewJump;
        this.viewJump.visible = true;
        this.state = Dino.STATES.JUMP;
    }

    crash() {
        this.resetViews();
        this.currentView = this.viewCrashed;
        this.viewCrashed.visible = true;
        this.state = Dino.STATES.CRASH;
    }

    resetViews() {
        for (const child of this.children) {
            child.visible = false;
            if(child.stop)
                child.stop();
        }
    }
}

Dino.STATES = {
    RUN: 0,
    JUMP: 1,
    CROUCH: 2,
    CRASH: 3
}