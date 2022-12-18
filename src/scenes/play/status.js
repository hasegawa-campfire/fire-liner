import { Sprite } from '@local_modules/sprite.js'
import { toZenkaku } from '@local_modules/util/index.js'
import { g, screen, color, store, tween, mainLoop } from '@/r.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'
import { getMeEntry } from '@/data/server.js'
import { levelDataList } from '@/data/levels.js'
import { getLevelScore, getLevelStar, isScorable } from '@/helper.js'

const sprRetry = Sprite.load('icon/retry.png')
const sprPause = Sprite.load('icon/pause.png')

/**
 * @param {number} len
 * @param {string | number} val
 */
function zero(val, len = 2) {
  return toZenkaku(String(val)).padStart(len, '０')
}

/**
 * @param {number} len
 * @param {string | number} val
 */
function sp(val, len = 2) {
  return toZenkaku(String(val)).padStart(len, '　')
}

export class Status {
  lblBg = new Label(0, 0, screen.width - 48, 16, '', {
    color: color.dark,
    lineSpacing: 0,
  })
  lblFr = new Label(0, 0, screen.width - 48, 16, '', {
    color: color.white,
    lineSpacing: 0,
  })
  btnRetry = new Button(screen.width - 48, 0, 24, 16, sprRetry)
  btnPause = new Button(screen.width - 24, 0, 24, 16, sprPause)

  isPauseClick = false
  rate = 0
  twRate = tween.from(false).to(true).wait(90).to(false)

  constructor() {
    this.btnRetry.disabled = store.replay
  }

  update() {
    g.drawRect(0, 0, screen.width, 16, color.black)

    if (isScorable()) {
      if (store.rate > 1) {
        this.rate = store.rate
        this.twRate.start()
      } else if (!this.twRate.next().running) {
        this.rate = store.rate
      }

      const hiScore = store.puzzle
        ? getLevelScore() ?? 0
        : getMeEntry()?.score ?? 0

      if (!store.replay && hiScore < store.score) {
        store.newRecord = true
      }

      const rate = Math.min(this.rate, 99)
      const time = Math.min(Math.max(store.time, 0), store.timeLimit)
      const sec = Math.ceil((store.timeLimit - time) / mainLoop.fps)
      const hi = String(
        Math.min(Math.max(hiScore, store.score), 999999)
      ).padStart(2, '0')
      const sc = String(Math.min(store.score, 999999)).padStart(2, '0')

      const bg1 = `${
        store.puzzle ? `Lv${zero(store.level + 1)}` : `⌚${zero(sec)}`
      }　${store.replay ? ' - リプレイ -' : `Hi${zero(hi, 6)}`}`
      const fr1 = `${
        store.puzzle ? `Lv${zero(store.level + 1)}` : `⌚${sp(sec)}`
      }　${store.replay ? '' : `Hi${sp(hi, 6)}`}`
      const bg2 = `ｘ${zero(rate)}　Sc${zero(sc, 6)}`
      const fr2 = `${rate ? `ｘ${sp(rate)}` : '　　　'}　Sc${sp(sc, 6)}`

      this.lblBg.text = `${bg1}\n${bg2}`
      this.lblFr.text = `${fr1}\n${fr2}`
    } else {
      const lv = store.level + 1
      const star = getLevelStar()
      const starFr = '★'.repeat(star).padEnd(3, '　')
      this.lblBg.text = `レベル${zero(lv)}　☆☆☆`
      this.lblFr.text = `レベル${sp(lv)}　${starFr}\n　${
        levelDataList[store.level].title
      }`
    }

    this.lblBg.update()
    this.lblFr.update()

    this.btnRetry.update()
    this.btnPause.update()

    g.drawRect(14, 14, 1, 1, color.black)
  }
}
