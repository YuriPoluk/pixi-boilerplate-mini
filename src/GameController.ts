import MainGame from './MainGame'
import AssetsPreloader from './libs/AssetsPreloader';
import GameScene from "./GameScene";

export default class GameController {
    private static instance: GameController;
    private preloader: AssetsPreloader;
    app: PIXI.Application;
    size: {w: number, h: number};
    currentWindow!: GameScene;

    constructor(parent: HTMLCanvasElement) {
        console.log('GAME CONTROLLER CONSTRUCTOR')
        this.size = {w: 800, h: 600};

        this.app = new PIXI.Application({
            transparent: false,
            backgroundColor : 0x000000,
            resizeTo: parent,
            view: parent || document.body,
            antialias: true
        });

        this.app.ticker.add(this.tick, this);

        this.preloader = new AssetsPreloader(this.start.bind(this));
        this.preloader.preload();

        //@ts-ignore
        window.GAME = this;
        window.PIXI = PIXI;

        let resizeTimeout: any, self = this;
        window.addEventListener("resize", () => {
            if(resizeTimeout)
                clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(this.onResize.bind(this), 100);
        });
    }

    public static getInstance(): GameController {
        const parent = document.getElementById("scene") as  HTMLCanvasElement;
        if (!GameController.instance) {
            GameController.instance = new GameController(parent);
        }

        return GameController.instance;
    }

    get width() {
        return this.size.w;
    }

    get height() {
        return this.size.h;
    }

    showWindow(w: GameScene): GameScene {
        if (this.currentWindow) this.app.stage.removeChild(this.currentWindow);
        this.app.stage.addChildAt(w, 0);
        this.currentWindow = w;
        w.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
        w.onResize();
        return w;
    }

    onResize(): void {
        if(this.currentWindow) {
            this.currentWindow.position.set(this.app.renderer.width/2, this.app.renderer.height/2);
            if(this.currentWindow.onResize) this.currentWindow.onResize();
        }
    }

    start(): void {
        this.showWindow(new MainGame());
    }

    tick(): void {
        let delta = PIXI.Ticker.shared.elapsedMS;

        // if(window.SpineSprite) SpineSprite.update(delta);
        // if(window.ParticlesSprite) ParticlesSprite.update(delta);

        if(this?.currentWindow?.tick) {
            this.currentWindow.tick(delta);
        }
    }
}
