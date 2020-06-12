class Sprite extends PIXI.Sprite {
    constructor(tex) {
        var tmp = tex;
        if(tex && typeof tex == "string") {
            if(PIXI.Loader.shared.resources[tex]) {
                tex = PIXI.Loader.shared.resources[tex].texture;
            }
            else {
                try {
                    tex = PIXI.Texture.fromFrame(tex)
                }
                catch(err) {
                    tex = undefined
                }
            }
        }
        super(tex);
        this.anchor.set(0.5);
    }
}

export default Sprite;