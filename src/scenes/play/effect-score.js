import { Label } from '@/ui/label.js'
import { color, tween } from '@/r.js'

/** @type {Set<EffectScore>} */
const list = new Set()

export class EffectScore {
  x
  y
  label
  twInit
  twSlide = tween.from(0).to(2, 8).wait(70).start()

  /**
   * @param {number} score
   * @param {Pos} pos
   * @param {number} initWait
   * @param {number} type
   */
  static add(type, pos, score, initWait) {
    list.add(new EffectScore(type, pos, score, initWait))
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
   * @param {number} score
   * @param {number} initWait
   */
  constructor(type, pos, score, initWait) {
    this.x = pos.x
    this.y = pos.y
    this.label = new Label(pos.x, pos.y, 0, 0, String(score), {
      width: 100,
      height: 100,
      align: 'center',
      color: type ? color.white : color.dark,
      strokeColor: type ? color.dark : color.white,
    })
    this.twInit = tween.wait(initWait).start()
  }

  update() {
    if (this.twInit.next().running) return

    if (this.twSlide.next().running) {
      this.label.y = this.y - this.twSlide.value
      this.label.update()
    } else {
      list.delete(this)
    }
  }
}
