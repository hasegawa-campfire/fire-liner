/**
 * @param {string} str
 */
export function toZenkaku(str) {
  return str.replace(/[A-Za-z0-9]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0)
  })
}

/**
 * @param {number} num
 */
export function delimit(num) {
  return num.toLocaleString('en-US')
}

/**
 * @param {number} num
 */
export function ordinal(num) {
  if (num === 1) {
    return '1st'
  } else if (num === 2) {
    return '2nd'
  } else if (num === 3) {
    return '3rd'
  }
  return `${num}th`
}
