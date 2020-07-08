import MainGame from './MainGame.js'
import AssetsPreloader from './libs/AssetsPreloader.js';
import LayoutManager from "./libs/LayoutManager";

class GameController {
    constructor() {
        this.container = null;
        this.size = {w: 720, h: 720};
        this.app = null;
        this.currentWindow = null;
    }

    init(container) {

        this.app = new PIXI.Application({
            width: this.size.w,
            height: this.size.h,
            transparent: false,
            backgroundColor : 0x000000,
            resizeTo: window,
            autoDensity: true,
            //resolution: devicePixelRatio@TODO research GameController
            view: container || document.body
        });

        this.app.ticker.add(this.tick, this);

        this.initLayoutManager();

        this.preloader = new AssetsPreloader({});
        this.preloader.preload(this.start.bind(this));
    }

    showWindow(w) {
        if (this.currentWindow) this.app.stage.removeChild(this.currentWindow);
        this.app.stage.addChildAt(w, 0);
        this.currentWindow = w;
        w.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
        w.onResize();
        return w;
    }

    initLayoutManager() {
        this.layoutManager = LayoutManager;
        setTimeout(LayoutManager.fitLayout.bind(LayoutManager), 200);

        let resizeTimeout, self = this;
        window.addEventListener("resize", function() {
            if(resizeTimeout)
                clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(LayoutManager.fitLayout.bind(LayoutManager), 200);
        });
    }

    onResize() {
        if(this.currentWindow) {
            this.currentWindow.position.set(this.app.renderer.width/2, this.app.renderer.height/2);
            if(this.currentWindow.onResize) this.currentWindow.onResize();
        }
    }

    start() {
        this.showWindow(new MainGame(this));
    }

    tick() {
        let delta = PIXI.Ticker.shared.elapsedMS;

        // if(window.SpineSprite) SpineSprite.update(delta);
        // if(window.ParticlesSprite) ParticlesSprite.update(delta);

        if(this.currentWindow && this.currentWindow.tick) {
            this.currentWindow.tick(delta);
        }
    }
}

const gameControllerInstance = new GameController();
// Object.freeze(gameControllerInstance);
export default gameControllerInstance;
