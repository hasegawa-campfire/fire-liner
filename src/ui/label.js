import { addPos, layoutPos } from '@local_modules/util/index.js'
import { g } from '@/r.js'

/**
 * @typedef LabelStyle
 * @prop {string} strokeColor
 */

const strokeOffsets = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]

export class Label {
  x
  y
  width
  height
  text
  style

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} [text]
   * @param {Partial<import('@local_modules/graphics/text.js').TextStyle & LabelStyle>} [style]
   */
  constructor(x, y, width, height, text, style) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.text = text ?? ''
    this.style = style ?? {}
  }

  update() {
    const align = this.style.align ?? 'left top'
    const style = {
      width: this.width,
      height: this.height,
      align,
      ...this.style,
    }
    const pos = addPos(this, layoutPos(this, 0, align))

    if (style.strokeColor) {
      const color = style.color
      style.color = style.strokeColor

      for (const [ox, oy] of strokeOffsets) {
        g.drawText(this.text, pos.x + ox, pos.y + oy, style)
      }

      style.color = color
    }

    g.drawText(this.text, pos.x, pos.y, style)
  }
}
