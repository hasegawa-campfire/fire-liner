import { Sprite } from '@local_modules/sprite.js'
import { Tween } from '@local_modules/tween.js'
import { delimit } from '@local_modules/util/index.js'
import { Dialog } from '@/ui/dialog.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'
import { bgm, color, g, maxLevel, store } from '@/r.js'
import {
  getLevelStar,
  getUnlockLevel,
  isScorable,
  playAudioBgm,
} from '@/helper.js'

const sprRetry = Sprite.load('icon/retry.png')
const sprNext = Sprite.load('icon/next.png')
const sprBack = Sprite.load('icon/back.png')

function needNext() {
  const nextLv = store.level < maxLevel ? store.level + 1 : 0
  return nextLv <= getUnlockLevel() && !getLevelStar(nextLv)
}

export class ResultPzlDialog {
  dialog = new Dialog(112, 104)

  lblTitle = new Label(0, 0, 96, 8, '', {
    align: 'center',
    color: color.dark,
  })

  lblStar1 = new Label(8, 16, 80, 8, '　 コマを全て消した')
  lblStar2 = new Label(8, 32, 80, 8, '')
  lblStar3 = new Label(8, 48, 80, 8, '')

  lblStar1Icon = new Label(8, 16, 80, 8, '☆')
  lblStar2Icon = new Label(8, 32, 80, 8, '')
  lblStar3Icon = new Label(8, 48, 80, 8, '')

  btnRetry = new Button(0, 64, 32, 24, sprRetry)
  btnNext = new Button(32, 64, 64, 24, sprNext)

  lblScore = new Label(0, 16, 96, 8, '', { align: 'center' })
  btnBack = new Button(0, 32, 44, 24, sprBack)

  twStar = Tween.from(0).wait(30).to(1).wait(30).loop().start()

  /**
   * @param {boolean} allSame
   * @param {boolean} oneMove
   */
  open(allSame, oneMove) {
    this.lblTitle.text = `- レベル ${store.level + 1} クリア -`
    this.btnRetry.disabled = store.replay

    if (allSame || oneMove) {
      this.lblStar2Icon.text = '☆'
      this.lblStar2.text = oneMove ? '　 １手でクリア' : '　 １色にそろえた'
    } else {
      this.lblStar2Icon.text = ''
      this.lblStar2.text = ''
    }

    if (allSame && oneMove) {
      this.lblStar3Icon.text = '☆'
      this.lblStar3.text = '　 １色にそろえた'
    } else {
      this.lblStar3Icon.text = ''
      this.lblStar3.text = ''
    }

    this.dialog.height = 104

    if (isScorable()) {
      this.lblScore.text = delimit(store.score)
      this.lblTitle.text = store.newRecord
        ? '- ハイスコアです!! -'
        : '- こんかいのスコア -'
      this.dialog.height -= 32
      this.dialog.resize()
    }

    this.btnRetry.y =
      this.btnNext.y =
      this.btnBack.y =
        this.dialog.content.height - 24

    if (needNext()) {
      this.btnRetry.x = 0
      this.btnRetry.width = 32
      this.btnRetry.resize()
    } else {
      this.btnBack.x = 0
      this.btnBack.width = 44
      this.btnBack.resize()
      this.btnRetry.x = 52
      this.btnRetry.width = 44
      this.btnRetry.resize()
    }

    this.dialog.open()
  }

  close() {
    this.dialog.close()
  }

  update() {
    const prevOpened = this.dialog.opened
    this.dialog.update(() => this.updateContent())
    if (!prevOpened && this.dialog.opened) {
      playAudioBgm(bgm.clear)
    }
  }

  updateContent() {
    const oy = this.twStar.next().value

    this.lblTitle.update()

    if (isScorable()) {
      this.lblScore.update()
    } else {
      this.lblStar1Icon.y = this.lblStar1.y - oy
      this.lblStar2Icon.y = this.lblStar2.y - oy
      this.lblStar3Icon.y = this.lblStar3.y - oy

      for (const star of [this.lblStar1, this.lblStar2, this.lblStar3]) {
        for (let x = 0; x < 96; x += 4) {
          g.drawRect(x, star.y + 9, 2, 1, color.light)
        }
      }

      this.lblStar1.update()
      this.lblStar2.update()
      this.lblStar3.update()
      this.lblStar1Icon.update()
      this.lblStar2Icon.update()
      this.lblStar3Icon.update()
    }

    if (needNext()) {
      this.btnRetry.update()
      this.btnNext.update()
    } else {
      this.btnBack.update()
      this.btnRetry.update()
    }

    if (this.btnRetry.isClick) {
      const puzzle = true
      const level = store.level
      store.nextScene = ['play', { puzzle, level }]
    }

    if (this.btnNext.isClick) {
      const puzzle = true
      const level = store.level >= maxLevel ? 0 : store.level + 1
      store.nextScene = ['play', { puzzle, level }]
    }

    if (this.btnBack.isClick) {
      store.nextScene = ['levels']
    }
  }
}
