import { Sprite } from '@local_modules/sprite.js'
import { g, screen, color, store, pref } from '@/r.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'
import { isAllClear } from '@/helper.js'

const sprBack = Sprite.load('icon/back.png')
const sprSwitch = Sprite.load('icon/switch.png')

export class Status {
  lblTitle = new Label(32, 2, screen.width - 64, 14, 'レベルせんたく', {
    align: 'center',
    color: color.white,
    strokeColor: color.dark,
  })
  btnBack = new Button(0, 0, 24, 16, sprBack)
  btnSwitch = new Button(screen.width - 24, 0, 24, 16, sprSwitch)

  update() {
    g.drawRect(0, 0, screen.width, 16, color.light)

    if (!isAllClear()) {
      g.drawRect(screen.width - 4, 0, 3, 16, color.white)
      g.drawRect(screen.width - 8, 0, 2, 16, color.white)
      g.drawRect(screen.width - 12, 0, 1, 16, color.white)
    }

    this.lblTitle.update()
    this.btnBack.update()

    if (isAllClear()) {
      this.btnSwitch.update()
    }

    if (this.btnBack.isClick) {
      store.nextScene = ['title']
    }

    if (this.btnSwitch.isClick) {
      pref.puzzleScore = !pref.puzzleScore
    }
  }
}
