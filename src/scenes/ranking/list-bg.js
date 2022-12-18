import { g, color } from '@/r.js'

export class ListBg {
  width
  height

  /**
   * @param {Size} size
   */
  constructor(size) {
    this.width = size.width
    this.height = size.height
  }

  update() {
    g.drawRect(0, 0, this.width, this.height, color.white)
  }
}
