import { Sprite } from '@local_modules/sprite.js'
import { g, screen, color, store, defaultName } from '@/r.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'
import { getMe, updateMeName } from '@/data/server.js'

const sprBack = Sprite.load('icon/back.png')
const sprSwitch = Sprite.load('icon/switch.png')
const sprUser = Sprite.load('icon/user.png')

export class Status {
  lblTitle = new Label(32, 2, screen.width - 88, 14, '', {
    align: 'center',
    color: color.white,
    strokeColor: color.dark,
  })
  btnBack = new Button(0, 0, 24, 16, sprBack)
  btnSwitch = new Button(screen.width - 48, 0, 24, 16, sprSwitch)
  btnUser = new Button(screen.width - 24, 0, 24, 16, sprUser)
  isTop = true

  update() {
    const me = getMe()

    this.btnUser.disabled = !me
    this.lblTitle.text = this.isTop
      ? 'トップ１００'
      : me?.displayName || defaultName

    g.drawRect(0, 0, screen.width, 16, color.light)

    this.lblTitle.update()
    this.btnBack.update()
    this.btnUser.update()
    this.btnSwitch.update()

    if (this.btnUser.isClick) {
      const oldName = me?.displayName || ''
      const name = window.prompt('ユーザー名を入力してください', oldName)

      if (name !== null && name !== oldName) {
        updateMeName(name.slice(0, 20))
      }
    }

    if (this.btnSwitch.isClick) {
      this.isTop = !this.isTop
    }

    if (this.btnBack.isClick) {
      store.nextScene = ['title']
    }
  }
}
