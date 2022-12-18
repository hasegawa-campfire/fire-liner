import { Random } from '@local_modules/random.js'
import {
  bgm,
  dataLog,
  g,
  mainLoop,
  pref,
  random,
  se,
  store,
  tween,
} from '@/r.js'
import { TipsDialog } from '@/dialogs/tips-dialog.js'
import { PauseDialog } from '@/dialogs/pause-dialog.js'
import { ResultPzlDialog } from '@/dialogs/result-pzl-dialog.js'
import { ResultStDialog } from '@/dialogs/result-st-dialog.js'
import { logEvent, updateEntry } from '@/data/server.js'
import {
  getLevelScore,
  getLevelStar,
  isScorable,
  stopAudioBgm,
} from '@/helper.js'
import { Stage } from './stage.js'
import { Status } from './status.js'

export class ScenePlay {
  stage
  status
  dlgTips = new TipsDialog()
  dlgPause = new PauseDialog()
  dlgResultPzl = new ResultPzlDialog()
  dlgResultSt = new ResultStDialog()
  twEndPzl = tween.from(0).wait(34).to(3).to(0, 20).wait(44)
  twEndSt = tween.wait(100)
  twBgmFadeOut = tween.wait(73)

  replayId = /** @type {string | Promise<string>} */ ('')

  /**
   * @param {object} config
   * @param {boolean} [config.puzzle]
   * @param {number} [config.level]
   * @param {string} [config.replayId]
   * @param {string} [config.log]
   */
  constructor(config = {}) {
    store.replay = !!config.log
    store.puzzle = config.puzzle ?? false
    store.level = config.level ?? 0
    store.time = -mainLoop.fps
    store.timeLimit = store.puzzle ? Infinity : 60 * mainLoop.fps
    store.score = 0
    store.routeCount = 0
    store.rate = 1
    store.newRecord = false
    this.replayId = config.replayId || ''

    if (config.log) {
      dataLog.startRead(config.log)
      logEvent('replay_view', {
        replay_id: this.replayId,
      })
    } else if (store.puzzle) {
      dataLog.end()
      logEvent('puzzle_view', {
        level: store.level,
      })
    } else {
      dataLog.startRec()
      logEvent('scoretrial_view')
    }
    random.seed = dataLog.next(Random.genSeed())

    this.stage = new Stage()
    this.status = new Status()

    if (store.puzzle) {
      if (store.level === 0 && !pref.tips[1]) {
        this.dlgTips.open(1, 80)
      }
      if (store.level === 6 && !pref.tips[2]) {
        this.dlgTips.open(2, 80)
      }
    } else {
      if (!pref.tips[4]) {
        this.dlgTips.open(4, 80)
      }
    }

    stopAudioBgm()
  }

  get bgm() {
    if (store.puzzle) {
      return store.level < 12 ? bgm.puzzle1 : bgm.puzzle2
    } else {
      return bgm.scoreTrial
    }
  }

  update() {
    tween.paused = this.dlgPause.dialog.opened || this.dlgTips.dialog.opened

    if (!tween.paused) store.time++

    g.save()

    if (this.twEndPzl.next().running) {
      const lum = g.getAttr('luminance')
      lum[0] += Math.ceil(this.twEndPzl.value) / 3
      g.setAttr('luminance', lum)
    }
    if (this.twBgmFadeOut.next().onDone) {
      this.bgm.setVolume(0, 0.5)
    }
    this.twEndSt.next()

    g.save()
    this.status.update()
    g.translate(0, 16)
    this.stage.update()
    g.restore()

    this.dlgTips.update()
    this.dlgPause.update()
    this.dlgResultPzl.update()
    this.dlgResultSt.update()

    g.restore()

    if (!this.twEndPzl.started && !this.twEndSt.started) {
      if (this.status.btnPause.isClick) {
        this.dlgPause.open()
      }

      if (this.status.btnRetry.isClick) {
        const puzzle = store.puzzle
        const level = store.level
        store.nextScene = ['play', { puzzle, level }]

        if (store.puzzle) {
          logEvent('puzzle_retry', { level: store.level })
        } else {
          logEvent('scoretrial_retry')
        }
      }

      if (store.puzzle && !this.stage.items.length) {
        this.twEndPzl.start()
        dataLog.end()
        this.twBgmFadeOut.start()
        se.clear.play()
      }

      if (!store.puzzle && store.timeOver) {
        this.twEndSt.start()
        dataLog.end()
        if (!store.replay) {
          this.replayId = updateEntry(store.score, dataLog.getCode())
        }
        this.twBgmFadeOut.start()
        se.finish.play()
      }
    }

    if (this.twEndPzl.onDone) {
      const type = this.stage.tiles[0].type
      const allSame = this.stage.tiles.every((t) => t.type === type)
      const oneMove = store.routeCount <= 1
      const star = isScorable() ? 0 : 1 + (allSame ? 1 : 0) + (oneMove ? 1 : 0)

      pref.levels[store.level] = {
        star: Math.max(star, getLevelStar()),
        score: Math.max(store.score, getLevelScore()),
      }

      this.dlgResultPzl.open(allSame, oneMove)

      logEvent('puzzle_clear', {
        level: store.level,
        star,
        score: store.score,
      })
    }

    if (this.twEndSt.onDone) {
      this.dlgResultSt.open(this.replayId, dataLog.getCode())

      if (!store.replay) {
        logEvent('scoretrial_clear', {
          score: store.score,
        })
      }
    }
  }
}
