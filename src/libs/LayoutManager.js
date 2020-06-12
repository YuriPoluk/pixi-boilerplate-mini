import CONFIG from '../Config.js';
import GameController from '../GameController.js';

class LayoutManager {
    static LANDSCAPE = 1;
    static PORTRAIT = 2;

    constructor() {
        this.width = 0;
        this.height = 0;
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.orientation = "";
        console.log('this', this)
    }

    fitLayout() {
        let w = window.innerWidth;
        let h = window.innerHeight;

        if(this.width === w && this.height === h) return;

        document.body.style.width = w + "px";
        document.body.style.height = h + "px";

        this.width = w;
        this.height = h;
        this.orientation = w > h ? LayoutManager.LANDSCAPE : LayoutManager.PORTRAIT;

        if (!CONFIG.portraitEnabled) this.orientation = LayoutManager.LANDSCAPE;
        if (!CONFIG.landscapeEnabled) this.orientation = LayoutManager.PORTRAIT;

        let gw, gh;

        if (this.orientation === LayoutManager.LANDSCAPE) {
            gh = GameController.size.w;
            gw = Math.floor(gh * (w / h));

            if(gw < GameController.size.h) {
                gw = GameController.size.h;
                gh = Math.floor(GameController.size.h * (h / w));
            }
        } else {
            gh = GameController.size.h;
            gw = Math.floor(gh * (w / h));

            if(gw < GameController.size.w) {
                gw = GameController.size.w;
                gh = Math.floor(GameController.size.w * (h / w));
            }
        }

        GameController.app.renderer.resize(gw, gh);

        GameController.app.view.style.width = w + "px";
        GameController.app.view.style.height = h + "px";

        this.gameWidth = gw;
        this.gameHeight = gh;

        GameController.onResize();
    }
}

const layoutManagerInstance = new LayoutManager();
export default layoutManagerInstance;