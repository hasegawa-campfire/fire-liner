import { Sprite } from '@local_modules/sprite.js'
import { Dialog } from '@/ui/dialog.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'
import { color, maxLevel, pref, store } from '@/r.js'
import { getUnlockLevel, setAudioMute } from '@/helper.js'
import { logEvent } from '@/data/server.js'

const sprBack = Sprite.load('icon/back.png')
const sprRetry = Sprite.load('icon/retry.png')
const sprMuteOff = Sprite.load('icon/mute-off.png')
const sprMuteOn = Sprite.load('icon/mute-on.png')
const sprPrev = Sprite.load('icon/prev.png')
const sprNext = Sprite.load('icon/next.png')

export class PauseDialog {
  dialog = new Dialog(112, 112)

  lblTitle = new Label(0, 0, 96, 8, '- ちゅうだん -', {
    align: 'center',
    color: color.dark,
  })

  btnBack = new Button(0, 16, 24, 24, sprBack)
  btnMute = new Button(32, 16, 32, 24, sprMuteOff)
  btnRetry = new Button(72, 16, 24, 24, sprRetry)

  btnPrev = new Button(0, 48, 48, 24, sprPrev)
  btnNext = new Button(48, 48, 48, 24, sprNext)

  btnClose = new Button(16, 80, 64, 16, 'とじる')

  open() {
    this.dialog.height = store.puzzle ? 112 : 80
    this.btnClose.y = store.puzzle ? 80 : 48
    this.btnRetry.disabled = store.replay
    this.btnPrev.lock = store.level ? false : getUnlockLevel() < maxLevel
    this.btnNext.lock =
      store.level < maxLevel && store.level + 1 > getUnlockLevel()

    this.dialog.resize()
    this.dialog.open()
  }

  close() {
    this.dialog.close()
  }

  update() {
    this.dialog.update(() => this.updateContent())
  }

  updateContent() {
    this.btnMute.caption = pref.mute ? sprMuteOn : sprMuteOff

    this.lblTitle.update()
    this.btnBack.update()
    this.btnRetry.update()
    this.btnMute.update()

    if (store.puzzle) {
      this.btnPrev.update()
      this.btnNext.update()
    }

    this.btnClose.update()

    if (this.btnBack.isClick) {
      store.nextScene = [store.puzzle ? 'levels' : 'title']
    }

    if (this.btnRetry.isClick) {
      const puzzle = store.puzzle
      const level = store.level
      store.nextScene = ['play', { puzzle, level }]

      if (puzzle) {
        logEvent('puzzle_retry', { level: store.level })
      } else {
        logEvent('scoretrial_retry')
      }
    }

    if (this.btnPrev.isClick) {
      const puzzle = store.puzzle
      const level = store.level <= 0 ? maxLevel : store.level - 1
      store.nextScene = ['play', { puzzle, level }]
    }

    if (this.btnNext.isClick) {
      const puzzle = store.puzzle
      const level = store.level >= maxLevel ? 0 : store.level + 1
      store.nextScene = ['play', { puzzle, level }]
    }

    if (this.btnMute.isClick) {
      setAudioMute(!pref.mute)
    }

    if (this.btnClose.isClick) {
      this.dialog.close()
    }
  }
}
