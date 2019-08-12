import { Vue, VueOptions } from './vue'

export interface VNode {
  tag?: string
  data?: VNodeData
  children?: Array<VNode>
  text?: string
  elm?: Node
  parent?: VNode
  key?: string | number
  context?: Vue
  componentOptions?: ComponentVueOptions
  componentInstance?: Vue

  isComment?: boolean
}

export interface ComponentVueOptions extends VueOptions {
  propsData?: any
}

/**
 * render函数的入参
 */
export interface VNodeDataRender {
  style?: any
  class?: any
  attrs?: any
  props?: any
  domProps?: any

  on?: onType
  nativeOn?: onType

  hooks: Array<any>

  [key: string]: any
}

export interface VNodeData extends VNodeDataRender {
  staticClass?: any
}

export interface VNodeMethod {
  [key: string]: Function
}

export interface VNodeComputed {
  [key: string]: Function
}
export interface VNodeWatch {
  [key: string]: (oldVal?: any, val?: any) => void
}

type onType = {
  [key: string]: Function
}

// 拓展Node节点
// fixme: 所有的Node类型是否需要替换为Element，但是注释Comment节点；
// 节点和子节点
export interface VElement extends Element {
  _prevClass?: string
}
