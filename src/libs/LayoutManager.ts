import CONFIG from '../Config';
import GameController from '../GameController';

export enum Orientation { PORTRAIT, LANDSCAPE}

export class LayoutManager {
    private static instance: LayoutManager;
    static width = 0;
    static height = 0;
    static gameWidth = 0;
    static gameHeight = 0;
    static orientation: Orientation;
    private gameController: GameController;

    constructor(gameController: GameController) {
        this.gameController = gameController;
    }

    fitLayout(): void {
        const w = window.innerWidth;
        const h = window.innerHeight;


        if(LayoutManager.width === w && LayoutManager.height === h) return;

        document.body.style.width = w + "px";
        document.body.style.height = h + "px";

        LayoutManager.width = w;//1920
        LayoutManager.height = h;//1080
        LayoutManager.orientation = w > h ? Orientation.LANDSCAPE : Orientation.PORTRAIT;//Landscape

        if (!CONFIG.portraitEnabled) LayoutManager.orientation = Orientation.LANDSCAPE;
        if (!CONFIG.landscapeEnabled) LayoutManager.orientation = Orientation.PORTRAIT;

        let gw, gh;

        if (LayoutManager.orientation === Orientation.LANDSCAPE) {
            gh = w;
            gw = h;

            // if(gw < this.gameController.size.h) {
            //     gw = this.gameController.size.h;
            //     gh = Math.floor(this.gameController.size.h * (h / w));
            // }
        } else {
            gh = h;
            gw = w;

            // if(gw < this.gameController.size.w) {
            //     gw = this.gameController.size.w;
            //     gh = Math.floor(this.gameController.size.w * (h / w));
            // }
        }

        this.gameController.app.renderer.resize(gw, gh);

        this.gameController.app.view.style.width = w + "px";
        this.gameController.app.view.style.height = h + "px";

        LayoutManager.gameWidth = gw;
        LayoutManager.gameHeight = gh;

        this.gameController.onResize();
    }
}