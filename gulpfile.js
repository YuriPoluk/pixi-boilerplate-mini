const { src, dest, pipe, series, parallel } = require('gulp')
const fs = require('fs')
const path = require('path')
const clean = require('gulp-clean')
const texturePacker = require('gulp-free-tex-packer')
const rename = require('gulp-rename')

function cleanAtlases() {
    return src('public/assets/atlases', { read: false, allowEmpty: true }).pipe(clean())
}

function cleanImages() {
    return src('public/assets/images', { read: false, allowEmpty: true }).pipe(clean())
}

function cleanSpines() {
    return src('public/assets/spines', { read: false, allowEmpty: true }).pipe(clean())
}

function cleanSounds() {
    return src('public/assets/sounds', { read: false, allowEmpty: true }).pipe(clean())
}

function packAtlases() {
    return src('src/assets_raw/atlases/*')
        .pipe(
            texturePacker({
                textureName: 'my-texture',
                width: 2048,
                height: 2048,
                fixedSize: false,
                padding: 2,
                allowRotation: true,
                detectIdentical: true,
                allowTrim: true,
                exporter: 'Pixi',
                removeFileExtension: true,
                prependFolderName: true,
            }),
        )
        .pipe(dest('public/assets/atlases'))
}

function packImages(done) {
    return src(path.join('src/assets_raw/images', '/**/*'))
        .pipe(rename({ dirname: '' }))
        .pipe(dest('public/assets/images'))
}

function packSpines(done) {
    return src(path.join('/src/assets_raw/spines', '/**/*'))
        .pipe(rename({ dirname: '' }))
        .pipe(dest('public/assets/spines'))
}

function packSounds(done) {
    return src(path.join('/src/assets_raw/sounds', '/**/*'))
        .pipe(rename({ dirname: '' }))
        .pipe(dest('public/assets/sounds'))
}

function packFonts(done) {
    return src(path.join('/src/assets_raw/fonts', '/**/*'))
        .pipe(rename({ dirname: '' }))
        .pipe(dest('public/assets/fonts'))
}

function createAssetsList(done) {
    let contents = {}
    fs.readdirSync('./public/assets').forEach(function (dirName) {
        if (dirName.startsWith('.')) {
            return
        }

        if (dirName == 'atlases' || dirName == 'spines') {
            let atlases = ''
            let contentsOfAtlases = fs
                .readdirSync('./public/assets/' + dirName)
                .filter(asset => {
                    let separated = asset.split('.')
                    return separated[separated.length - 1] == 'json'
                })
            contents[dirName] = contentsOfAtlases
        } else {
            contents[dirName] = fs.readdirSync('./public/assets/' + dirName).filter(e => !e.startsWith('.'))
        }
    })
    contents =
        'export const ASSETS_CONFIG: {[index: string]:any} = ' +
        JSON.stringify(contents) +
        ';'

    console.log(contents)
    return fs.writeFile('src/ASSETS_CONFIG.ts', contents, done)
}

exports.default = series(
    parallel(cleanAtlases, cleanImages, cleanSpines, cleanSounds),
    parallel(packAtlases, packImages, packSounds, packSpines, packFonts),
    createAssetsList,
)
