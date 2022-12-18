import { Sprite } from '@local_modules/sprite.js'
import { layoutPos, ordinal } from '@local_modules/util/index.js'
import { outSine, Tween } from '@local_modules/tween.js'
import { g, screen, color, store, defaultName, pref, bgm } from '@/r.js'
import { Button } from '@/ui/button.js'
import { ReplayDialog } from '@/dialogs/replay-dialog.js'
import { getUnlockLevel, setAudioMute } from '@/helper.js'
import { shareUrl, getReplayId, deleteReplayId } from '@/data/urls.js'
import { getMeRank, getMe, logEvent } from '@/data/server.js'
import { Logo } from './logo.js'
import { Item } from './item.js'

const sprTwitter = Sprite.load('icon/twitter.png')
const sprMuteOn = Sprite.load('icon/mute-on.png')
const sprMuteOff = Sprite.load('icon/mute-off.png')
const sprTips = Sprite.load('icon/tips.png')
const sprArrow = Sprite.load('title/arrow.png')

const y1 = screen.height - 8 - 24 - 8 - 48
const y2 = screen.height - 8 - 24

export class SceneTitle {
  bgm = bgm.menu
  btnPuzzle = new Button(0, y1, 64, 48, 'パズル\nもんだい')
  btnScore = new Button(64, y1, 80, 32, 'スコア\nトライアル', 1)
  btnRanking = new Button(64, y1 + 32, 80, 16, '', 2)

  btnTwitter = new Button(16, y2, 32, 24, sprTwitter)
  btnMute = new Button(56, y2, 32, 24, sprMuteOff)
  btnTips = new Button(96, y2, 32, 24, sprTips)

  logo = new Logo()
  dlgReplay = new ReplayDialog()
  twArrow = Tween.from(0).wait(20).to(screen.width, 20, outSine).start()
  items = /** @type {Item[]} */ ([])

  constructor() {
    if (getUnlockLevel() <= 0) {
      this.btnScore.type = 0
      this.btnScore.lock = true
      this.btnScore.lockText = 'パズルを１つ\nクリアしよう'
      this.btnScore.height = 48
      this.btnScore.resize()
    }

    this.btnTwitter.linkUrl = shareUrl

    for (let i = 1; i <= 3; i++) {
      const x = i * 50
      this.items.push(new Item({ x: 0 - x, y: 0 }))
      this.items.push(new Item({ x: screen.width + x, y: y1 - 10 }))
    }

    logEvent('title_view')
  }

  update() {
    this.btnMute.caption = pref.mute ? sprMuteOn : sprMuteOff

    const me = getMe()
    const rank = getMeRank()

    this.btnRanking.caption =
      me && rank
        ? `${ordinal(rank)} ${me.displayName || defaultName}`
        : 'ランキング'

    const arrowX = Math.floor(this.twArrow.next().value / 8) * 8 - 1

    g.drawRect(0, 0, screen.width, screen.height, color.white)
    g.save()
    for (let i = 0; i < 2; i++) {
      g.drawRect(0, 4, arrowX, 2, color.light)
      g.drawImage(sprArrow, arrowX - sprArrow.width, 1)
      g.translate(screen.width, y1)
      g.rotate(180)
    }
    g.restore()

    for (const item of this.items) item.update()

    g.save()
    g.translatePos(layoutPos({ width: screen.width, height: y1 }, this.logo))
    this.logo.update()
    g.restore()

    this.btnPuzzle.update()
    this.btnScore.update()
    if (getUnlockLevel() > 0) this.btnRanking.update()
    this.btnTwitter.update()
    this.btnMute.update()
    this.btnTips.update()
    this.dlgReplay.update()

    if (this.btnMute.isClick) {
      setAudioMute(!pref.mute)
    }

    if (this.btnPuzzle.isClick) {
      store.nextScene = ['levels']
    }

    if (this.btnScore.isClick) {
      store.nextScene = ['play']
    }

    if (this.btnRanking.isClick) {
      store.nextScene = ['ranking']
    }

    if (this.btnTips.isClick) {
      store.nextScene = ['tips']
    }

    if (!this.dlgReplay.dialog.opened && getReplayId()) {
      this.dlgReplay.open(getReplayId())
      deleteReplayId()
    }
  }
}
