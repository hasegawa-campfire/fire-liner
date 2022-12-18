import { Sprite } from '@local_modules/sprite.js'
import { delimit } from '@local_modules/util/index.js'
import { Dialog } from '@/ui/dialog.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'
import { bgm, color, store } from '@/r.js'
import { replayUrl } from '@/data/urls.js'
import { playAudioBgm } from '@/helper.js'

const sprBack = Sprite.load('icon/back.png')
const sprRetry = Sprite.load('icon/retry.png')
const sprTwitter = Sprite.load('icon/twitter.png')
const sprPlay = Sprite.load('icon/play.png')

export class ResultStDialog {
  dialog = new Dialog(112, 120)

  lblTitle = new Label(0, 0, 96, 8, '', {
    align: 'center',
    color: color.dark,
  })
  lblScore = new Label(0, 16, 96, 8, '', { align: 'center' })

  btnBack = new Button(0, 32, 44, 24, sprBack)
  btnRetry = new Button(52, 32, 44, 24, sprRetry)

  lblTitle2 = new Label(0, 64, 96, 8, '- リプレイ -', {
    align: 'center',
    color: color.dark,
    letterSpacing: 1,
  })

  btnTwitter = new Button(0, 80, 44, 24, sprTwitter)
  btnPlay = new Button(52, 80, 44, 24, sprPlay)

  replayId = ''
  log = ''

  /**
   * @param {string | Promise<string>} replayId
   * @param {string} log
   */
  open(replayId, log) {
    this.replayId = ''
    this.log = log
    this.btnTwitter.disabled = true
    this.btnPlay.disabled = true
    this.btnRetry.disabled = store.replay

    Promise.resolve(replayId).then((id) => {
      this.btnPlay.disabled = false
      this.btnTwitter.disabled = false
      this.btnTwitter.linkUrl = replayUrl(id, delimit(store.score))
    })

    this.lblScore.text = delimit(store.score)
    this.lblTitle.text = store.newRecord
      ? '- ハイスコアです!! -'
      : '- こんかいのスコア -'

    this.dialog.open()
  }

  close() {
    this.dialog.close()
  }

  update() {
    const prevOpened = this.dialog.opened
    this.dialog.update(() => this.updateContent())
    if (!prevOpened && this.dialog.opened) {
      playAudioBgm(bgm.finish)
    }
  }

  updateContent() {
    this.lblTitle.update()
    this.lblScore.update()
    this.btnBack.update()
    this.btnRetry.update()
    this.lblTitle2.update()
    this.btnTwitter.update()
    this.btnPlay.update()

    if (this.btnBack.isClick) {
      store.nextScene = ['title']
    }

    if (this.btnRetry.isClick) {
      store.nextScene = ['play']
    }

    if (this.btnPlay.isClick) {
      const replayId = this.replayId
      const log = this.log
      store.nextScene = ['play', { log, replayId }]
    }
  }
}
