import { Vue, VueOptions } from './vue'
import directives from '../core/web/modules/directives'

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

  // 指令
  directives: Array<VNodeDirective>
  // ref引用
  ref: string
  refInFor: boolean

  [key: string]: any
}

export interface VNodeData extends VNodeDataRender {
  staticClass?: any
  hook?: onType
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

export interface VNodeDirective {
  name: string
  value: any
  expression: string
  arg: string
  modifiers: Record<string, boolean>

  def?: VNodeDirectiveMethod
  oldValue?: any
}

export interface VNodeDirectiveMethod {
  bind?: VNodeDirectiveFunc
  inserted?: VNodeDirectiveFunc
  update?: VNodeDirectiveFunc
  componentUpdated?: VNodeDirectiveFunc
  unbind?: VNodeDirectiveFunc
}

export interface VNodeDirectiveFunc {
  (el: Element, binding: VNodeDirective, vnode: VNode, oldVnode: VNode): void
}
