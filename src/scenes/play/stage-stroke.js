import { Sprite } from '@local_modules/sprite.js'
import { toDist, equalsPos } from '@local_modules/util/index.js'
import { dataLog, g, pointer, se, tileSize, tween } from '@/r.js'
import { isScorable, toTileCenterPos } from '@/helper.js'

const spr = Sprite.load('play/stage-stroke.png')
const margin = 2
const size = tileSize + margin * 2

export class StageStroke {
  line = /** @type {Pos[]} */ ([])
  cols
  rows
  tiles
  down = false
  diagonal = isScorable()

  /**
   * @param {number} cols
   * @param {number} rows
   * @param {number[][]} tiles
   */
  constructor(cols, rows, tiles) {
    this.cols = cols
    this.rows = rows
    this.tiles = tiles
  }

  get onEnd() {
    return !this.down && this.line.length > 0
  }

  clear() {
    const line = this.line
    this.line = []
    return line
  }

  update() {
    if (!tween.paused) {
      const addPos = this.getAddPos()
      const addX = dataLog.next(addPos?.x ?? -1)
      const addY = dataLog.next(addPos?.y ?? -1)

      if (addX < 0 || addY < 0) {
        this.down = false
      } else {
        this.down = true
        const addPos = { x: addX, y: addY }
        const last = this.line.at(-1)
        const last2 = this.line.at(-2)

        if (last && equalsPos(last, addPos)) {
          // none
        } else if (last2 && equalsPos(last2, addPos)) {
          this.line.pop()
          se.strokeAdd.play()
        } else {
          this.line.push(addPos)
          se.strokeAdd.play()
        }
      }
    }

    let prev2 = /** @type {Pos | null} */ (null)
    let prev1 = /** @type {Pos | null} */ (null)
    const last = this.line.at(-1)

    for (const pos of this.line) {
      this.draw(prev1, pos, 1, pos === last)
      this.draw(prev2, prev1, 0, false)
      prev2 = prev1
      prev1 = pos
    }

    this.draw(prev2, prev1, 0, true)
  }

  /**
   * @return {Pos | void}
   */
  getAddPos() {
    if (!pointer.isDown) return

    const ptrPos = g.invertTransformPos(pointer)
    const rawTPos = {
      x: Math.floor(ptrPos.x / tileSize),
      y: Math.floor(ptrPos.y / tileSize),
    }
    const tpos = {
      x: Math.min(Math.max(rawTPos.x, 0), this.cols - 1),
      y: Math.min(Math.max(rawTPos.y, 0), this.rows - 1),
    }

    const tileHalf = tileSize / 2
    const last = this.line.at(-1)
    const last2 = this.line.at(-2)

    if (!last) {
      if (
        pointer.isDownChange &&
        equalsPos(rawTPos, tpos) &&
        this.tiles[tpos.y][tpos.x] !== 1
      )
        return tpos
      return
    }

    if (
      equalsPos(last, tpos) ||
      !(
        toDist(toTileCenterPos(last), ptrPos) > tileSize ||
        toDist(toTileCenterPos(tpos), ptrPos) < tileHalf - 2
      )
    ) {
      return last
    }

    const signX = Math.sign(tpos.x - last.x)
    const signY = Math.sign(tpos.y - last.y)

    const next = { x: last.x + signX, y: last.y + signY }

    if (last2 && equalsPos(last2, next)) return next

    if (!signX || !signY) {
      return this.isValid(last, next) ? next : last
    }

    if (this.diagonal && this.isValid(last, next)) return next

    const nexts = [
      { x: last.x + signX, y: last.y },
      { x: last.x, y: last.y + signY },
    ]

    const lastPos = toTileCenterPos(last)
    const distX = Math.abs(ptrPos.x - lastPos.x)
    const distY = Math.abs(ptrPos.y - lastPos.y)

    if (distX < distY) nexts.reverse()

    for (const next of nexts) {
      if (last2 && equalsPos(last2, next)) return next
      if (this.isValid(last, next)) return next
    }

    return last
  }

  /**
   * @param {Pos} last
   * @param {Pos} next
   */
  isValid(last, next) {
    if (this.tiles[next.y][next.x] === 1) return false

    return !this.line.some((pos, i, arr) => {
      if (equalsPos(next, pos)) {
        const p0 = arr[i - 1]
        const p1 = arr[i + 1]
        return (p0 && equalsPos(last, p0)) || (p1 && equalsPos(last, p1))
      }
    })
  }

  /**
   *
   * @param {Pos | null} prev
   * @param {Pos | null} pos
   * @param {number} type
   * @param {boolean} last
   */
  draw(prev, pos, type, last) {
    if (!pos) return

    const sx = last ? size * 2 : 0
    const sy = size * type

    if (!prev) {
      g.save()
      g.translatePos(toTileCenterPos(pos))
      g.translate(0, -1)
      g.drawImage(
        spr,
        -size / 2,
        -size / 2,
        size,
        size,
        size * 4,
        sy,
        size,
        size
      )
      g.restore()
      return
    }

    g.save()
    g.translatePos(toTileCenterPos(prev))
    g.translate(0, -1)

    if (prev.x === pos.x) {
      g.rotate(prev.y < pos.y ? 0 : 180)
      g.drawImage(spr, -size / 2, -margin, size, size, sx, sy, size, size)
    } else if (prev.y === pos.y) {
      g.rotate(prev.x < pos.x ? -90 : 90)
      g.drawImage(spr, -size / 2, -margin, size, size, sx, sy, size, size)
    } else if (prev.x < pos.x) {
      g.rotate(prev.y < pos.y ? 0 : -90)
      g.drawImage(spr, -margin, -margin, size, size, sx + size, sy, size, size)
    } else {
      g.rotate(prev.y < pos.y ? 90 : 180)
      g.drawImage(spr, -margin, -margin, size, size, sx + size, sy, size, size)
    }

    g.restore()
  }
}
