import { instOf } from '@local_modules/util/index.js'

export class Screen {
  canvas
  width
  height
  #resizeObserver
  #resizeRequestId = 0

  /**
   * @param {object} config
   * @param {string | HTMLCanvasElement} [config.el]
   * @param {number} config.width
   * @param {number} config.height
   */
  constructor(config) {
    const canvas =
      typeof config.el === 'string'
        ? document.querySelector(config.el)
        : config.el == null
        ? document.createElement('canvas')
        : config.el

    this.canvas = instOf(canvas, HTMLCanvasElement)
    this.canvas.width = this.width = config.width
    this.canvas.height = this.height = config.height
    this.canvas.style.objectFit = 'contain'
    this.canvas.style.touchAction = 'none'

    this.#resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(this.#resizeRequestId)
      this.#resizeRequestId = requestAnimationFrame(() => this.#resize())
    })
    this.#resizeObserver.observe(this.canvas)
  }

  #resize() {
    const ratio = this.width / this.height
    const cw = this.canvas.clientWidth
    const ch = this.canvas.clientHeight
    const dpWidth = (ratio < cw / ch ? ch * ratio : cw) * devicePixelRatio
    const zoom = Math.ceil(dpWidth / this.width)
    this.canvas.width = this.width * zoom
    this.canvas.height = this.height * zoom
  }
}
