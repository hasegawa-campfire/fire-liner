const originPos = { x: 0, y: 0 }

/**
 * @param {Rect | Vec | number} value
 */
export function toPos(value) {
  if (typeof value === 'number') {
    return { x: value, y: value }
  }

  if ('left' in value) {
    return { x: value.left, y: value.top }
  }

  const dec = value.angle * (Math.PI / 180)
  return {
    x: Math.cos(dec) * value.dist,
    y: Math.sin(dec) * value.dist,
  }
}

/**
 * @param {Pos} pos1
 * @param {Pos} [pos2]
 */
export function toDist(pos1, pos2) {
  if (!pos2) {
    pos2 = pos1
    pos1 = originPos
  }
  return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
}

/**
 * @param {Pos} pos1
 * @param {Pos} [pos2]
 */
export function toAngle(pos1, pos2) {
  if (!pos2) {
    pos2 = pos1
    pos1 = originPos
  }
  const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * (180 / Math.PI)
  return angle < 0 ? angle + 360 : angle
}

/**
 * @param {Pos} pos
 */
export function toVec(pos) {
  return {
    dist: toDist(pos),
    angle: toAngle(pos),
  }
}

/**
 * @param {Pos} pos1
 * @param {Pos} pos2
 */
export function addPos(pos1, pos2) {
  return {
    x: pos1.x + pos2.x,
    y: pos1.y + pos2.y,
  }
}

/**
 * @param {Align} align
 */
export function toAlignPos(align) {
  const x =
    align === 'right' || align === 'right top' || align === 'right bottom'
      ? 1
      : align === 'top' || align === 'center' || align === 'bottom'
      ? 0.5
      : 0

  const y =
    align === 'bottom' || align === 'right bottom' || align === 'left bottom'
      ? 1
      : align === 'left' || align === 'center' || align === 'right'
      ? 0.5
      : 0

  return { x, y }
}

/**
 * @param {Size | number} base
 * @param {Size | number} size
 * @param {Align} [align]
 */
export function layoutPos(base, size, align) {
  align = align ?? 'center'
  base = typeof base === 'number' ? toSize(base) : base
  size = typeof size === 'number' ? toSize(size) : size

  const ratio = toAlignPos(align)

  return {
    x: (base.width - size.width) * ratio.x,
    y: (base.height - size.height) * ratio.y,
  }
}

/**
 * @param {Pos} pos1
 * @param {Pos} pos2
 */
export function equalsPos(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} rate
 */
export function map(a, b, rate) {
  return (b - a) * rate + a
}

/**
 * @param {Rect | (Partial<Pos> & Size)} rect
 * @param {Pos} pos
 */
export function inRect(rect, pos) {
  const x = pos.x
  const y = pos.y

  if ('width' in rect) {
    const left = rect.x ?? 0
    const top = rect.y ?? 0
    const right = left + rect.width
    const bottom = top + rect.height
    return left <= x && x < right && top <= y && y < bottom
  }

  return rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom
}

/**
 * @param {Rect | number} value
 */
export function toSize(value) {
  if (typeof value === 'number') {
    return { width: value, height: value }
  }

  return { width: value.right - value.left, height: value.bottom - value.top }
}

/**
 * @param {Pos | number} pos
 * @param {Size | number} size
 */
export function toRect(pos, size) {
  if (typeof pos === 'number') {
    pos = { x: pos, y: pos }
  }

  if (typeof size === 'number') {
    size = { width: size, height: size }
  }

  return {
    left: pos.x,
    top: pos.y,
    right: pos.x + size.width,
    bottom: pos.y + size.height,
  }
}
