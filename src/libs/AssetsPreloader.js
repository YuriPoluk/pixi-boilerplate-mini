import ASSETS from '../ASSETS_CONFIG.js'
import EXTERNAL_ASSETS from '../EXTERNAL_ASSETS_CONFIG.js'
import FontFaceObserver from 'fontfaceobserver'

export default class AssetsPreloader {
    constructor() {
        this.fontsLoaded = false;
        this.endCallback = null;
    }

    cdnPath(filename) {
        return ("./assets/" + filename);
    };

    preload(callback) {
        this.endCallback = callback;

        const loaderOptions = {
            loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE,
            xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.BLOB
        };

        let self = this;
        for(const assetType in ASSETS) {
            if(assetType == 'fonts')
                continue;
            ASSETS[assetType].forEach(function(asset) {
                let url = self.cdnPath(assetType + '/' + asset);
                let name = asset.split(".")[0];
                let options = assetType == 'images' ? loaderOptions : {};
                PIXI.Loader.shared.add(name, url, options);
            });
        }

        for(const assetType in EXTERNAL_ASSETS) {
            if(assetType == 'fonts')
                continue;
            EXTERNAL_ASSETS[assetType].forEach(function(asset) {
                let url = asset.url;
                let name = asset.name;
                let options = (asset.name.split(".")[1] == "png") ? loaderOptions : {};
                PIXI.Loader.shared.add(name, url, loaderOptions);
            });
        }

        this.loadFonts();

        PIXI.Loader.shared.load(function(loader, resources) {
            self.finish();
        });
    }

    loadFonts() {
        const observer = [];
        const styles = document?.styleSheets[0];
        ASSETS.fonts?.forEach(font => {
            let name = font.split(".")[0];
            let url = "../assets/fonts/" + font;
            styles.insertRule(`@font-face {font-family: "${name}"; src: url("${url}");}`);
            console.log(`@font-face {font-family: "${name}"; src: url("${url}");}`);
            observer.push(new FontFaceObserver('Pangolin').load());
        });

        Promise.all(observer)
            .then(
                () => {
                    this.fontsLoaded = true;
                    this.finish();
                },
                err => {
                    console.error('Failed to load fonts!', err);
                });
    }

    finish() {
        if(!this.fontsLoaded) return;

        console.log('ASSETS PRELOADING FINISHED');
        console.log(PIXI.Loader.shared.resources)
        if(this.endCallback) this.endCallback();
    };
}

