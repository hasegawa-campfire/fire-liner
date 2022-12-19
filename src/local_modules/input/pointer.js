/**
 * @typedef {(pos: Pos, startPos: Pos) => void} ClickListener
 */

export class InputPointer {
  #el
  #resolution
  #realDown = false
  #realPos = { x: 0, y: 0 }
  #realDownPos = { x: 0, y: 0 }
  #realClickListeners = /** @type {ClickListener[]} */ ([])
  #realWheel = 0
  #down = false
  #downOld = false
  x = 0
  y = 0
  #wheel = 0
  #realClicked = false
  #clickProcessed = false
  disabled = false

  /**
   * @param {HTMLElement} el
   * @param {Size} resolution
   */
  constructor(el, resolution) {
    this.#el = el
    this.#resolution = resolution

    el.addEventListener('contextmenu', (e) => e.preventDefault())
    el.addEventListener('pointerdown', (e) => this.#onDown(e))
    window.addEventListener('click', (e) => this.#onClick(e))
    window.addEventListener('pointermove', (e) => this.#onMove(e))
    window.addEventListener('pointerup', () => this.#onUp())
    window.addEventListener('pointercancel', () => this.#onUp())
    window.addEventListener('blur', () => this.#onUp())
    window.addEventListener('wheel', (e) => this.#onWheel(e))
  }

  /**
   * @param {MouseEvent} e
   */
  #onDown(e) {
    this.#updateRealPos(e)
    this.#realDown = true
    this.#realDownPos.x = this.#realPos.x
    this.#realDownPos.y = this.#realPos.y
  }

  /**
   * @param {MouseEvent} e
   */
  #onClick(e) {
    for (const listener of this.#realClickListeners) {
      listener(this.#realPos, this.#realDownPos)
      this.#realClicked = true
    }
  }

  /**
   * @param {MouseEvent} e
   */
  #onMove(e) {
    this.#updateRealPos(e)
  }

  #onUp() {
    this.#realDown = false
  }

  /**
   * @param {WheelEvent} e
   */
  #onWheel(e) {
    this.#realWheel += e.deltaY
  }

  /**
   * @param {MouseEvent} e
   */
  #updateRealPos(e) {
    const r = this.#resolution
    const rect = this.#el.getBoundingClientRect()
    const zoom = Math.min(rect.width / r.width, rect.height / r.height)
    const px = e.clientX - rect.x - (rect.width - r.width * zoom) / 2
    const py = e.clientY - rect.y - (rect.height - r.height * zoom) / 2
    this.#realPos.x = Math.floor(px / zoom)
    this.#realPos.y = Math.floor(py / zoom)
  }

  /**
   * @param {ClickListener} listener
   */
  onClick(listener) {
    this.#realClickListeners.push(listener)
  }

  update() {
    this.#downOld = this.#down
    this.#down = this.#realDown

    if (this.#down) {
      this.x = this.#realPos.x
      this.y = this.#realPos.y
    }

    this.#realClickListeners.splice(0)

    this.#wheel = this.#realWheel
    this.#realWheel = 0

    this.#clickProcessed = this.#realClicked
    this.#realClicked = false
  }

  get isDown() {
    return !this.disabled && this.#down
  }

  get isDownChange() {
    return !this.disabled && this.#down && !this.#downOld
  }

  get isUpChange() {
    return !this.disabled && !this.#down && this.#downOld
  }

  get wheel() {
    return this.disabled ? 0 : this.#wheel
  }

  get isClickProcessed() {
    return this.#clickProcessed
  }
}
