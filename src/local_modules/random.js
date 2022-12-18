export class Random {
  static genSeed() {
    return (Math.random() * 0xffffffff + 1) | 0
  }

  static getTodaySeed() {
    return Date.parse(new Date().toLocaleDateString('fr-CA') + 'T00:00Z') | 0
  }

  seed = Random.genSeed()

  next() {
    this.seed ^= this.seed << 13
    this.seed ^= this.seed >>> 17
    this.seed ^= this.seed << 5
    return Uint32Array.of(this.seed)[0] / 0x100000000
  }

  /**
   * @param {number} k
   */
  nextInt(k) {
    return (this.next() * k) | 0
  }
}
