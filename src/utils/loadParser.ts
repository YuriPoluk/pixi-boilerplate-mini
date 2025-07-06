import { extensions, ExtensionType, Texture } from 'pixi.js';

const imageDelivery = {
  extension: ExtensionType.LoadParser,
  test: (url: string) => url.startsWith('https://api.dicebear.com/9.x/personas'),
  async load(src: string) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(Texture.from(img));
      img.onerror = reject;
      img.crossOrigin = 'anonymous'
      img.src = src;
    });
  }
};

extensions.add(imageDelivery);
