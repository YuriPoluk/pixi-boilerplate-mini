import { ASSETS_CONFIG } from '../ASSETS_CONFIG'
import FontFaceObserver from 'fontfaceobserver'
import * as PIXI from 'pixi.js';

export default class AssetsPreloader {
    fontsLoaded: boolean;
    preloaderFinished: boolean;
    endCallback: () => void;

    constructor(endCallback: () => void) {
        this.fontsLoaded = false;
        this.preloaderFinished = false;
        this.endCallback = endCallback;
    }

    cdnPath(filename: string) {
        return ("./assets/" + filename);
    };

    preload() {

        const loaderOptions = {
            loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE,
            xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.BLOB
        };

        let self = this;
        for(const assetType in ASSETS_CONFIG) {
            if(assetType == 'fonts')
                continue;
            ASSETS_CONFIG[assetType].forEach(function(asset: string) {
                let url = self.cdnPath(assetType + '/' + asset);
                let name = asset.split(".")[0];
                let options = assetType == 'images' ? loaderOptions : {};
                PIXI.Loader.shared.add(name, url, options);
            });
        }

        this.loadFonts();

        PIXI.Loader.shared.load(function(loader, resources) {
            self.preloaderFinished = true;
            self.finish();
        });
    }

    loadFonts() {
        const observer: Array<Promise<void>> = [];
        const styles = document?.styleSheets[0] as CSSStyleSheet;
        ASSETS_CONFIG.fonts?.forEach(font => {
            let name = font.split(".")[0];
            let url = "../assets/fonts/" + font;
            styles.insertRule(`@font-face {font-family: "${name}"; src: url("${url}");}`);
            console.log(`@font-face {font-family: "${name}"; src: url("${url}");}`);
            observer.push(new FontFaceObserver('Pangolin').load());
        });

        //@ts-ignore
        Promise.all(observer)
            .then(
                () => {
                    this.fontsLoaded = true;
                    this.finish();
                },
                //@ts-ignore
                err => {
                    console.error('Failed to load fonts!', err);
                });
    }

    finish() {
        if(!this.fontsLoaded) return;
        if(!this.preloaderFinished) return;

        console.log('ASSETS_CONFIG PRELOADING FINISHED');
        if(this.endCallback) this.endCallback();
    };
}

