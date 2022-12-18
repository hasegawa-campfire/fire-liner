import { nonNull } from '@local_modules/util/index.js'
import { GraphicsDrawer } from './drawer.js'
import { GraphicsState } from './state.js'

/** @type {{ [key: string]: ImageData }} */
const cacheDots = {}
const dotCanvas = document.createElement('canvas')
dotCanvas.width = 3
dotCanvas.height = 3
const dotCtx = nonNull(dotCanvas.getContext('2d', { willReadFrequently: true }))

/**
 * @param {string} color
 */
export function getDotImage(color) {
  const key = color

  let imageData = cacheDots[key]
  if (!imageData) {
    dotCtx.fillStyle = color
    dotCtx.clearRect(0, 0, 3, 3)
    dotCtx.fillRect(0, 0, 3, 3)
    imageData = cacheDots[key] = dotCtx.getImageData(0, 0, 3, 3)
  }

  return imageData
}

export class GraphicsShape {
  state
  drawer

  /**
   * @param {GraphicsState} state
   * @param {GraphicsDrawer} drawer
   */
  constructor(state, drawer) {
    this.state = state
    this.drawer = drawer
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} [color]
   */
  drawRect(x, y, width, height, color) {
    const image = getDotImage(color ?? this.state.data.color)
    this.drawer.draw(image, x, y, width, height, 1, 1, 1, 1)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {string} [color]
   * @param {number} strokeWidth
   */
  drawCirle(x, y, radius, color, strokeWidth = 1) {
    let ox = radius
    let oy = 0
    let err = 1 - radius
    const w = strokeWidth
    x -= (strokeWidth - 1) / 2
    y -= (strokeWidth - 1) / 2

    while (oy <= ox) {
      this.drawRect(x + ox, y + oy, w, w, color)
      this.drawRect(x + oy, y + ox, w, w, color)
      this.drawRect(x - ox, y + oy, w, w, color)
      this.drawRect(x - oy, y + ox, w, w, color)
      this.drawRect(x - ox, y - oy, w, w, color)
      this.drawRect(x - oy, y - ox, w, w, color)
      this.drawRect(x + ox, y - oy, w, w, color)
      this.drawRect(x + oy, y - ox, w, w, color)
      err += err < 0 ? 2 * ++oy + 1 : 2 * (++oy - --ox + 1)
    }
  }
}
