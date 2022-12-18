import { loadAsset } from '@local_modules/asset/index.js'
import { createImage, nonNull } from '@local_modules/util/index.js'

/** @type {Record<string, Sprite>} */
const loadCache = {}

export class Sprite {
  loading
  /** @type {TexImageSource | undefined} */
  #image
  /** @type {CanvasRenderingContext2D | undefined} */
  #ctx
  #meta

  /**
   * @param {Promise<TexImageSource> | TexImageSource} image
   * @param {Size} [meta]
   */
  constructor(image, meta) {
    this.#meta = meta
    this.loading = Promise.resolve(image).then((image) => {
      this.#image = image
    })
  }

  get width() {
    return this.#image?.width ?? this.#meta?.width ?? 0
  }

  get height() {
    return this.#image?.height ?? this.#meta?.height ?? 0
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  slice(x, y, width, height) {
    const promise = this.loading.then(() => {
      if (!this.#ctx) {
        const image = nonNull(this.#image)
        this.#image = document.createElement('canvas')
        this.#ctx = nonNull(
          this.#image.getContext('2d', { willReadFrequently: true })
        )
        this.#image.width = image.width
        this.#image.height = image.height

        if (image instanceof ImageData) {
          this.#ctx.putImageData(image, 0, 0)
        } else {
          this.#ctx.drawImage(image, 0, 0)
        }
      }

      return this.#ctx.getImageData(x, y, width, height)
    })

    return new Sprite(promise, { width, height })
  }

  getDrawee() {
    return this.#image
  }

  /**
   * @param {string} path
   * @param {object} [meta]
   * @param {number} meta.width
   * @param {number} meta.height
   */
  static load(path, meta) {
    let sprite = loadCache[path]

    if (!sprite) {
      const promise = loadAsset(path).then((buf) => createImage(buf, path))
      sprite = loadCache[path] = new Sprite(promise, meta)
    }

    return sprite
  }
}
