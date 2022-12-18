import { pref, tileSize as size } from '@/r.js'
import { StageBg } from '@/scenes/play/stage-bg.js'
import { themeCount } from '@/data/theme.js'
import { LogoTile } from './logo-tile.js'

const tiles = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
]

export class Logo {
  width = size * 5
  height = size * 2
  tiles = [
    new LogoTile(0, 0, 'f'),
    new LogoTile(1, 0, 'i'),
    new LogoTile(2, 0, 'r'),
    new LogoTile(3, 0, 'e'),
    new LogoTile(0, 1, 'l'),
    new LogoTile(1, 1, 'i'),
    new LogoTile(2, 1, 'n'),
    new LogoTile(3, 1, 'e'),
    new LogoTile(4, 1, 'r'),
  ]
  bg = new StageBg(this, tiles)

  update() {
    this.bg.update()

    this.tiles.forEach((tile, i) => {
      tile.update()
      if (tile.button.isClick) {
        let theme = pref.theme + (i < 4 ? 1 : -1)
        if (theme < 0) theme = themeCount - 1
        if (theme >= themeCount) theme = 0
        pref.theme = theme
      }
    })
  }
}
