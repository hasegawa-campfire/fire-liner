import { times } from '@/local_modules/util/index.js'
import { TipsDialog } from '@/dialogs/tips-dialog.js'
import tipsDataList from '@/data/tips.js'
import { bgm, g, pref } from '@/r.js'
import { getLevelStar } from '@/helper.js'
import { logEvent } from '@/data/server.js'
import { List } from './list.js'
import { Status } from './status.js'

export { TipsDialog }

function getLocks() {
  const locks = times(9).map(() => false)
  locks[1] = !pref.tips[1]
  locks[2] = !pref.tips[2]
  locks[3] = getLevelStar(12) <= 0
  locks[4] = !pref.tips[4]
  locks[5] = !pref.tips[4]
  locks[6] = !pref.tips[4]
  if (!pref.tips[8]) locks.pop()
  return locks
}

export function existNewTips() {
  return getLocks().some((lock, i) => !lock && !pref.tips[i])
}

export class SceneTips {
  bgm = bgm.menu
  list
  status = new Status()
  dialog = new TipsDialog()

  constructor() {
    const tips = getLocks().map((lock, i) => {
      const title = tipsDataList[i].title
      return { title, lock }
    })

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
