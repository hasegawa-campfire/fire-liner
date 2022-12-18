/** @typedef {(p:number)=>number} Easing */

/**
 * @template T
 * @param {T} value
 * @return {T}
 */
function clone(value) {
  if (typeof value === 'object' && value !== null) {
    return /** @type {T} */ (
      Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clone(v)]))
    )
  }
  return value
}

/**
 * @param {any} from
 * @param {any} to
 * @param {number} rate
 * @return {any}
 */
function map(from, to, rate) {
  if (typeof from === 'number' && typeof to === 'number') {
    return (to - from) * rate + from
  }
  if (typeof from === 'boolean' && typeof to === 'boolean') {
    return rate > 0 ? to : from
  }
  if (typeof from === 'object' && typeof to === 'object') {
    return Object.fromEntries(
      Object.keys(from).map((key) => [key, map(from[key], to[key], rate)])
    )
  }
  return clone(to === undefined ? from : to)
}

/**
 * @param {Easing} callback
 */
export function ease(callback) {
  /**
   * @param {number} p
   */
  return (p) => {
    if (p <= 0) return 0
    if (1 <= p) return 1
    return callback(p)
  }
}

export const linear = ease((p) => p)
export const inSine = ease((p) => 1 - Math.cos(p * (Math.PI / 2)))
export const outSine = ease((p) => Math.sin(p * (Math.PI / 2)))
export const inOutSine = ease((p) => {
  return p < 0.5 ? inSine(p * 2) * 0.5 : 0.5 + outSine((p - 0.5) * 2) * 0.5
})

/**
 * @param {number} n
 */
export function steps(n) {
  return ease((p) => Math.min(Math.floor(p * n) / (n - 1), 1))
}

export class TweenManager {
  paused = false
  updateTime = 1

  /**
   * @template T
   * @param {T} value
   */
  from(value) {
    return new Tween(value, this)
  }

  /**
   * @param {number} time
   */
  wait(time) {
    return new Tween(/** @type {never} */ (0), this).wait(time)
  }
}

/**
 * @template [T=never]
 */
export class Tween {
  #manager
  #time = 0
  #steps = /** @type {(()=>Function)[]} */ ([])
  #stepIndex = 0
  #stepFunc = /** @type {Function|null} */ (null)
  #started = false
  #startValue
  #endValue
  #prevDone = false
  value

  /**
   * @template T
   * @param {T} value
   */
  static from(value) {
    return new Tween(value)
  }

  /**
   * @param {number} time
   */
  static wait(time) {
    return new Tween(/** @type {never} */ (0)).wait(time)
  }

  /**
   * @param {T} [value]
   * @param {TweenManager} [manager]
   */
  constructor(value, manager) {
    this.#manager = manager
    const v = /** @type {T} */ (value ?? 0)
    this.#startValue = this.#endValue = clone(v)
    this.value = clone(v)
  }

  reset() {
    this.#started = false
    this.#time = 0
    this.#stepIndex = 0
    this.#stepFunc = null
    this.value = clone(this.#startValue)
  }

  start() {
    this.#started = true
    this.#time = 0
    this.#stepIndex = 0
    this.#stepFunc = null
    this.value = clone(this.#startValue)
    return this
  }

  end() {
    this.#started = true
    this.#stepIndex = this.#steps.length
    this.#stepFunc = null
    this.value = clone(this.#endValue)
  }

  next() {
    this.#prevDone = this.done

    if (!this.#manager?.paused && this.running) {
      this.#time += this.#manager?.updateTime ?? 1

      do {
        if (!this.#stepFunc) {
          this.#stepFunc = this.#steps[this.#stepIndex++]()
        }

        if (this.#stepFunc()) {
          break
        } else {
          this.#stepFunc = null
        }
      } while (this.running)
    }

    return this
  }

  /**
   * @param {T} value
   * @param {number} time
   * @param {Easing} easing
   */
  to(value, time = 0, easing = linear) {
    time = Math.max(time, 0)
    const toValue = (this.#endValue = clone(value))

    this.#steps.push(() => {
      const fromValue = clone(this.value)

      return () => {
        if (this.#time <= time) {
          this.value = map(fromValue, toValue, easing(this.#time / time))
          return true
        } else {
          this.#time -= time
          this.value = clone(toValue)
        }
      }
    })

    return this
  }

  /**
   * @param {number} time
   */
  wait(time) {
    time = Math.max(time, 0)

    this.#steps.push(() => () => {
      if (this.#time <= time) {
        return true
      } else {
        this.#time -= time
      }
    })

    return this
  }

  loop() {
    this.#steps.push(() => () => {
      this.#stepIndex = 0
      this.value = clone(this.#startValue)
    })
    return this
  }

  get done() {
    return !this.#stepFunc && this.#stepIndex >= this.#steps.length
  }

  get onDone() {
    return !this.#prevDone && this.done
  }

  get started() {
    return this.#started
  }

  get running() {
    return this.started && !this.done
  }
}
