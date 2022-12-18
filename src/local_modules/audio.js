import { loadAsset } from '@local_modules/asset/index.js'
import { getActiveState, onActiveChange } from '@local_modules/active-state.js'

/** @type {typeof window.AudioContext} */
const AudioContext =
  window.AudioContext ||
  // @ts-ignore
  window.webkitAudioContext

const userActionEvents = [
  'touchstart',
  'touchend',
  'touchcancel',
  'mousedown',
  'mouseup',
  'contextmenu',
  'click',
  'pointerdown',
  'pointerup',
  'pointercancel',
]

/**
 * @param {AudioContext} ctx
 * @param {boolean} state
 */
function applyAudioState(ctx, state) {
  if (state) {
    return ctx.resume()
  } else {
    return ctx.suspend()
  }
}

const ctxPromise = new Promise((resolve) => {
  let ctx = /** @type {AudioContext|null}*/ (null)

  const setup = async () => {
    ctx = ctx || new AudioContext()
    await applyAudioState(ctx, getActiveState())
    resolve(ctx)
  }

  userActionEvents.map((type) => {
    document.addEventListener(type, setup, { once: true })
  })
})

export const audioReady = ctxPromise.then((ctx) => {
  let promise = Promise.resolve()

  onActiveChange((state) => {
    promise = promise.then(() => applyAudioState(ctx, state))
  })
})

/**
 * @typedef AudioParam
 * @prop {number} [volume]
 * @prop {number} [minTime]
 * @prop {number} [when]
 * @prop {boolean|{start?:number,end?:number}} [loop]
 */

export class Audio {
  #baseVolume
  #volume = 1
  #minTime
  #when
  #loop
  #mute = false
  #startTime = Number.MIN_SAFE_INTEGER
  #audioBufferPromise
  #gainNodePromise
  /** @type {AudioBufferSourceNode|null} */
  #audioSource = null
  #playing = false

  /**
   * @param {ArrayBuffer | Promise<ArrayBuffer>} arrayBuffer
   * @param {AudioParam} [param]
   */
  constructor(arrayBuffer, param) {
    param = param ?? {}
    this.#baseVolume = param.volume ?? 1
    this.#minTime = param.minTime ?? 0
    this.#when = param.when ?? 0
    this.#loop = param.loop ?? false

    this.#audioBufferPromise = ctxPromise.then(async (ctx) => {
      const audioBuffer = await arrayBuffer
      return ctx.decodeAudioData(audioBuffer)
    })

    this.#gainNodePromise = ctxPromise.then(async (ctx) => {
      const gainNode = ctx.createGain()
      gainNode.gain.value = this.#mute ? 0 : this.#volume * this.#baseVolume
      gainNode.connect(ctx.destination)
      return gainNode
    })
  }

  get playing() {
    return this.#playing
  }

  /**
   * @param {number} [when]
   */
  async play(when) {
    this.#playing = true

    const ctx = await ctxPromise
    const audioBuffer = await this.#audioBufferPromise
    const gainNode = await this.#gainNodePromise

    if (!this.#playing) return

    const currentTime = ctx.currentTime - this.#startTime

    if (currentTime < this.#minTime) return

    const audioSource = ctx.createBufferSource()

    this.#audioSource?.stop()
    this.#audioSource = audioSource
    this.#startTime = ctx.currentTime
    this.setVolume(1)

    if (typeof this.#loop === 'boolean') {
      audioSource.loop = this.#loop
    } else {
      audioSource.loop = true
      audioSource.loopStart = this.#loop.start ?? 0
      audioSource.loopEnd = this.#loop.end ?? 0
    }

    audioSource.buffer = audioBuffer
    audioSource.connect(gainNode)
    audioSource.start(ctx.currentTime + (when ?? this.#when))
  }

  stop() {
    this.#playing = false
    this.#audioSource?.stop()
    this.#audioSource = null
  }

  /**
   * @param {boolean} value
   */
  setMute(value) {
    this.#mute = value
    this.#updateVolume()
  }

  /**
   * @param {number} value
   * @param {number} time
   */
  setVolume(value, time = 0) {
    this.#volume = value
    this.#updateVolume(time)
  }

  /**
   * @param {number} time
   */
  async #updateVolume(time = 0) {
    const ctx = await ctxPromise
    const gainNode = await this.#gainNodePromise
    const value = this.#mute ? 0 : this.#volume * this.#baseVolume
    gainNode.gain.linearRampToValueAtTime(value, ctx.currentTime + time)
  }

  /**
   * @param {string} path
   * @param {AudioParam} [param]
   */
  static load(path, param) {
    return new Audio(loadAsset(path), param)
  }
}
