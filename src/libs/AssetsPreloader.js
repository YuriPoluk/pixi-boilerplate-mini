import ASSETS from '../ASSETS.js'

export default class AssetsPreloader {
    constructor() {
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
            ASSETS[assetType].forEach(function(asset) {
                let url = self.cdnPath(assetType + '/' + asset);
                let name = asset.split(".")[0];
                let options = (asset.split(".")[1] == "png") ? loaderOptions : {};
                PIXI.Loader.shared.add(name, url, options);
            });
        }

        PIXI.Loader.shared.load(function(loader, resources) {
            self.finish();
        });
    }

    finish() {
        console.log('ASSETS PRELOADING FINISHED');
        if(this.endCallback) this.endCallback();
    };
}

