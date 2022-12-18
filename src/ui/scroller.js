import { Sprite } from '@local_modules/sprite.js'
import { inRect, layoutPos } from '@local_modules/util/index.js'
import { Tween } from '@local_modules/tween.js'
import { g, pointer } from '@/r.js'

const sprUp = Sprite.load('icon/up.png')
const sprDown = Sprite.load('icon/down.png')

export class Scroller {
  width
  height
  contentHeight
  startPointerY = 0
  startScrollY = 0
  scrollY = 0
  twArrow = Tween.from(0).wait(30).to(1).wait(30).loop().start()

  /**
   * @param {Size} size
   * @param {number} [contentHeight]
   */
  constructor(size, contentHeight) {
    this.width = size.width
    this.height = size.height
    this.contentHeight = contentHeight ?? 0
  }

  get maxScrollY() {
    return Math.max(this.contentHeight - this.height, 0)
  }

  /**
   * @param {Function} [updateContent]
   */
  update(updateContent) {
    const ptr = g.invertTransformPos(pointer)

    if (pointer.isDownChange && inRect(this, ptr)) {
      this.startPointerY = pointer.y
      this.startScrollY = this.scrollY
    }

    if (pointer.isDown && !Number.isNaN(this.startScrollY)) {
      this.scrollY = this.startScrollY - (pointer.y - this.startPointerY)
    } else {
      this.startScrollY = NaN
    }

    this.scrollY += pointer.wheel
    this.scrollY = Math.min(Math.max(this.scrollY, 0), this.maxScrollY)

    g.save()
    g.translate(0, -this.scrollY)

    updateContent?.()

    g.restore()

    const oy = this.twArrow.next().value

    if (this.scrollY > 0) {
      const pos = layoutPos(this, sprUp, 'top')
      g.drawImage(sprUp, pos.x, pos.y + oy)
    }

    if (this.scrollY < this.maxScrollY) {
      const pos = layoutPos(this, sprDown, 'bottom')
      g.drawImage(sprDown, pos.x, pos.y - oy)
    }
  }
}
