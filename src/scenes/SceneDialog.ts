import Sprite from '../utils/Sprite'
import { Orientation } from '../utils/LayoutManager'
import GameScene from '../GameScene'
import GameController from '../GameController'
import { Assets, HTMLText, NineSlicePlane, Point, Texture } from 'pixi.js'
import gsap from 'gsap'

//api return types 

type Position = 'left' | 'right'
type AvatarData = {
    name: string
    url: string
    position: Position
}
type DialogueData = {
    name: string
    text: string
}
type EmojiData = {
    name: string
    url: string
}
type ApiData = {
    dialogue: DialogueData[]
    emojies: EmojiData[]
    avatars: AvatarData[]
}

const emojiList = ['sad', 'intrigued', 'satisfied', 'neutral', 'laughing']

export default class SceneDialog extends GameScene {
    background: Sprite
    dialogueData!: DialogueData[]
    currentAvatar?: { position: Position, sprite: Sprite }
    previousAvatar?: Sprite
    dialog: NineSlicePlane
    textElement: HTMLDivElement

    constructor(gameController: GameController) {
        super(gameController)

        this.background = this.addChild(new Sprite('./assets/images/cc_background.jpg'))
        this.dialog = this.addChild(new NineSlicePlane(Texture.from('dialog'), 20, 20, 20, 20))
        this.textElement = document.createElement('div')
        this.textElement.classList.add('text-element')
        document.getElementById('game-container')!.appendChild(this.textElement)
        this.addDialogueLine = this.addDialogueLine.bind(this)
    }

    onShow() {
        this.textElement.style.visibility = 'visible'
        if (this.currentDialogueTween) {
            this.currentDialogueTween.play()
        } else {
            this.addDialogueLine()
        }
    }

    onHide() {
        this.textElement.style.visibility = 'hidden'
        this.currentDialogueTween?.pause()
    }

