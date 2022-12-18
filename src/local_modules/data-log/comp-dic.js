export class CompDic {
  #data = /** @type {number[]} */ ([])
  #dic = /** @type {number[][]} */ ([])
  #dicIndex = -1
  #dicCount = 0
  #tmp = /** @type {number[]} */ ([])

  reset() {
    this.#data = []
  }

  /**
   * @param {number} value
   */
  add(value) {
    const data = this.#data
    const tmp = this.#tmp

    tmp.push(value)
    const index = this.#findDic(tmp)
    const dicData = this.#getDic(this.#dicIndex)

    if (dicData) {
      if (tmp.every((n, i) => n === dicData[i])) {
        if (tmp.length === dicData.length) {
          this.#dicCount++
          tmp.splice(0)
        }
      }
    }

    if (index >= 0) {
      if (this.#dicCount > 1) {
        data.push(this.#dicCount, this.#dicIndex)
      }
      this.#dicIndex = index
      this.#dicCount = 1
    } else {
    }

    if (this.#dicIndex >= 0) {
      const dicData = this.#getDic(this.#dicIndex)

      if (tmp.every((n, i) => n === dicData[i])) {
        if (tmp.length === dicData.length) {
          this.#dicCount++
          tmp.splice(0)
        }
      } else {
        data.push(this.#dicCount, this.#dicIndex)
        this.#dicIndex = this.#findDic(tmp)
        this.#dicCount = 1

        this.#addDic(tmp)
      }
    } else {
      this.#dicIndex = this.#findDic(tmp)
    }
  }

  /**
   * @param {number[]} data
   */
  #findDic(data) {
    return this.#dic.findIndex((d) => data.every((n, i) => n === d[i]))
    // for (let i = 0; i < data.length; i++) {
    //   dic = dic?.[data[i]]
    // }
    // return dic?.index ?? -1
  }

  /**
   * @param {number[]} data
   */
  #addDic(data) {
    this.#dic.push(data)
    return this.#dic.length - 1
    // for (let i = 0; i < data.length; i++) {
    //   const n = data[i]
    //   dic = dic[n] ? dic[n] : (dic[n] = {})
    // }
    // dic.index = index
  }

  /**
   * @param {number} index
   */
  #getDic(index) {
    return this.#dic.at(index)
  }

  getData() {
    const data = this.#data
    const ref = this.#ref
    const tmp = this.#tmp

    if (tmp.length) {
      data.push(tmp.length, this.#refIndex)
      ref.push(...tmp.splice(0))
      if (this.#maxRef < ref.length) ref.splice(0, ref.length - this.#maxRef)
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
      if (this.#maxRef < ref.length) ref.splice(0, ref.length - this.#maxRef)

      return value
    }

    return NaN
  }
}
