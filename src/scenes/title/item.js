import { Sprite } from '@local_modules/sprite.js'
import { inSine, outSine, Tween } from '@local_modules/tween.js'
import { g, screen } from '@/r.js'

const spr = Sprite.load('title/item.png')
const size = 10

export class Item {
  type = (Math.random() * 3) | 0
  x
  y
  dir
  twX
  twY
  twWink = Tween.from(0).wait(28).to(size).wait(8).to(0).wait(28)
  twWait = Tween.from(0).wait(64)

  /**
   * @param {Pos} pos
   */
  constructor(pos) {
    this.x = pos.x
    this.y = pos.y

    this.dir = pos.x <= 0 ? 1 : -1

    this.twX = Tween.from(0)
      .to(size * this.dir, 16)
      .start()
    this.twY = Tween.from(0).to(-2, 8, outSine).to(0, 8, inSine).start()
  }

  update() {
    this.twX.next()
    this.twY.next()
    this.twWink.next()
    this.twWait.next()

    if (this.twX.onDone) {
      this.x += this.twX.value
      this.twX.reset()

      if (this.dir < 0 && this.x < -size) {
        this.x = screen.width
        this.type = (Math.random() * 3) | 0
      }

      if (0 < this.dir && screen.width < this.x) {
        this.x = -size
        this.type = (Math.random() * 3) | 0
      }
    }

    if (!this.twX.running && !this.twWink.running && !this.twWait.running) {
      if (Math.random() < 0.9) {
        this.twX.start()
        this.twY.start()
      } else if (Math.random() < 0.67) {
        this.twWink.start()
      } else {
        this.twWait.start()
      }
    }

    g.drawImage(
      spr,
      this.x + this.twX.value,
      this.y + this.twY.value,
      size,
      size,
      this.twWink.value,
      this.type * size,
      size,
      size
    )
  }
}
