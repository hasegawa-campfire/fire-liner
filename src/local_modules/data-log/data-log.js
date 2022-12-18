import { code2nums, nums2code } from './code.js'
import { CompRLE2 } from './comp-rle2.js'

/**
 * @typedef Comp
 * @prop {() => void} reset
 * @prop {(value: number) => void} add
 * @prop {()=> number[]} getData
 * @prop {(data: number[]) => void} setData
 * @prop {() => number} read
 */

export class DataLog {
  /** @type {Comp} */
  #comp
  #mode = ''
  #pause = false

  /**
   * @param {number} unitSize
   */
  constructor(unitSize) {
    this.#comp = new CompRLE2(unitSize)
  }

  startRec() {
    this.#mode = 'rec'
    this.#comp.reset()
  }

  /**
   * @param {string} code
   */
  startRead(code) {
    this.#mode = 'read'
    this.#comp.reset()
    this.#comp.setData(code2nums(code))
  }

  end() {
    this.#mode = ''
  }

  getCode() {
    return nums2code(this.#comp.getData())
  }

  /**
   * @param {boolean} [state]
   */
  pause(state) {
    this.#pause = state ?? !this.#pause
  }

  /**
   * @param {number} value
   */
  next(value) {
    value = Math.floor(value)

    if (!this.#pause) {
      if (this.#mode === 'rec') {
        this.#comp.add(value)
      } else if (this.#mode === 'read') {
        value = this.#comp.read()
      }
    }

    return value
  }
}
