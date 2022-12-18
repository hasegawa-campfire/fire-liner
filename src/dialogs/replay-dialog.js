import { Sprite } from '@local_modules/sprite.js'
import { delimit } from '@local_modules/util/index.js'
import { Dialog } from '@/ui/dialog.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'
import { color, defaultName, se, store } from '@/r.js'
import { fetchReplayData, fetchEntry, getMe } from '@/data/server.js'
import { replayUrl } from '@/data/urls.js'

const sprTwitter = Sprite.load('icon/twitter.png')
const sprPlay = Sprite.load('icon/play.png')

export class ReplayDialog {
  dialog = new Dialog(112, 96)
  lblTitle = new Label(0, 0, 96, 8, '- リプレイさいせい -', {
    align: 'center',
    color: color.dark,
  })
  lblDetail = new Label(0, 16, 96, 8, '', { align: 'center' })
  btnTwitter = new Button(0, 32, 44, 24, sprTwitter)
  btnPlay = new Button(52, 32, 44, 24, sprPlay)
  btnClose = new Button(16, 64, 64, 16, 'とじる')
  score = /** @type {number | null} */ (null)
  name = /** @type {string | null} */ ('')
  log = ''
  replayId = ''

  /**
   * @param {ReplayData | EntryData | string} data
   */
  open(data) {
    if (typeof data === 'string') {
      this.replayId = data
      this.name = ''
      this.score = null
      this.log = ''
      this.fetchData(data)
    } else if ('name' in data) {
      this.replayId = data.replayId
      this.name = data.name
      this.score = data.score
      this.log = ''
      this.fetchData(data.replayId)
    } else {
      this.replayId = data.id
      this.name = null
      this.score = data.score
      this.log = data.log
    }

    this.btnTwitter.linkUrl = replayUrl(
      this.replayId,
      this.score ? delimit(this.score) : ''
    )
    this.dialog.open()
  }

  /**
   * @param {string} id
   */
  async fetchData(id) {
    const replay = await fetchReplayData(id)
    if (replay) {
      this.score = replay.score
      this.log = replay.log
      this.btnTwitter.linkUrl = replayUrl(
        this.replayId,
        this.score ? delimit(this.score) : ''
      )

      if (!this.name) {
        const entry = await fetchEntry(replay.uid)
        this.name = entry?.name || ''
      }
    }
  }

  close() {
    this.dialog.close()
  }

  update() {
    const score = this.score === null ? '' : `${delimit(this.score)} `
    const name = this.name === null ? getMe()?.displayName : this.name
    this.lblDetail.text = `${score}${name || defaultName}`
    this.btnPlay.disabled = !this.log
    this.dialog.update(() => this.updateContent())
  }

  updateContent() {
    this.lblTitle.update()
    this.lblDetail.update()
    this.btnTwitter.update()
    this.btnPlay.update()
    this.btnClose.update()

    if (this.btnPlay.isClick) {
      const log = this.log
      const replayId = this.replayId
      store.nextScene = ['play', { log, replayId }]
    }

    if (this.btnClose.isClick) {
      this.dialog.close()
    }
  }
}
