import { Tween } from '@local_modules/tween.js'
import { g, pref, screen } from '@/r.js'
import { Button } from '@/ui/button.js'

export const height = 16

export class ListItem {
  index
  title
  button
  isClick = false
  twNew = Tween.from(0).wait(30).to(1).wait(30).loop().start()

  /**
   * @param {number} index
   * @param {string} title
   * @param {boolean} lock
   */
  constructor(index, title, lock) {
    this.index = index
    this.title = title
    this.button = new Button(8, index * height, screen.width - 16, 16, title)
    this.button.lock = lock
  }

  update() {
    this.button.new = !pref.tips[this.index]
    this.button.update()
    this.isClick = this.button.isClick
  }
}
