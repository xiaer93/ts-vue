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

export interface VNodeData {
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

export interface VNodeMethod {
  [key: string]: Function
}

export interface VNodeComputed {
  [key: string]: Function
}
export interface VNodeWatch {
  [key: string]: (oldVal?: any, val?: any) => void
}

export interface CreateVElement {
  (tag: string, b?: any, c?: any): VNode
  context?: any
}

type onType = {
  [key: string]: Function
}
