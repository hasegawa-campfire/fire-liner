import { loadAsset } from '@local_modules/asset/index.js'
import { createImage, nonNull, colorToRgba } from '@local_modules/util/index.js'

export class BmpFont {
  loading
  size = 0
  /** @type {Record<string, Record<string, ImageData>>} */
  #colorCharsCache = {}
  /** @type {CanvasRenderingContext2D | undefined} */
  #ctx

  /**
   * @param {Promise<TexImageSource> | TexImageSource} image
   */
  constructor(image) {
    this.loading = Promise.resolve(image).then((image) => {
      const ctx = document.createElement('canvas').getContext('2d', {
        willReadFrequently: true,
      })

      this.#ctx = nonNull(ctx)
      this.#ctx.canvas.width = image.width
      this.#ctx.canvas.height = image.height
      this.size = image.height / 0x100

      if (image instanceof ImageData) {
        this.#ctx.putImageData(image, 0, 0)
      } else {
        this.#ctx.drawImage(image, 0, 0)
      }
    })
  }

  /**
   * @param {string} color
   * @param {string} char
   */
  getCharImage(color, char) {
    const rgba = colorToRgba(color)

    let chars = this.#colorCharsCache[color]
    if (!chars) {
      chars = this.#colorCharsCache[color] = {}
    }

    let imageData = chars[char]
    if (!imageData) {
      const ctx = nonNull(this.#ctx)
      const fontWidth = ctx.canvas.width / 0x100
      const charWidth = /[\x01-\x7E\uFF65-\uFF9F]/.test(char)
        ? Math.ceil(fontWidth / 2)
        : fontWidth

      const code = char.charCodeAt(0)
      const x = (code & 0xff) * fontWidth
      const y = (code >> 8) * this.size
      chars[char] = imageData = ctx.getImageData(x, y, charWidth, this.size)

      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i + 0] = rgba[0]
        data[i + 1] = rgba[1]
        data[i + 2] = rgba[2]
        data[i + 3] *= rgba[3] / 0x100
      }
    }

    return imageData
  }

  /**
   * @param {string} path
   */
  static load(path) {
    const promise = loadAsset(path).then((buf) => createImage(buf, path))
    return new BmpFont(promise)
  }
}
