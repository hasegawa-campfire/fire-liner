/**
 * @template {object} T
 */
export class State {
  #stack = /** @type {T[]} */ ([])
  data

  /**
   * @param {T} data
   */
  constructor(data) {
    this.data = data
  }

  save() {
    this.#stack.push(this.data)
    this.data = Object.create(this.data)
  }

  restore() {
    const data = this.#stack.pop()
    if (data) this.data = data
  }
}
