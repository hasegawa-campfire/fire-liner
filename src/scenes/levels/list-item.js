import { Sprite } from '@local_modules/sprite.js'
import { steps, Tween } from '@local_modules/tween.js'
import { color, g, store } from '@/r.js'
import { Button } from '@/ui/button.js'
import { getLevelScore, isScorable } from '@/helper.js'

const sprNum = Sprite.load('levels/number.png')
const sprStar = Sprite.load('levels/star.png')
const iconSize = 8

export const width = 32
export const height = 32

/**
 * @param {number} num
 * @param {number} oy
 */
function drawNum(num, oy) {
  if (num > 9) {
    g.drawImage(
      sprNum,
      -iconSize,
      oy,
      iconSize,
      iconSize,
      Math.floor(num / 10) * iconSize,
      0,
      iconSize,
      iconSize
    )
  }
  g.drawImage(
    sprNum,
    num > 9 ? 0 : -iconSize / 2,
    oy,
    iconSize,
    iconSize,
    (num % 10) * iconSize,
    0,
    iconSize,
    iconSize
  )
}

export class ListItem {
  x
  y
  level
  star
  button
  twBlink = Tween.from(0).wait(60).to(1).to(3, 12, steps(3)).to(0).wait(60)
  twNew = Tween.from(0).wait(30).to(1).wait(30).loop().start()

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} level
   * @param {boolean} lock
   * @param {number} star
   */
  constructor(x, y, level, lock, star) {
    this.x = x
    this.y = y
    this.level = level
    this.star = star
    this.button = new Button(8 + x * width, 8 + y * height, width, height)
    this.button.lock = lock
    this.button.new = star === 0
  }

  update() {
    this.button.update(() => this.updateContent())

    if (this.button.isClick) {
      const puzzle = true
      const level = this.level
      store.nextScene = ['play', { puzzle, level }]
    }
  }

  updateContent() {
    if (!this.star) {
      drawNum(this.level + 1, -iconSize / 2)
    } else {
      const y = isScorable() ? -iconSize / 2 : 0

      drawNum(this.level + 1, y)

      if (!this.twBlink.next().running && Math.random() * 100 < 1) {
        this.twBlink.start()
      }

      const sx = this.twBlink.value * iconSize * 2
      const sy = (this.star - 1) * iconSize

      g.drawImage(
        sprStar,
        -iconSize,
        y - iconSize - 1,
        iconSize * 2,
        iconSize,
        sx,
        sy,
        iconSize * 2,
        iconSize
      )

      if (isScorable()) {
        const score = String(Math.min(getLevelScore(this.level), 999999))
        g.drawText(score, 0, y + iconSize, { align: 'top', color: color.light })
      }
    }
  }
}
