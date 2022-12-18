import { screen } from '@/r.js'
import { Scroller } from '@/ui/scroller.js'
import { getTopEntries, getMeReplays, getMe } from '@/data/server.js'
import { ListItem, height as itemHeight } from './list-item.js'
import { times } from '@local_modules/util/index.js'
import { ListBg } from './list-bg.js'

/** @type {ReplayData[]} */
const dummyReplays = times(9).map((n) => ({
  score: (n + 2) * 1000,
  id: '',
  uid: '',
  type: '',
  log: '',
}))

export class List {
  width = screen.width
  height = screen.height - 16
  scroller
  items = /** @type {ListItem[]} */ ([])
  bg = new ListBg(this)
  /** @type {EntryData | ReplayData | null} */
  clickData = null
  isTop = true
  /** @type {(EntryData | ReplayData)[] | null} */
  dataList = null

  constructor() {
    this.scroller = new Scroller(this)
  }

  update() {
    /** @type {(EntryData | ReplayData)[] | null} */
    let dataList = this.isTop ? getTopEntries() : getMeReplays()

    if (dataList !== this.dataList) {
      this.dataList = dataList
      this.items = []

      if (!this.isTop && dataList) {
        dataList = dataList
          .concat(dummyReplays)
          .sort((a, b) => b.score - a.score)
          .slice(0, 9)
      }

      dataList?.forEach((data, i) => {
        this.items.push(new ListItem(i, data))

        if ('name' in data && getMe()?.uid === data.uid) {
          this.scroller.scrollY = (i - 4) * itemHeight
        }
      })
    }

    this.scroller.contentHeight = this.items.length * itemHeight

    this.bg.update()
    this.scroller.update(() => this.updateContent())

    const item = this.items.find((it) => it.isClick)
    this.clickData = item?.data ?? null
  }

  updateContent() {
    for (const item of this.items) {
      const top = item.rank * itemHeight - this.scroller.scrollY
      const bottom = top + itemHeight
      if (0 < bottom && top < this.height) {
        item.update()
      }
    }
  }
}
