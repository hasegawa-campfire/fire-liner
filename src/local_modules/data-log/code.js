const base64chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/**
 * @param {number[]} numbers
 */
export function nums2code(numbers) {
  let code = ''

  for (let num of numbers) {
    num = Math.floor(num)

    let digits = (0 <= num ? num : -num - 1).toString(2).length + 1
    let head = 0
    let tmp = ''

    while (digits > 0) {
      tmp = base64chars[(num & 0b011111) | head] + tmp
      digits -= 5
      num = num >> 5
      head = 0b100000
    }

    code += tmp
  }

  return code
}

/**
 * @param {string} code
 */
export function code2nums(code) {
  const numbers = /** @type {number[]} */ ([])
  let num = 0
  let first = true

  for (const c of code) {
    let i = base64chars.indexOf(c)

    if (i < 0) throw Error('invalid string')

    if (first && i & 0b010000) num = -1

    first = false
    num = (num << 5) | (i & 0b011111)

    if ((i & 0b100000) === 0) {
      numbers.push(num)
      num = 0
      first = true
    }
  }

  return numbers
}

/**
 * @param  {number[][]} values
 */
export function packNums(values) {
  let packValue = /** @type {number[]} */ ([])

  for (const nums of values) {
    packValue = packValue.concat(nums.length, nums)
  }

  return packValue
}

/**
 * @param  {number[]} packValue
 */
export function unpackNums(packValue) {
  const values = /** @type {number[][]} */ ([])
  let index = 0

  while (index < packValue.length) {
    const end = index + 1 + packValue[index]

    if (packValue.length < end) throw Error('invalid pack size')

    values.push(packValue.slice(index + 1, end))
    index = end
  }

  return values
}
