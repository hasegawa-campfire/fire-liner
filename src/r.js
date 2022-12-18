import { Screen } from '@local_modules/screen.js'
import { Graphics } from '@local_modules/graphics/index.js'
import { BmpFont } from '@local_modules/font/index.js'
import { InputPointer } from '@local_modules/input/index.js'
import { createPref } from '@local_modules/pref.js'
import { Random } from '@local_modules/random.js'
import { DataLog } from '@local_modules/data-log/index.js'
import { TweenManager } from '@local_modules/tween.js'
import { Audio } from '@local_modules/audio.js'
import { Loop } from '@local_modules/loop.js'

export const tileSize = 24
export const maxLevel = 15
export const defaultName = 'NO NAME'

export const color = {
  black: '#000',
  dark: '#555',
  light: '#aaa',
  white: '#fff',
}

export const screen = new Screen({
  el: '#screen',
  width: 144,
  height: 160,
})

export const g = new Graphics({
  canvas: screen.canvas,
  texSize: 1024,
  texLayers: 10,
  clearColor: '#fff',
})

g.font = BmpFont.load('misaki_gothic.png')

export const mainLoop = new Loop({ fps: 60 })
export const pointer = new InputPointer(screen.canvas, screen)
export const random = new Random()
export const dataLog = new DataLog(2)
export const tween = new TweenManager()

export const store = {
  /** @type {[String, ...unknown[]] | null} */
  nextScene: null,
  puzzle: false,
  level: 0,
  replay: false,
  time: 0,
  timeLimit: 0,
  score: 0,
  newRecord: false,
  rate: 0,
  routeCount: 0,

  get timeIn() {
    return 0 <= this.time && this.time < this.timeLimit
  },

  get timeOver() {
    return this.time >= this.timeLimit
  },
}

export const pref = createPref('fire-liner', {
  levels: /** @type {{star: number, score: number}[]} */ ([]),
  tips: /** @type {boolean[]} */ ([]),
  theme: 0,
  puzzleScore: /** @type {boolean | null} */ (null),
  mute: false,
})

export const bgm = {
  menu: Audio.load('audio/GB-Fighting-A02-2(Story-Loop115).mp3', {
    loop: true,
  }),
  puzzle1: Audio.load('audio/GB-General-B02-2(Stage1-Loop100).mp3', {
    loop: true,
    when: 0.8,
  }),
  puzzle2: Audio.load('audio/GB-General-B04-2(Stage3-Loop150).mp3', {
    loop: true,
    when: 0.8,
  }),
  scoreTrial: Audio.load('audio/GB-Racing-A03-2(Stage1-Loop180).mp3', {
    loop: true,
    when: 0.8,
  }),
  clear: Audio.load('audio/GB-General-B07-1(Clear1).mp3'),
  finish: Audio.load('audio/GB-Racing-A09-2(Clear2).mp3'),
}

export const se = {
  buttonDown: Audio.load('audio/GB-General03-04(Noise)-a.mp3', {
    minTime: 0,
    volume: 0.4,
  }),
  buttonUp: Audio.load('audio/GB-General03-04(Noise)-b.mp3', {
    minTime: 0,
    volume: 0.2,
  }),
  lock: Audio.load('audio/GB-RPG01-5(Enter).mp3', {
    volume: 0.67,
  }),
  dialogOpen: Audio.load('audio/GB-General01-08(Pitch).mp3', {
    minTime: 0,
    volume: 0.55,
  }),
  clear: Audio.load('audio/GB-General01-03(Pitch).mp3', {
    volume: 0.33,
    when: 0.5,
  }),
  allClear: Audio.load('audio/GB-RPG-B14-4(Victory-Short).mp3', {
    volume: 0.9,
  }),
  finish: Audio.load('audio/GB-Shooter01-02(Shoot).mp3'),
  move: Audio.load('audio/GB-Action01-03(Throw).mp3', {
    volume: 0.5,
  }),
  notMove: Audio.load('audio/GB-Action01-04(Damage).mp3', {
    volume: 0.6,
  }),
  reverse: Audio.load('audio/GB-Fighting01-05(Attack).mp3', {
    volume: 0.3,
  }),
  switch: Audio.load('audio/GB-General03-04(Noise).mp3', {
    volume: 0.5,
  }),
  spark: Audio.load('audio/GB-General02-02(Pitch).mp3', {
    volume: 0.7,
  }),
  strokeAdd: Audio.load('audio/GB-General03-04(Noise)-c.mp3', {
    volume: 0.33,
    minTime: 0.02,
  }),
}
