import { Sprite } from '@local_modules/sprite.js'
import { g, screen, color, store } from '@/r.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'

const sprBack = Sprite.load('icon/back.png')

export class Status {
  lblTitle = new Label(32, 2, screen.width - 64, 14, 'あそびかた', {
    align: 'center',
    color: color.white,
    strokeColor: color.dark,
  })
  btnBack = new Button(0, 0, 24, 16, sprBack)

  update() {
    g.drawRect(0, 0, screen.width, 16, color.light)
    g.drawRect(screen.width - 4, 0, 3, 16, color.white)
    g.drawRect(screen.width - 8, 0, 2, 16, color.white)
    g.drawRect(screen.width - 12, 0, 1, 16, color.white)

    this.lblTitle.update()
    this.btnBack.update()

    if (this.btnBack.isClick) {
      store.nextScene = ['title']
    }
  }
}
