let currentState = getActiveState()
/** @type {((state: boolean) => void)[]} */
const activelisteners = []

/**
 * @param {(state: boolean) => void} listener
 */
export function onActiveChange(listener) {
  activelisteners.push(listener)
}

export function getActiveState() {
  return document.visibilityState === 'visible' && document.hasFocus()
}

function testState() {
  const state = getActiveState()
  if (currentState !== state) {
    currentState = state
    for (const listener of activelisteners) listener(state)
  }
}

document.addEventListener('visibilitychange', testState)
window.addEventListener('blur', testState)
window.addEventListener('focus', testState)
