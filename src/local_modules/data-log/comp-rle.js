export class CompRLE {
  #data = /** @type {number[]} */ ([])
  #readIndex = 0
  #readCount = 0

  reset() {
    this.#data = []
    this.#readIndex = 0
    this.#readCount = 0
  }

  /**
   * @param {number} value
   */
  add(value) {
    const data = this.#data

    if (data[data.length - 2] === value) {
      data[data.length - 1]++
    } else {
      data.push(value, 1)
    }
  }

  getData() {
    return this.#data.slice()
  }

  /**
   * @param {number[]} data
   */
  setData(data) {
    this.#data = data.slice()
  }

  read() {
    const data = this.#data
    const value = data[this.#readIndex] ?? NaN

    if (++this.#readCount >= data[this.#readIndex + 1]) {
      this.#readIndex += 2
      this.#readCount = 0
    }

    return value
  }
}
