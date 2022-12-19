import { Sprite } from '@local_modules/sprite.js'
import { inRect, layoutPos } from '@local_modules/util/index.js'
import { Tween, steps } from '@local_modules/tween.js'
import { color, g, pointer, se } from '@/r.js'
import { logEvent } from '@/data/server.js'

const spr = Sprite.load('button.png')
const sprLock = Sprite.load('icon/lock.png')
const sprNew = Sprite.load('icon/new.png')

const shakeOffsets = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
]

export class Button {
  x
  y
  width
  height
  caption
  type
  lock = false
  disabled = false
  linkUrl = ''
  content = { width: 0, height: 0 }
  down = false
  isClick = false
  twShake = Tween.from(0).to(3, 12, steps(4))
  lockText = ''
  new = false
  twNew = Tween.from(0).wait(30).to(1).wait(30).loop().start()

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {Sprite | string} [caption]
   */
  constructor(x, y, width, height, caption, type = 0) {
    this.x = x
    this.y = y
    this.width = Math.max(width, 8)
    this.height = Math.max(height, 8)
    this.caption = caption
    this.type = type
    this.resize()
  }

  resize() {
    this.content.width = this.width - 8
    this.content.height = this.height - 8
  }

  /**
   * @param {Function} [updateContent]
   */
  update(updateContent) {
    this.twShake.next()

    const matrix = g.matrix.invert()
    const ptr = matrix.transformPos(pointer)
    const hover = inRect(this, ptr)
    const upChange = hover && pointer.isUpChange
    const downChange = hover && pointer.isDownChange

    if (this.disabled) {
      this.isClick = false
      this.down = false
    } else if (!this.lock) {
      this.isClick = this.down && upChange
      this.down = pointer.isDown && (this.down || downChange)
      downChange && se.buttonDown.play()
      upChange && se.buttonUp.play()
    } else if (!this.twShake.running && downChange) {
      this.twShake.start()
      se.lock.play()
    }

    if (!this.disabled && !this.lock && this.linkUrl) {
      pointer.onClick((pos) => {
        const ptr = matrix.transformPos(pos)
        if (inRect(this, ptr)) {
          window.open(this.linkUrl)
          logEvent('button_link_open', { url: this.linkUrl })
        }
      })
    }

    const offset = this.twShake.running
      ? shakeOffsets[this.twShake.value]
      : this.down || this.disabled
      ? [0, 1]
      : [0, 0]

    const sx = this.disabled ? 24 : this.down ? 12 : 0
    const sy = this.type * 12
    const rLeft = this.x + (this.twShake.running ? offset[0] : 0)
    const rTop = this.y + (this.twShake.running ? offset[1] : 0)
    const cWidth = this.width - 8
    const cHeight = this.height - 8
    const cLeft = rLeft + 4
    const cRight = cLeft + cWidth
    const cTop = rTop + 4
    const cBottom = cTop + cHeight

    g.drawImage(spr, rLeft, rTop, 4, 4, sx, sy, 4, 4)
    g.drawImage(spr, cRight, rTop, 4, 4, sx + 8, sy, 4, 4)
    g.drawImage(spr, cRight, cBottom, 4, 4, sx + 8, sy + 8, 4, 4)
    g.drawImage(spr, rLeft, cBottom, 4, 4, sx, sy + 8, 4, 4)

    g.drawImage(spr, cLeft, rTop, cWidth, 4, sx + 4, sy, 4, 4)
    g.drawImage(spr, cRight, cTop, 4, cHeight, sx + 8, sy + 4, 4, 4)
    g.drawImage(spr, cLeft, cBottom, cWidth, 4, sx + 4, sy + 8, 4, 4)
    g.drawImage(spr, rLeft, cTop, 4, cHeight, sx, sy + 4, 4, 4)

    g.drawImage(spr, cLeft, cTop, cWidth, cHeight, sx + 4, sy + 4, 4, 4)

    g.save()

    const pos = layoutPos(this.content, 0)

    pos.x += this.x + 4 + offset[0]
    pos.y += this.y + 4 + offset[1]

    if (this.type === 2) pos.y--

    g.translatePos(pos)

    if (this.lock) {
      if (this.lockText) {
        const iconHeight = sprLock.height + 2
        const textSize = {
          width: this.content.width,
          height: this.content.height - iconHeight,
        }
        const info = g.measureText(this.lockText, textSize)
        const pos = layoutPos(0, {
          width: sprLock.width,
          height: iconHeight + info.height,
        })
        g.drawImage(sprLock, pos.x, pos.y)
        g.drawText(this.lockText, 0, pos.y + iconHeight, {
          ...textSize,
          align: 'top',
          color: color.light,
        })
      } else {
        const pos = layoutPos(0, sprLock)
        g.drawImage(sprLock, pos.x, pos.y - 1)
      }
    } else if (updateContent) {
      updateContent()
    } else if (typeof this.caption === 'string') {
      g.drawText(this.caption, 0, 0, {
        align: 'center',
        width: this.content.width,
        height: this.content.height,
        color: color.black,
      })
    } else if (this.caption) {
      const pos = layoutPos(0, this.caption)
      g.drawImage(this.caption, pos.x, pos.y)
    }

    g.restore()

    if (!this.lock && this.new) {
      g.drawImage(sprNew, this.x - 1, this.y + this.twNew.next().value)
    }
  }
}
