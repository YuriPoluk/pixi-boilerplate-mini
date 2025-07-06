import { ASSETS_CONFIG } from '../ASSETS_CONFIG'
import FontFaceObserver from 'fontfaceobserver'
import * as PIXI from 'pixi.js'

export default class AssetsPreloader {
    fontsLoaded: boolean
    preloaderFinished: boolean
    endCallback: () => void

    constructor(endCallback: () => void) {
        this.fontsLoaded = false
        this.preloaderFinished = false
        this.endCallback = endCallback
    }

    cdnPath(filename: string): string {
        return './assets/' + filename
    }

    async preload() {
        const promises: Promise<any>[] = []

        for (const assetType in ASSETS_CONFIG) {
            if (assetType == 'fonts') continue
            ASSETS_CONFIG[assetType].forEach((asset: string) => {
                const url = this.cdnPath(assetType + '/' + asset)  
                promises.push(PIXI.Assets.load(url))
            })
        }

        this.loadFonts()

        await Promise.all(promises)

        this.preloaderFinished = true
        this.finish()
    }

    loadFonts(): void {
        console.log('LOAD FONTS')
        const observer: Array<Promise<void>> = []
        const styles = document?.styleSheets[0] as CSSStyleSheet
        ASSETS_CONFIG.fonts?.forEach((font: string) => {
            const name = font.split('.')[0]
            const url = import.meta.env.MODE == 'production' ? './fonts/' + font : this.cdnPath('./fonts/' + font)
            console.log(url)         
            styles.insertRule(
                `@font-face {font-family: "${name}"; src: url("${url}");}`,
            )
            observer.push(new FontFaceObserver(name).load())
        })

        Promise.all(observer).then(
            () => {
                this.fontsLoaded = true
                this.finish()
            },
            err => {
                console.error('Failed to load fonts!', err)
            },
        )
    }

    finish(): void {
        if (!this.fontsLoaded) return
        if (!this.preloaderFinished) return

        console.log('ASSETS PRELOADING FINISHED')
        if (this.endCallback) this.endCallback()
    }
}
