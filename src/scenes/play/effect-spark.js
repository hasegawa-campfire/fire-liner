import { Sprite } from '@local_modules/sprite.js'
import { outSine } from '@local_modules/tween.js'
import { toPos } from '@local_modules/util/index.js'
import { g, se, tween } from '@/r.js'

/** @type {Set<EffectSpark>} */
const list = new Set()
const spr = Sprite.load('play/effect-spark.png')
const size = 8

export class EffectSpark {
  type
  x
  y
  angle
  twDist = tween.from(0).to(16, 6, outSine).to(18, 26).start()
  twBlink = tween.from(0).wait(8).to(1).wait(8).loop().start()

  /**
   * @param {number} type
   * @param {Pos} pos
   */
  static add(type, pos) {
    for (let i = 0; i < 360; i += 45) {
      list.add(new EffectSpark(type, pos, i))
    }
  }

  static clear() {
    list.clear()
  }

  static update() {
    for (const fx of list) fx.update()
  }

  /**
   * @param {number} type
   * @param {Pos} pos
   * @param {number} angle
   */
  constructor(type, pos, angle) {
    this.type = type
    this.x = pos.x
    this.y = pos.y
    this.angle = angle
    se.spark.play()
  }

  update() {
    if (this.twDist.next().running) {
      const pos = toPos({ dist: this.twDist.value, angle: this.angle })
      const dx = this.x + pos.x - size / 2
      const dy = this.y + pos.y - size / 2
      const sx = this.twBlink.next().value * size
      const sy = this.type * size
      g.drawImage(spr, dx, dy, size, size, sx, sy, size, size)
    } else {
      list.delete(this)
    }
  }
}
