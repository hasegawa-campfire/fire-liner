import { getLevelStar, getUnlockLevel } from '@/helper.js'
import { ListItem } from './list-item.js'
import { ListBg } from './list-bg.js'

const cols = 4
const rows = 4

export class List {
  width = screen.width
  height = screen.height - 16
  items = /** @type {ListItem[]} */ ([])
  bg = new ListBg(this)

  constructor() {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const level = x + y * cols
        const lock = level > getUnlockLevel()
        const star = getLevelStar(level)
        this.items.push(new ListItem(x, y, level, lock, star))
      }
    }
  }

  update() {
    this.bg.update()
    for (const item of this.items) item.update()
  }
}
