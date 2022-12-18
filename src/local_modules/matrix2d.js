export class Matrix2d {
  static identity = new Matrix2d(1, 0, 0, 1, 0, 0)
  /** @type {Matrix2d | undefined} */
  #invertCache
  #a
  #b
  #c
  #d
  #e
  #f

  /**
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} e
   * @param {number} f
   */
  constructor(a, b, c, d, e, f) {
    this.#a = a
    this.#b = b
    this.#c = c
    this.#d = d
    this.#e = e
    this.#f = f
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  translate(x, y) {
    return new Matrix2d(
      this.#a,
      this.#b,
      this.#c,
      this.#d,
      this.#e + this.#a * x + this.#c * y,
      this.#f + this.#b * x + this.#d * y
    )
  }

  /**
   * @param {number} sx
   * @param {number} [sy]
   */
  scale(sx, sy = sx) {
    return new Matrix2d(
      this.#a * sx,
      this.#b * sx,
      this.#c * sy,
      this.#d * sy,
      this.#e,
      this.#f
    )
  }

  /**
   * @param {number} deg
   */
  rotate(deg) {
    const rad = deg * (Math.PI / 180)
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)

    return new Matrix2d(
      this.#a * cos + this.#c * sin,
      this.#b * cos + this.#d * sin,
      this.#a * -sin + this.#c * cos,
      this.#b * -sin + this.#d * cos,
      this.#e,
      this.#f
    )
  }

  invert() {
    let mat = this.#invertCache
    if (!mat) {
      const n = this.#a * this.#d - this.#b * this.#c

      mat = this.#invertCache = new Matrix2d(
        this.#d / n,
        -this.#b / n,
        -this.#c / n,
        this.#a / n,
        (this.#c * this.#f - this.#d * this.#e) / n,
        -(this.#a * this.#f - this.#b * this.#e) / n
      )
    }

    return mat
  }

  /**
   * @param {Pos} pos
   */
  transformPos(pos) {
    return {
      x: this.#e + this.#a * pos.x + this.#c * pos.y,
      y: this.#f + this.#b * pos.x + this.#d * pos.y,
    }
  }
}
