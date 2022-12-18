interface Pos {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface Rect {
  top: number
  right: number
  bottom: number
  left: number
}

interface Vec {
  angle: number
  dist: number
}

type Align =
  | 'center'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'left top'
  | 'right top'
  | 'right bottom'
  | 'left bottom'
