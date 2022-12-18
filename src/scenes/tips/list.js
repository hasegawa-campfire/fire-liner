import { screen } from '@/r.js'
import { ListItem } from './list-item.js'
import { ListBg } from './list-bg.js'

export class List {
  width = screen.width
  height = screen.height - 16
  items = /** @type {ListItem[]} */ ([])
  bg = new ListBg(this)
  clickIndex = -1

  /**
   * @param {{title:string,lock:boolean}[]} tips
   */
  constructor(tips) {
    for (let i = 0; i < tips.length; i++) {
      this.items.push(new ListItem(i, tips[i].title, tips[i].lock))
    }
  }

  update() {
    this.bg.update()
    for (const item of this.items) item.update()

    const item = this.items.find((it) => it.isClick)
    this.clickIndex = item?.index ?? -1
  }
}
