import { getActiveState, onActiveChange } from '@local_modules/active-state.js'

export class Loop {
  #fps
  proc = /** @type {Function|null} */ (null)
  #prevTime = 0
  #updateTimer = 0

  /**
   * @param {object} config
   * @param {number} config.fps
   */
  constructor(config) {
    this.#fps = config.fps
    this.#activate(getActiveState())
    onActiveChange((state) => this.#activate(state))
  }

  get fps() {
    return this.#fps
  }

  get frameTime() {
    return 1000 / this.#fps
  }

  /**
   * @param {boolean} state
   */
  #activate(state) {
    window.cancelAnimationFrame(this.#updateTimer)
    if (state) {
      this.#updateTimer = window.requestAnimationFrame(this.#update)
    }
  }

  #update = () => {
    this.#updateTimer = window.requestAnimationFrame(this.#update)

    const time = Date.now()
    if (time - this.#prevTime < this.frameTime * 0.8) return
    this.#prevTime = time

    this.proc?.()
  }
}
