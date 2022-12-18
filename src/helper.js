import { tileSize, pref, maxLevel, store, se, bgm } from './r.js'

/**
 * @param {number} n
 */
export function toTileCenter(n) {
  return (n + 0.5) * tileSize
}

/**
 * @param {Pos} pos
 */
export function toTileCenterPos(pos) {
  return { x: toTileCenter(pos.x), y: toTileCenter(pos.y) }
}

export function getUnlockLevel() {
  for (const n of [0, 6, 8]) {
    if (!getLevelStar(n)) return n
  }
  for (let i = 0; i <= 11; i++) {
    if (!getLevelStar(i)) return 11
  }
  return 15
}

export function isAllClear() {
  for (let i = 0; i <= maxLevel; i++) {
    if (!getLevelStar(i)) return false
  }
  return true
}

/**
 * @param {number} [level]
 */
export function getLevelStar(level) {
  return pref.levels[level ?? store.level]?.star ?? 0
}

/**
 * @param {number} [level]
 */
export function getLevelScore(level) {
  return pref.levels[level ?? store.level]?.score ?? 0
}

export function isScorable() {
  return !store.puzzle || (isAllClear() && pref.puzzleScore)
}

/**
 * @param {boolean} value
 */
export function setAudioMute(value) {
  for (const a of Object.values(se)) a.setMute(value)
  for (const a of Object.values(bgm)) a.setMute(value)
  pref.mute = value
}

/**
 * @param {import('@local_modules/audio.js').Audio} audio
 */
export function playAudioBgm(audio) {
  if (audio.playing) return
  stopAudioBgm()
  audio.play()
}

export function stopAudioBgm() {
  for (const a of Object.values(bgm)) a.stop()
}

export function stopAudioSe() {
  for (const a of Object.values(se)) a.stop()
}
