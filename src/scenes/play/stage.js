import { removeArrayItem, equalsPos } from '@local_modules/util/index.js'
import { store, tileSize, random, tween } from '@/r.js'
import { isScorable, toTileCenterPos } from '@/helper.js'
import { levelDataList } from '@/data/levels.js'
import { StageTile, getDir } from './stage-tile.js'
import { StageStroke } from './stage-stroke.js'
import { StageBg } from './stage-bg.js'
import { StageItem } from './stage-item.js'
import { StageBlock } from './stage-block.js'
import { EffectScore } from './effect-score.js'
import { EffectSpark } from './effect-spark.js'

const stTiles = [
  [2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2],
]

const cols = 6
const rows = 6

/**
 * @template {Pos} T
 * @param {T[]} items
 * @param {Pos} pos
 */
function findPos(items, pos) {
  return items.find((it) => equalsPos(it, pos))
}

/**
 * @template {Pos} T
 * @param {T[]} items
 * @param {Pos} pos
 */
function filterPos(items, pos) {
  return items.filter((it) => equalsPos(it, pos))
}

export class Stage {
  width
  height
  tiles = /** @type {StageTile[]} */ ([])
  items = /** @type {StageItem[]} */ ([])
  itemPairs = /** @type {[Pos,StageItem,StageItem,boolean][]} */ ([])
  blocks = /** @type {StageBlock[]} */ ([])
  waitAnime = /** @type {{anime: boolean} | null} */ (null)
  stroke
  bg
  queue = /** @type {(Pos | null)[][]} */ ([])
  reverseCount = 0
  itemCount = 2
  itemMoved = false

  constructor() {
    EffectScore.clear()
    EffectSpark.clear()

    const tiles = store.puzzle ? levelDataList[store.level].tiles : stTiles

    this.width = cols * tileSize
    this.height = rows * tileSize
    this.stroke = new StageStroke(cols, rows, tiles)
    this.bg = new StageBg(this, tiles)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const wait = (x + y) * 4 + 12
        if (tiles[y][x] === 1) {
          this.blocks.push(new StageBlock(x, y, wait + 20))
        } else if (tiles[y][x]) {
          const type = tiles[y][x] - 2
          this.tiles.push(new StageTile(x, y, type, wait))
        }
      }
    }

    if (store.puzzle) {
      const items = levelDataList[store.level].items
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const wait = (x + y) * 4 + 20
          if (items[y][x]) {
            const type = items[y][x] - 1
            this.items.push(new StageItem(x, y, type, wait))
          }
        }
      }
    } else {
      this.addRandomItems(true)
    }
  }

  update() {
    if (this.stroke.onEnd) {
      const route = this.stroke.clear()
      if (route.length > 1) {
        this.queue.push(route)
      }
    }

    if (this.waitAnime && !this.waitAnime.anime) {
      this.waitAnime = null
    }

    while (!tween.paused && !this.waitAnime && this.queue.length) {
      const route = this.queue[0]
      const [pos, next] = route

      if (!pos || !next) {
        this.queue.shift()
        store.rate = 1
        this.reverseCount = 0
        this.itemMoved = false
        continue
      }

      const item = findPos(this.items, pos)

      if (item) {
        this.moveItem(item, next)
        this.waitAnime = item

        if (!equalsPos(item, pos)) {
          const tile = findPos(this.tiles, pos)
          this.reverseTile(tile, getDir(pos, next), false)
        }
      }

      route.shift()
    }

    if (
      !store.puzzle &&
      !this.items.length &&
      !tween.paused &&
      !this.waitAnime &&
      !this.queue.length
    ) {
      this.addRandomItems()
    }

    this.bg.update()
    for (const tile of this.tiles) tile.update()
    for (const block of this.blocks) block.update()
    EffectScore.update()
    for (const item of this.items) item.update()
    for (const pair of this.itemPairs.slice()) {
      const [prev, item1, item2, pushed] = pair
      item2.update()
      item1.update()

      if (!item1.anime) {
        removeArrayItem(this.itemPairs, pair)
        const tile = findPos(this.tiles, item1)
        this.reverseTile(tile, getDir(prev, item1), true)
        this.waitAnime = pushed ? null : tile || null
        EffectSpark.add(item1.type, toTileCenterPos(item1))
      }
    }
    EffectSpark.update()
    this.stroke.update()
  }

  /**
   * @param {StageItem} item
   * @param {Pos} next
   * @return {[StageItem,StageItem] | void}
   */
  moveItem(item, next, pushed = false) {
    const pos = { x: item.x, y: item.y }
    const tile = findPos(this.tiles, pos)
    const nextTile = findPos(this.tiles, next)
    const nextItem = findPos(this.items, next)

    if (!tile || !nextTile || (!pushed && nextTile.type !== tile.type)) {
      // とびあがり
      item.move(pos, pushed)
      return
    }

    if (!nextItem) {
      // 移動
      item.move(next, pushed)

      if (!pushed && !this.itemMoved) store.routeCount++
      this.itemMoved = true
      return
    }

    if (nextItem.type === item.type) {
      // 移動&次に消える
      item.move(next, pushed)
      removeArrayItem(this.items, item)
      removeArrayItem(this.items, nextItem)
      this.itemPairs.push([pos, item, nextItem, pushed])

      if (!pushed && !this.itemMoved) store.routeCount++
      this.itemMoved = true
      return [item, nextItem]
    }

    const next2 = {
      x: next.x + (next.x - pos.x),
      y: next.y + (next.y - pos.y),
    }

    const ret = this.moveItem(nextItem, next2, true)
    if (equalsPos(next, nextItem)) {
      // とびあがり
      item.move(pos, pushed)
      return
    } else {
      // 移動
      item.move(next, pushed)

      if (!pushed && !this.itemMoved) store.routeCount++
      this.itemMoved = true
      return ret
    }
  }

  /**
   * @param {StageTile | undefined} tile
   * @param {number} dir
   * @param {boolean} pair
   */
  reverseTile(tile, dir, pair) {
    tile?.reverse(dir)

    if (!tile || !store.timeIn) return

    if (pair && store.rate < 16) store.rate *= 2

    this.reverseCount++

    const reverseScore = this.reverseCount * 10
    store.score += store.rate * reverseScore

    if (isScorable()) {
      const pos = toTileCenterPos(tile)
      if (pair) pos.y += 6
      EffectScore.add(tile.type, pos, reverseScore, 25)
    }

    if (pair) {
      const pairScore = 100
      store.score += store.rate * pairScore

      if (isScorable()) {
        const pos = toTileCenterPos(tile)
        EffectScore.add(tile.type, pos, pairScore, 0)
      }
    }
  }

  addRandomItems(init = false) {
    const tiless = /** @type {StageTile[][]} */ ([[], []])
    const counts = [0, 0]
    const total = this.itemCount++

    for (const tile of this.tiles) {
      tiless[tile.type].push(tile)
    }

    if (tiless[0].length >= tiless[1].length) {
      counts[0] = Math.round((total * tiless[0].length) / this.tiles.length)
      counts[1] = total - counts[0]
    } else {
      counts[1] = Math.round((total * tiless[1].length) / this.tiles.length)
      counts[0] = total - counts[1]
    }

    for (const j of [0, 1]) {
      const count = counts[j] * 2
      const tiles = tiless[j]

      for (let i = 0; i < count && tiles.length; i++) {
        const tile = tiles.splice(random.nextInt(tiles.length), 1)[0]
        const wait = init ? (tile.x + tile.y) * 4 + 20 : i * 4

        this.items.push(new StageItem(tile.x, tile.y, 0, wait))
      }
    }
  }
}
