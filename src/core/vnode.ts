import { VNodeData } from '../type/vnode'
import { isArray } from 'util'

class VNode {
  tag?: string
  data?: VNodeData
  children?: Array<VNode>
  text?: string
  elm?: Node
  parent?: VNode
  key?: string | number
  constructor(tag: string, data: VNodeData, children?: Array<VNode>, text?: string) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
  }
}

export function createElement(tag: string, b?: any, c?: any): VNode {
  let data, children, text

  if (c) {
    data = b
    b = c
  } else {
    if (isArray(b)) {
      children = b
    } else {
      text = b
    }
  }

  return new VNode(tag, data, children, text)
}
