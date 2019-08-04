export interface VNode {
  tag?: string
  data?: VNodeData
  children?: Array<VNode>
  text?: string
  elm?: Node
  parent?: VNode
  key?: string | number
}

export interface VNodeData {
  style?: any
  class?: any
  [key: string]: any
}

export interface CreateElement {
  (tag: string, b?: any, c?: any): VNode
}
