import { bgm, g, pref, store } from '@/r.js'
import { TipsDialog } from '@/dialogs/tips-dialog.js'
import { isAllClear } from '@/helper.js'
import { logEvent } from '@/data/server.js'
import { List } from './list.js'
import { Status } from './status.js'

export class SceneLevels {
  bgm = bgm.menu
  list = new List()
  status = new Status()

  dlgTips = new TipsDialog()

  constructor() {
    store.puzzle = true

    if (isAllClear() && !pref.tips[8]) {
      this.dlgTips.open(8, 40)
    }

    logEvent('levels_view')
  }

  update() {
    g.save()

    this.status.update()
    g.translate(0, 16)
    this.list.update()

    g.restore()

    this.dlgTips.update()
  }
}
