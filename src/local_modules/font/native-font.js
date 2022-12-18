import { loadAsset } from '@local_modules/asset/index.js'
import { nonNull } from '@local_modules/util/index.js'

const canvas = document.createElement('canvas')
const ctx = nonNull(canvas.getContext('2d'))

export class NativeFont {
  loading
  style = ''
  size = 0
  /** @type {{ [key: string]: { [char: string]: ImageData }}} */
  #cacheChars = {}
  #sharp

  /**
   * @param {Promise<string> | string} style
   * @param {object} [option]
   * @param {number} [option.size]
   * @param {number[]} [option.sharp]
   */
  constructor(style, option) {
    this.loading = Promise.resolve(style).then((style) => {
      this.style = style
      this.size = option?.size ?? +style.replace(/.*?(\d+).*/, '$1')
    })
    this.#sharp = option?.sharp
  }

  /**
   * @param {string} path
   * @param {object} [option]
   * @param {number} [option.size]
   * @param {number[]} [option.sharp]
   */
  static load(path, option) {
    const promise = loadAsset(path).then(async (buf) => {
      const family = path.replace(/.*\/|\.[^.]*$/g, '')
      const font = new FontFace(family, buf)

      await font.load()
      // @ts-ignore
      document.fonts.add(font)
      const size = option?.size ?? +family.replace(/.*?(\d+).*/, '$1')

      return `${size}px ${family}`
    })

    return new NativeFont(promise, option)
  }

  /**
   * @param {string} color
   * @param {string} char
   */
  getCharImage(color, char) {
    let chars = this.#cacheChars[color]
    if (!chars) {
      chars = this.#cacheChars[color] = {}
    }

    let imageData = chars[char]
    if (!imageData) {
      ctx.font = this.style
      // charCtx.textBaseline = 'top'

      const met = ctx.measureText(char)
      const w = (canvas.width = met.width + 0)
      const h = (canvas.height =
        met.fontBoundingBoxAscent + met.fontBoundingBoxDescent)

      ctx.font = this.style
      // charCtx.textBaseline = 'top'
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      ctx.fillText(char, 0, met.fontBoundingBoxAscent)

      imageData = chars[char] = ctx.getImageData(0, 0, w, h)

      if (this.#sharp) {
        const data = imageData.data
        const [lv1, lv2] = this.#sharp

        for (let i = 3; i < data.length; i += 4) {
          const threshold = data[i - w * 4] ? lv2 : lv1
          data[i] = data[i] < threshold ? 0 : 0xff
        }
      }
    }

    return imageData
  }
}
