export class BinaryNode {
  x
  y
  w
  h
  /** @type {BinaryNode | null} */
  child1 = null
  /** @type {BinaryNode | null} */
  child2 = null

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  constructor(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  /**
   * @param {BinaryNode} node
   * @return {BinaryNode | undefined}
   */
  insert(node) {
    if (this.child1 && this.child2) {
      return this.child1.insert(node) || this.child2.insert(node)
    } else if (this.w >= node.w && this.h >= node.h) {
      node.x = this.x
      node.y = this.y

      const x2 = this.x + node.w
      const y2 = this.y + node.h
      const dw = this.w - node.w
      const dh = this.h - node.h

      if (dw > dh) {
        this.child1 = new BinaryNode(this.x, y2, node.w, dh)
        this.child2 = new BinaryNode(x2, this.y, dw, this.h)
      } else {
        this.child1 = new BinaryNode(x2, this.y, dw, node.h)
        this.child2 = new BinaryNode(this.x, y2, this.w, dh)
      }

      return node
    }
  }
}
