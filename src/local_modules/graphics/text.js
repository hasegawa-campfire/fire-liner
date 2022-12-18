import { BmpFont } from '@local_modules/font/index.js'
import { toAlignPos } from '@local_modules/util/math.js'
import { GraphicsDrawer } from './drawer.js'
import { GraphicsState } from './state.js'

/**
 * @typedef TextStyle
 * @prop {number} width
 * @prop {number} height
 * @prop {number} lines
 * @prop {number} lineSpacing
 * @prop {number} letterSpacing
 * @prop {string} color
 * @prop {Align} align
 */

/**
 * @typedef TextLine
 * @prop {ImageData[]} images
 * @prop {number} width
 * @prop {string} text
 */

/**
 * @typedef TextInfo
 * @prop {TextLine[]} lines
 * @prop {number} width
 * @prop {number} height
 * @prop {TextStyle} style
 * @prop {BmpFont | null} font
 */

/** @type {TextStyle} */
const defaultStyle = {
  width: Infinity,
  height: Infinity,
  lines: Infinity,
  lineSpacing: 2,
  letterSpacing: 0,
  align: 'left top',
  color: '',
}

export class GraphicsText {
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
   * @param {string} text
   * @param {Partial<TextStyle>} [style]
   */
  measure(text, style) {
    const color = this.state.data.color

    /** @type {TextInfo}*/
    const info = {
      lines: [],
      width: 0,
      height: 0,
      font: this.state.data.font,
      style: { ...defaultStyle, color, ...style },
    }

    if (!text || !info.font?.size) {
      return info
    }

    let ws = 0
    let hs = 0
    let index = 0

    while (index < text.length) {
      if (
        info.style.height < info.height + hs + info.font.size ||
        info.style.lines <= info.lines.length
      ) {
        break
      }

      const line = /** @type {TextLine}*/ ({ images: [], width: 0, text: '' })
      info.lines.push(line)
      info.height += hs + info.font.size
      hs = info.style.lineSpacing
      ws = 0

      while (index < text.length) {
        const char = text[index]

        if (char === '\n') {
          index++
          break
        }

        const image = info.font.getCharImage(info.style.color, char)

        if (info.style.width < line.width + ws + image.width) {
          break
        }

        line.images.push(image)
        line.text += char
        line.width += ws + image.width
        info.width = Math.max(info.width, line.width)
        ws = info.style.letterSpacing
        index++
      }
    }

    return info
  }

  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {Partial<TextStyle>} [style]
   */
  draw(text, x, y, style) {
    const info = this.measure(text, style)

    if (!info.font?.size) return

    const ratio = toAlignPos(info.style.align)

    let oy = -info.height * ratio.y

    for (const line of info.lines) {
      let ox = -line.width * ratio.x

      for (const image of line.images) {
        this.drawer.draw(image, x + ox, y + oy)
        ox += image.width + info.style.letterSpacing
      }

      oy += info.font.size + info.style.lineSpacing
    }
  }
}
