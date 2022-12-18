import { Sprite } from '@local_modules/sprite.js'
import { equalsPos, map } from '@local_modules/util/index.js'
import { inSine, outSine } from '@local_modules/tween.js'
import { g, se, tween } from '@/r.js'
import { toTileCenterPos } from '@/helper.js'

const spr = Sprite.load('play/stage-item.png')
const size = 16

export class StageItem {
  x
  y
  type
  prev = /** @type {Pos | null} */ (null)
  twInit
  twSurprise = tween.from(false).to(true).wait(20).to(false)
  twMove = tween.from(0).to(1, 8)
  twJump = tween.from(0).to(-4, 4, outSine).to(0, 4, inSine)
  twWaiting = tween.from(0).wait(120).to(1).wait(60).loop().start()
  twWink = tween.from(false).to(true).wait(10).to(false).wait(120)

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} type
   * @param {number} initWait
   */
  constructor(x, y, type, initWait = 0) {
    this.x = x
    this.y = y
    this.type = type
    this.twInit = tween.wait(initWait).start()
    this.move({ x, y }, false, true)
  }

  /**
   * @param {Pos} pos
   * @param {boolean} pushed
   * @param {boolean} init
   */
  move(pos, pushed = false, init = false) {
    this.prev = { x: this.x, y: this.y }
    this.x = pos.x
    this.y = pos.y
    this.twMove.start()

    if (pushed) {
      if (!equalsPos(pos, this.prev)) {
        this.twSurprise.start()
      }
    } else {
      this.twJump.start()
      if (equalsPos(pos, this.prev) && !init) {
        this.twSurprise.start()
        se.notMove.play()
      } else if (!init) {
        se.move.play()
      }
    }
  }

  get anime() {
    return this.twMove.running
  }

  update() {
    if (this.twInit.next().running) return
    if (this.twInit.onDone) se.move.play()

    const pos = toTileCenterPos(this)

    if (this.twMove.next().running && this.prev) {
      const rate = this.twMove.value
      const prevPos = toTileCenterPos(this.prev)
      const jumpRate = equalsPos(prevPos, pos) ? 1.5 : 1

      pos.x = map(prevPos.x, pos.x, rate)
      pos.y = map(prevPos.y, pos.y, rate)
      pos.y += this.twJump.next().value * jumpRate
      this.twWaiting.start()
    }

    const surprise = this.twSurprise.next().value
    const blink = this.twWink.next().value

    if (!this.twWink.running && Math.random() * 100 < 1) {
      this.twWink.start()
    }

    g.save()
    g.translate(pos.x, pos.y - 4 - this.twWaiting.next().value)
    g.drawImage(
      spr,
      -size / 2,
      -size / 2,
      size,
      size,
      size * (surprise ? 2 : blink ? 1 : 0),
      this.type * size,
      size,
      size
    )
    g.restore()
  }
}
