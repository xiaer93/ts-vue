import { VNodeData, CreateVnode } from '../type/vnode'
import { isArray } from 'util'
import { Vue } from '../type'

class VNode {
  tag?: string
  data?: VNodeData
  children?: Array<VNode>
  text?: string
  elm?: Node
  parent?: VNode
  key?: string | number
  context: Vue | null
  constructor(tag: string, data: VNodeData, children?: Array<VNode>, text?: string) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text

    this.context = null
  }
}

/**
 * 创建虚拟节点：子节点、文本节点、注释节点
 */
export const createVnode: CreateVnode = function(tag: string, b?: any, c?: any): VNode {
  let data, children, text

  if (c) {
    data = b
    b = c
  }

  if (isArray(b)) {
    children = b
  } else {
    text = b
  }

  data = data || {}
  const vnode = new VNode(tag, data, children, text)
  vnode.context = createVnode.context
  return vnode
}

export function createNodeAt(elm: Node): VNode {
  const vnode: VNode = createVnode(elm!.nodeName)
  vnode.elm = elm
  return vnode
}
