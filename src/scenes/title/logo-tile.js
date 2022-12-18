import { Sprite } from '@local_modules/sprite.js'
import { steps, Tween } from '@local_modules/tween.js'
import { Button } from '@/ui/button.js'
import { g, se, tileSize as size } from '@/r.js'

const sprTileAnime = Sprite.load('play/stage-tile-anime.png')

/** @type {Record<string, Sprite>} */
const sprLogo = {
  f: Sprite.load('title/logo-f.png'),
  i: Sprite.load('title/logo-i.png'),
  r: Sprite.load('title/logo-r.png'),
  e: Sprite.load('title/logo-e.png'),
  l: Sprite.load('title/logo-l.png'),
  n: Sprite.load('title/logo-n.png'),
}

export class LogoTile {
  button
  logo
  dir
  twInit
  twTile = Tween.from(0).to(1, 8, steps(2)).start()

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} logo
   */
  constructor(x, y, logo) {
    this.logo = logo
    this.dir = !!y
    this.twInit = Tween.wait((this.dir ? 4 - x : x) * 4 + 40).start()
    this.button = new Button(size * x, size * y, size, size)
  }

  update() {
    if (this.twInit.next().running) return
    if (this.twInit.onDone) se.reverse.play()

    if (this.twTile.next().running) {
      g.save()
      g.translate(this.button.x + size / 2, this.button.y + size / 2)
      g.rotate(this.dir ? 90 : -90)
      const sx = 1 - this.twTile.value
      g.drawImage(
        sprTileAnime,
        -size / 2,
        -size / 2,
        size,
        size,
        sx * size,
        0,
        size,
        size
      )
      g.restore()
      return
    }

    this.button.caption = sprLogo[this.logo]
    this.button.update()
  }
}
