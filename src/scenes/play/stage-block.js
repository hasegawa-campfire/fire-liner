import { Sprite } from '@local_modules/sprite.js'
import { inSine, outSine } from '@local_modules/tween.js'
import { g, tileSize as size, tween } from '@/r.js'

const spr = Sprite.load('play/stage-block.png')

export class StageBlock {
  x
  y
  twInit
  twEntry

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} initWait
   */
  constructor(x, y, initWait = 0) {
    this.x = x
    this.y = y
    this.twInit = tween.wait(initWait) //.start()
    this.twEntry = tween.from(0).to(-4, 4, outSine).to(0, 4, inSine) //.start()
  }

  update() {
    if (this.twInit.next().running) return

    g.drawImage(spr, this.x * size, this.y * size + this.twEntry.next().value)
  }
}
