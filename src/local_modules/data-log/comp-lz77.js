const maxRef = 16
const maxTmp = 15

export class CompLZ77 {
  #data = /** @type {number[]} */ ([])
  #ref = /** @type {number[]} */ ([])
  #tmp = /** @type {number[]} */ ([])
  #refIndex = 0
  #dataIndex = 0
  #dataCount = 0

  reset() {
    this.#data = []
    this.#ref = []
    this.#tmp = []
    this.#refIndex = 0
    this.#dataIndex = 0
    this.#dataCount = 0
  }

  /**
   * @param {number} value
   */
  add(value) {
    const data = this.#data
    const ref = this.#ref
    const tmp = this.#tmp

    tmp.push(value)

    const max = ref.length - tmp.length
    const refIndex = ref.findIndex((_, i) => {
      return i <= max && tmp.every((n, j) => ref[i + j] === n)
    })

    if (refIndex < 0 || maxTmp <= tmp.length) {
      if (tmp.length <= 1) data.push(0, value)
      else data.push(tmp.length - 1, this.#refIndex, value)

      ref.push(...tmp.splice(0))
      if (maxRef < ref.length) ref.splice(0, ref.length - maxRef)
    } else {
      this.#refIndex = refIndex
    }
  }

  getData() {
    const data = this.#data
    const ref = this.#ref
    const tmp = this.#tmp

    if (tmp.length) {
      data.push(tmp.length, this.#refIndex)
      ref.push(...tmp.splice(0))
      if (maxRef < ref.length) ref.splice(0, ref.length - maxRef)
    }

    return data.slice()
  }

  /**
   * @param {number[]} data
   */
  setData(data) {
    this.#data = data.slice()
  }

  read() {
    const data = this.#data
    const dataIndex = this.#dataIndex
    const dataCount = this.#dataCount
    const ref = this.#ref
    const refSize = data[dataIndex]
    const refIndex = data[dataIndex + 1]

    if (dataCount < refSize) {
      this.#dataCount++
      return ref[refIndex + dataCount]
    } else if (dataIndex + 2 < data.length) {
      this.#dataIndex += refSize ? 3 : 2
      this.#dataCount = 0
      const value = data[this.#dataIndex - 1]

      if (refSize) ref.push(...ref.slice(refIndex, refIndex + refSize))
      ref.push(value)
      if (maxRef < ref.length) ref.splice(0, ref.length - maxRef)

      return value
    }

    return NaN
  }
}
