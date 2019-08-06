export interface VNode {
  tag?: string
  data?: VNodeData
  children?: Array<VNode>
  text?: string
  elm?: Node
  parent?: VNode
  key?: string | number
  context: VueInstance | null
}

export interface VNodeData {
  style?: any
  class?: any
  on?: any
  [key: string]: any
}

export interface VNodeMethod {
  [key: string]: () => void
}

export interface CreateElement {
  (tag: string, b?: any, c?: any): VNode
}
