import { Sprite } from '@local_modules/sprite.js'
import { color, g, pref } from '@/r.js'

const size = 24
const spr = Sprite.load('play/stage-bg.png')

export class StageBg {
  width
  height
  tiles

  /**
   * @param {Size} size
   * @param {number[][]} tiles
   */
  constructor(size, tiles) {
    this.width = size.width
    this.height = size.height
    this.tiles = tiles
  }

  update() {
    g.drawRect(0, 0, this.width, this.height, color.white)

    const sy = pref.theme * size
    for (let ty = 0; ty * size < this.height; ty++) {
      for (let tx = 0; tx * size < this.width; tx++) {
        if (this.tiles[ty][tx] !== 1) {
          g.drawImage(spr, tx * size, ty * size, size, size, 0, sy, size, size)
        }
      }
    }
  }
}
