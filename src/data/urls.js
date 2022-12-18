const locationUrl = new URL(location.href)

export function getReplayId() {
  return locationUrl.searchParams.get('r') || ''
}

export function deleteReplayId() {
  locationUrl.searchParams.delete('r')
  history.replaceState(history.state, '', locationUrl.href)
}

export const rootUrl = location.href.replace(/[?#].*$/, '')
export const hashtags = '#FIRELINER'
export const twitterApi = 'https://twitter.com/intent/tweet'

export const shareUrl = `${twitterApi}?${new URLSearchParams({
  text: `${hashtags}\n${rootUrl}`,
})}`

/**
 * @param {string} id
 * @param {string} text
 */
export function replayUrl(id, text = '') {
  if (text) text += ' '
  const replayParam = new URLSearchParams({ r: id })
  return `${twitterApi}?${new URLSearchParams({
    text: `${text}${hashtags}\n${rootUrl}?${replayParam}`,
  })}`
}
