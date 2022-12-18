import { Sprite } from '@local_modules/sprite.js'
import { layoutPos } from '@local_modules/util/index.js'
import { g, pref, se } from '@/r.js'
import { Dialog } from '@/ui/dialog.js'
import { Label } from '@/ui/label.js'
import { Button } from '@/ui/button.js'
import tipsDataList from '@/data/tips.js'
import { themeNames } from '@/data/theme.js'
import { logEvent } from '@/data/server.js'

const sprNext = Sprite.load('icon/next.png')
const sprPrev = Sprite.load('icon/prev.png')
const sprBg = Sprite.load('play/stage-bg.png')

export class TipsDialog {
  dialog = new Dialog(112, 112)
  lblBody = new Label(0, 40, 96, 30, '', {
    align: 'top',
  })
  btnLink = new Button(0, 44, 96, 16)
  btnPrev = new Button(0, 72, 32, 24, sprPrev)
  btnNext = new Button(32, 72, 64, 24, sprNext)

  tipsData = /** @type {TipsData | null} */ (null)
  pageIndex = 0

  /**
   * @param {number} index
   * @param {number} wait
   */
  open(index, wait = 0) {
    this.tipsData = tipsDataList[index]
    this.pageIndex = 0
    pref.tips[index] = true
    this.dialog.se = index === 8 ? se.allClear : se.dialogOpen
    this.dialog.open(wait)

    logEvent('dialog_tips_view', { index })
  }

  close() {
    this.dialog.close()
  }

  update() {
    this.dialog.update(() => this.updateContent())
  }

  updateContent() {
    const tips = this.tipsData
    if (!tips) return

    const page = tips.pages[this.pageIndex]
    const topHeight = page.image ? 32 : 4

    if (page.image) {
      const spr = Sprite.load(page.image)
      const width = this.dialog.content.width
      const topPos = layoutPos({ width, height: topHeight }, spr)

      if (page.image === 'tips/7c.png' && spr.width) {
        const sy = pref.theme * 24
        g.drawImage(sprBg, topPos.x, topPos.y, 24, 24, 0, sy, 24, 24)
      } else {
        g.drawImage(spr, topPos.x, topPos.y)
      }
    }

    this.lblBody.y = topHeight + 4
    this.lblBody.text = page.text
      .replace('%themeIndex%', String(pref.theme + 1))
      .replace('%themeName%', themeNames[pref.theme])
    this.lblBody.update()

    if (page.link) {
      this.btnLink.linkUrl = page.link.url
      this.btnLink.caption = page.link.caption
      this.btnLink.update()
    }

    this.btnPrev.disabled = this.pageIndex <= 0
    this.btnNext.caption =
      this.pageIndex + 1 < tips.pages.length ? sprNext : 'ＯＫ'
    this.btnPrev.update()
    this.btnNext.update()

    if (this.btnNext.isClick) {
      if (this.pageIndex + 1 < tips.pages.length) {
        this.pageIndex++
      } else {
        this.close()
      }
    }

    if (this.btnPrev.isClick) {
      this.pageIndex--
    }
  }
}
