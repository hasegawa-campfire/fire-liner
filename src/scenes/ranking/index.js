import { logEvent } from '@/data/server.js'
import { ReplayDialog } from '@/dialogs/replay-dialog.js'
import { bgm, g } from '@/r.js'
import { List } from './list.js'
import { Status } from './status.js'

export class SceneRanking {
  bgm = bgm.menu
  list = new List()
  status = new Status()
  dialog = new ReplayDialog()

  constructor() {
    logEvent('ranking_view')
  }

  update() {
    this.list.isTop = this.status.isTop

    g.save()
    g.translate(0, 16)
    this.list.update()
    g.restore()

    this.status.update()
    this.dialog.update()

    if (this.list.clickData) {
      this.dialog.open(this.list.clickData)
    }
  }
}
