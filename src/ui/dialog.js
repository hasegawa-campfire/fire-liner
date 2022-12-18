import { Sprite } from '@local_modules/sprite.js'
import { outSine, Tween } from '@local_modules/tween.js'
import { g, pointer, screen, se } from '@/r.js'

const spr = Sprite.load('dialog.png')

let globalOpened = false
let globalWaiting = false
let globalPointerDisabled = false
let globalLuminance = 0

export class Dialog {
  static updateBegin() {
    g.save()

    globalPointerDisabled = pointer.disabled
    globalLuminance = g.getAttr('luminance')[0]

    pointer.disabled = globalWaiting || globalOpened

    if (globalOpened) {
      g.setAttr('luminance', [globalLuminance - 1 / 3])
    }

    globalOpened = false
    globalWaiting = false
  }

  static updateEnd() {
    pointer.disabled = globalPointerDisabled
    g.restore()
  }

  x = 0
  y = 0
  width
  height
  content = { width: 0, height: 0 }
  nextWait = -1
  opened = false
  fadeIn = Tween.from(20).to(0, 6, outSine)
  /** @type {import('@local_modules/audio.js').Audio | null} */
  se = null

  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = Math.max(width, 16)
    this.height = Math.max(height, 16)
    this.resize()
  }

  /**
   * @param {number} wait
   */
  open(wait = 0) {
    if (!this.opened) {
      this.nextWait = Math.max(wait, 0)
      this.fadeIn.start()
    }
  }

  close() {
    this.nextWait = -1
  }

  resize() {
    this.x = (screen.width - this.width) / 2
    this.y = (screen.height - this.height) / 2
    this.content.width = this.width - 16
    this.content.height = this.height - 16
  }

  /**
   * @param {Function} [updateContent]
   */
  update(updateContent) {
    const prevOpened = this.opened
    this.opened = this.nextWait === 0
    globalOpened ||= this.opened
    globalWaiting ||= this.nextWait > 0
    if (this.nextWait >= 0) this.nextWait--

    if (!this.opened) return

    this.nextWait = 0
    if (!prevOpened && this.se) this.se.play()

    const pointerDisabled = pointer.disabled
    pointer.disabled = globalPointerDisabled

    g.save()
    g.identify()
    g.setAttr('luminance', [globalLuminance])

    const rLeft = this.x
    const rTop = this.y + Math.ceil(this.fadeIn.next().value) * 4
    const cWidth = this.width - 8
    const cHeight = this.height - 8
    const cLeft = rLeft + 4
    const cRight = cLeft + cWidth
    const cTop = rTop + 4
    const cBottom = cTop + cHeight

    g.drawImage(spr, rLeft, rTop, 4, 4, 0, 0, 4, 4)
    g.drawImage(spr, cRight, rTop, 4, 4, 8, 0, 4, 4)
    g.drawImage(spr, cRight, cBottom, 4, 4, 8, 8, 4, 4)
    g.drawImage(spr, rLeft, cBottom, 4, 4, 0, 8, 4, 4)

    g.drawImage(spr, cLeft, rTop, cWidth, 4, 4, 0, 4, 4)
    g.drawImage(spr, cRight, cTop, 4, cHeight, 8, 4, 4, 4)
    g.drawImage(spr, cLeft, cBottom, cWidth, 4, 4, 8, 4, 4)
    g.drawImage(spr, rLeft, cTop, 4, cHeight, 0, 4, 4, 4)

    g.drawImage(spr, cLeft, cTop, cWidth, cHeight, 4, 4, 4, 4)

    g.translate(cLeft + 4, cTop + 4)

    updateContent?.()

    g.restore()
    pointer.disabled = pointerDisabled
  }
}
