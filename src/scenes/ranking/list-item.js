import { Sprite } from '@local_modules/sprite.js'
import { delimit, ordinal } from '@local_modules/util/index.js'
import { g, screen, color, defaultName } from '@/r.js'
import { Button } from '@/ui/button.js'
import { Label } from '@/ui/label.js'
import { getMe } from '@/data/server.js'

const sprPlay = Sprite.load('icon/play-thin.png')

export const height = 16

const buttonWidth = 16
const labelWidth = screen.width - buttonWidth - 4

export class ListItem {
  lblDetail = new Label(0, 0, labelWidth, height, '', { align: 'left' })
  btnPlay = new Button(labelWidth + 4, 0, buttonWidth, height, sprPlay)

  rank
  data
  isClick = false

  /**
   * @param {number} rank
   * @param {EntryData | ReplayData} data
   */
  constructor(rank, data) {
    this.rank = rank
    this.data = data

    const strRank = `${ordinal(rank + 1)}`.padStart(7, ' ')
    const strScore = delimit(data.score).padStart(7, ' ')
    const name = 'name' in data ? data.name || defaultName : ''

    this.lblDetail.text = `${strRank} ${strScore} ${name}`
  }

  update() {
    const me = getMe()

    g.save()
    g.translate(0, this.rank * height)

    this.lblDetail.update()

    if (this.data.uid) {
      this.btnPlay.update()
      this.isClick = this.btnPlay.isClick
    }

    if ('name' in this.data && me?.uid === this.data.uid) {
      g.drawRect(4, 12, screen.width - 22, 1, color.dark)
    } else {
      for (let x = 4; x < screen.width - 16; x += 4) {
        g.drawRect(x, 12, 2, 1, color.light)
      }
    }

    g.restore()
  }
}