    async init() {
        const url = "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords";

        try {
            const response = await fetch(url);
            if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
            }

            //in prod api result could have some schema validation but I omit that here.
            //The APIresponse contained invalid dialog line (Neighbour avatar doesn't exist) and invalid emoji ( {win} ).
            //I remove the line but leave invalid emoji as is
            const json = await response.json() as unknown as ApiData
            this.dialogueData = this.sanitize(json.dialogue)

            return Promise.all([
                this.preloadEmojis(json.emojies, json.avatars),
                this.createAvatars(json.avatars),
            ])
        } catch (error) {
            console.error(error);
        }
    }

    sanitize(data: DialogueData[]) {
        return data.filter(d => d.name != 'Neighbour')
    }

    replaceTextWithImage(text: string) {
        emojiList.forEach((emojiName) => {
            const emojiData = this.emojies.find(emj => emj.name == emojiName)
            text = text.replace(`{${emojiName}}`, `<img src="${emojiData?.url}" style="width: 50px; height: 50px" crossorigin="anonymous">`)
        })

        return text
    }

    private currentDialogueData?: DialogueData
    private dialogLineIndex = 0
    private currentDialogueTween?: gsap.core.Timeline

    addDialogueLine() {
        if (this.dialogLineIndex == this.dialogueData.length - 1) 
            return

        const dialogueData = this.dialogueData[this.dialogLineIndex]
        this.dialogLineIndex++
        this.currentDialogueData = dialogueData

        const avatar = this.avatars[dialogueData.name]
        const previousAvatar = this.currentAvatar || avatar
        this.currentAvatar = avatar

        const xEndPrevious = this.avatarPositions.x[previousAvatar?.position].start

        const xEndCurrent = this.avatarPositions.x[this.currentAvatar?.position].end
        const xStartCurrent = this.avatarPositions.x[this.currentAvatar.position].start 
        this.currentAvatar.sprite.position.set(xStartCurrent, this.avatarPositions.y)

        this.currentDialogueTween = gsap.timeline()
            .to(previousAvatar.sprite.position, {
                x: xEndPrevious,
                duration: 1
            }, 0)
            .to(previousAvatar.sprite, {
                alpha: 0,
                duration: 1
            }, 0)
            .to(this.textElement, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    this.textElement.innerHTML = this.replaceTextWithImage(dialogueData.text)
                }
            }, 0)
            .to(this.currentAvatar.sprite.position, {
                x: xEndCurrent,
                duration: 1
            }, 1)
            .to(this.currentAvatar.sprite, {
                alpha: 1,
                duration: 1
            }, 1)
            .to(this.textElement, {
                opacity: 1,
                duration: 0.5,
                onComplete: () => { setTimeout(this.addDialogueLine, 3000) }
            }, 1)
    }

    private avatars: {[key: string]: { position: Position, sprite: Sprite }} = {}

    async createAvatars(avatarData: AvatarData[]) {
        const promises = avatarData.map(async data => {

            const texture = await Assets.load(data.url);
            const sprite = new Sprite(texture);
            sprite.alpha = 0
            const name = data.name
            this.avatars[name] = {
                sprite: this.addChild(sprite),
                position: data.position
            }
        })
        const promiseResult = await Promise.all(promises)
        this.resize()
        return promiseResult
    }

    private emojies: EmojiData[] = []

    async preloadEmojis(emojiData: EmojiData[], avatarsData: AvatarData[]) {
        this.emojies = emojiData

        return new Promise<void>((resolve, reject) => {
            const urls = emojiData.map(d => d.url).concat(avatarsData.map(a => a.url))
            let imagesLoaded = 0
            const imagesToLoad = urls.length
            let images = []

            urls.forEach(url => {
                var img = new Image();
                images.push(img)
                img.onload = function() {
                    imagesLoaded++
                    if (imagesLoaded == imagesToLoad) {
                        images = []
                        resolve()
                    }
                }
                img.src = url;
            })
        });
    }

    private avatarPositions = {
        y: 0,
        x: {
            left: {
                start: 0,
                end: 0
            },
            right: {
                start: 0,
                end: 0
            }
        }
    }

    resize(): void {
        const lm = this.gameController.layoutManager
        const { width, height, orientation } = lm
        
        const avatarNames = Object.keys(this.avatars)

        if (orientation == Orientation.LANDSCAPE) {
            this.background.height = height
            this.background.scale.x = this.background.scale.y
            this.dialog.width = width * 0.98
            this.dialog.scale.y = this.dialog.scale.x
            this.dialog.position.set(0 - this.dialog.width/2, height/2 - this.dialog.height * 0.15 - this.dialog.height/2)

            for (const avatarName in this.avatars) {
                const avatar = this.avatars[avatarName].sprite
                avatar.height = 0.4 * height
                avatar.scale.x = avatar.scale.y
            }

            if (avatarNames.length) {
                this.avatarPositions.x.left.start = -width/2 - this.avatars[avatarNames[0]].sprite.width * 0.5
                this.avatarPositions.x.left.end = - width/2 + this.avatars[avatarNames[0]].sprite.width * 0.45
                this.avatarPositions.x.right.start = width/2 + this.avatars[avatarNames[0]].sprite.width * 0.5
                this.avatarPositions.x.right.end = width/2 - this.avatars[avatarNames[0]].sprite.width * 0.45
                this.avatarPositions.y = this.dialog.position.y - this.avatars[avatarNames[0]].sprite.height * 0.4
            }
            
        } else {
            //this asset looks awful in portrait but better than nothing
            this.background.height = height
            this.background.scale.x = this.background.scale.y

            this.dialog.width = width * 0.98
            this.dialog.scale.y = this.dialog.scale.x
            this.dialog.position.set(0 - this.dialog.width/2, height/2 - this.dialog.height*0.4)

            for (const avatarName in this.avatars) {
                const avatar = this.avatars[avatarName].sprite
                avatar.width = 0.4 * width
                avatar.scale.y = avatar.scale.x
            }

            if (avatarNames.length) {
                this.avatarPositions.x.left.start = -width/2 - this.avatars[avatarNames[0]].sprite.width * 0.5
                this.avatarPositions.x.left.end = - width/2 + this.avatars[avatarNames[0]].sprite.width * 0.4
                this.avatarPositions.x.right.start = width/2 + this.avatars[avatarNames[0]].sprite.width * 0.5
                this.avatarPositions.x.right.end = width/2 - this.avatars[avatarNames[0]].sprite.width * 0.4
                this.avatarPositions.y = this.dialog.position.y - this.avatars[avatarNames[0]].sprite.height * 0.4
            }
        }

        if (this.currentDialogueData) {
            this.currentDialogueTween?.progress(1)
            const posLoc = this.currentAvatar!.position
            this.currentAvatar!.sprite.position.set(this.avatarPositions.x[posLoc].end, this.avatarPositions.y)
        }
    }
}
