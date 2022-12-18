import { Sprite } from '@local_modules/sprite.js'
import { steps } from '@local_modules/tween.js'
import { g, se, tileSize as size, tween } from '@/r.js'
import { toTileCenterPos } from '@/helper.js'

const spr = Sprite.load('play/stage-tile.png')
const sprAnm = Sprite.load('play/stage-tile-anime.png')

/**
 * @param {Pos | null} from
 * @param {Pos | null} to
 */
export function getDir(from, to) {
  if (!from || !to) return 0
  if (from.x === to.x) {
    return from.y > to.y ? 0 : 2
  }
  if (from.y === to.y) {
    return from.x < to.x ? 1 : 3
  }
  if (from.x < to.x) {
    return from.y > to.y ? 4 : 5
  }
  if (from.x > to.x) {
    return from.y < to.y ? 6 : 7
  }
  return 0
}

export class StageTile {
  x
  y
  type
  lock
  prevLock = 0
  dir = 2
  twInit
  twEntry = tween.from(1).to(2, 8, steps(2)).start()
  twReverse = tween.from(-1).wait(4).to(0).to(2, 12, steps(3))
  twSwitch = tween.from(0).to(1).wait(8).to(0)
  twWait = tween.wait(8)
  twSe = tween.wait(4)

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} type
   * @param {number} initWait
   */
  constructor(x, y, type, initWait = 0) {
    this.x = x
    this.y = y
    this.type = type % 2
    this.lock = Math.floor(type / 2)
    this.twInit = tween.wait(initWait).start()
  }

  get anime() {
    return this.twWait.running
  }

  /**
   * @param {number} dir
   */
  reverse(dir) {
    this.twWait.start()
    this.prevLock = this.lock

    if (this.lock > 0) {
      this.lock--
      this.twSwitch.start()
      se.switch.play()
      return false
    } else {
      this.dir = dir
      this.twReverse.start()
      this.type = 1 - this.type
      this.twSe.start()
      return true
    }
  }

  update() {
    if (this.twInit.next().running) return
    if (this.twInit.onDone) se.reverse.play()

    this.twEntry.next()
    this.twReverse.next()
    this.twWait.next()
    this.twSwitch.next()

    if (this.twSe.next().onDone) se.reverse.play()

    g.save()
    g.translatePos(toTileCenterPos(this))
    g.translate(0, this.twSwitch.value)

    const lock = this.twSwitch.running ? this.prevLock : this.lock
    const step = this.twReverse.running
      ? this.twReverse.value
      : this.twEntry.running
      ? this.twEntry.value
      : -1

    if (step < 0) {
      const sx = size * (this.twReverse.running ? 1 - this.type : this.type)
      const sy = size * lock
      g.drawImage(spr, -size / 2, -size / 2, size, size, sx, sy, size, size)
    } else {
      const sx = size * (this.type === 0 ? 2 - step : step)
      const sy = size * (this.dir < 4 ? 0 : 1)

      g.rotate((this.dir % 4) * 90 + (this.type === 0 ? 180 : 0))
      g.drawImage(sprAnm, -size / 2, -size / 2, size, size, sx, sy, size, size)
    }

    g.restore()
  }
}
