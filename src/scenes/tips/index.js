import { TipsDialog } from '@/dialogs/tips-dialog.js'
import tipsDataList from '@/data/tips.js'
import { bgm, g, pref } from '@/r.js'
import { getLevelStar } from '@/helper.js'
import { logEvent } from '@/data/server.js'
import { List } from './list.js'
import { Status } from './status.js'

export { TipsDialog }

export class SceneTips {
  bgm = bgm.menu
  list
  status = new Status()
  dialog = new TipsDialog()

  constructor() {
    const tips = tipsDataList.map((t) => ({ title: t.title, lock: true }))
    tips[0].lock = false
    tips[1].lock = !pref.tips[1]
    tips[2].lock = !pref.tips[2]
    tips[3].lock = getLevelStar(12) <= 0
    tips[4].lock = !pref.tips[4]
    tips[5].lock = !pref.tips[4]
    tips[6].lock = !pref.tips[4]
    tips[7].lock = false
    tips[8].lock = false
    if (!pref.tips[8]) tips.pop()
    this.list = new List(tips)

    logEvent('tips_view')
  }

  update() {
    g.save()
    g.translate(0, 16)
    this.list.update()
    g.restore()

    this.status.update()
    this.dialog.update()

    if (this.list.clickIndex >= 0) {
      this.dialog.open(this.list.clickIndex)
    }
  }
}
