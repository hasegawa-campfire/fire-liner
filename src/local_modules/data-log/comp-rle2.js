export class CompRLE2 {
  #data = /** @type {number[]} */ ([])
  #dics = /** @type {number[]} */ ([])
  #tmp = /** @type {number[]} */ ([])
  #unitSize
  #readIndex = 0
  #readCount = 0
  #readTick = 0

  constructor(unitSize = 2) {
    this.#unitSize = unitSize
  }

  reset() {
    this.#data = []
    this.#dics = []
    this.#tmp = []
    this.#readIndex = 0
    this.#readCount = 0
    this.#readTick = 0
  }

  /**
   * @param {number} value
   */
  add(value) {
    const data = this.#data
    const dics = this.#dics
    const tmp = this.#tmp
    const unitSize = this.#unitSize

    tmp.push(value)
    if (tmp.length < this.#unitSize) return

    let dic = 0
    for (; dic * unitSize < dics.length; dic++) {
      if (tmp.every((n, i) => n === dics[dic * unitSize + i])) break
    }
    if (dic * unitSize >= dics.length) dics.push(...tmp)
    tmp.splice(0)

    if (data[data.length - 2] === dic) {
      data[data.length - 1]++
    } else {
      data.push(dic, 1)
    }
  }

  getData() {
    while (this.#tmp.length) this.add(0)
    return [this.#dics.length / this.#unitSize, ...this.#dics, ...this.#data]
  }

  /**
   * @param {number[]} data
   */
  setData(data) {
    const dicSize = data[0] * this.#unitSize
    this.#dics = data.slice(1, 1 + dicSize)
    this.#data = data.slice(1 + dicSize)
  }

  read() {
    const data = this.#data
    const dics = this.#dics
    const unitSize = this.#unitSize
    const value = dics[data[this.#readIndex] * unitSize + this.#readTick]

    if (++this.#readTick >= unitSize) {
      this.#readTick = 0
      if (++this.#readCount >= data[this.#readIndex + 1]) {
        this.#readIndex += 2
        this.#readCount = 0
      }
    }

    return value
  }
}
