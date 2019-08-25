import { VNodeData, VNode, VNodeDataRender } from '../type/vnode'
import { isArray } from 'util'
import { Vue, VueOptions } from '../type'
import { isReserveTag } from './web/element'
import {
  isTruth,
  isDef,
  isPrimitive,
  isObject,
  isUndef,
  curry,
  isPlainObject,
  resolveAsset,
  isVNode,
  isTrue,
  flatten
} from '../helper/utils'
import { createComponent } from './component/create-component'
import VueReal from './core'
import { createFnInvoker } from '../helper/events'

/**
 * 虚拟节点，总共有4种类型：子节点、组件节点、文本节点、注释节点
 */
export class VNodeRel implements VNode {
  tag?: string
  data?: VNodeData
  children?: Array<VNode>
  text?: string
  elm?: Node
  context?: Vue
  componentOptions?: VueOptions

  componentInstance?: Vue

  parent?: VNode
  key?: string | number
  constructor(
    tag?: string,
    data?: VNodeData,
    children?: Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Vue,
    componentOptions?: VueOptions
  ) {
    this.tag = tag
    this.data = data || ({} as VNodeData)
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context || bindContenxt
    this.componentOptions = componentOptions
  }
}

let bindContenxt: Vue | undefined = undefined

/**
 * 创建虚拟节点：子节点、组件节点
 */
function createVElement(context: Vue, a: string): VNode
function createVElement(context: Vue, a: string, b: VNodeDataRender): VNode
function createVElement(context: Vue, a: string, c: string | Array<VNode | string>): VNode
function createVElement(
  context: Vue,
  a: string,
  b: VNodeDataRender,
  c: string | Array<VNode | string>
): VNode
function createVElement(context: Vue, a: string, b?: any, c?: any): VNode {
  let data: VNodeData | undefined, children: Array<VNode> | undefined, Ctor: any

  if (isUndef(a)) return createEmptyVnode()

  if (isDef(c)) {
    data = b
    b = c
  }

  if (isPlainObject(b)) {
    data = b
  } else {
    children = isArray(b) ? flatten(b) : [isPrimitive(b) ? createTextVnode(b) : b]
  }

  if (isArray(children)) {
    for (let i = 0; i < children.length; ++i) {
      if (isPrimitive(children[i])) {
        children[i] = new VNodeRel('!', undefined, undefined, a)
      }
    }
  }

  if (context && isReserveTag(a)) {
    return new VNodeRel(a, data, children, undefined, undefined, context)
  } else if (context && isDef((Ctor = resolveAsset(context.$options, 'components', a)))) {
    console.log('Ctor', Ctor, data)
    return createComponent(Ctor, data, context, children, a)
  } else {
    return new VNodeRel(a, data, children, undefined, undefined, context)
  }
}

export function makeCreateElement(context: Vue): Function {
  bindContenxt = context
  return curry(createVElement, 2)(context)
}

export function createNodeAt(elm: Node): VNode {
  const vnode: VNode = new VNodeRel(elm!.nodeName, undefined, undefined, undefined, undefined)
  vnode.elm = elm
  return vnode
}

// 用于生成组件的vnode
export function createVnode(...args: any[]): VNode {
  return new VNodeRel(...args)
}

// 注释节点、
export function createEmptyVnode(text: string = ''): VNode {
  return new VNodeRel('!', undefined, undefined, text)
}

// 文本节点、
export function createTextVnode(text: string): VNode {
  return new VNodeRel(undefined, undefined, undefined, text)
}

export function mergeVNodeHook(def: any, hookKey: string, hook: Function) {
  if (isVNode(def)) {
    def = def.data.hook || (def.data.hook = {})
  }
  let invoker
  const oldHook = def[hookKey]

  function wrappedHook() {
    hook.apply(this, arguments)
    remove(invoker.fns, wrappedHook)
  }

  if (isUndef(oldHook)) {
    invoker = createFnInvoker([wrappedHook])
  } else {
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      invoker = oldHook
      invoker.fns.push(wrappedHook)
    } else {
      invoker = createFnInvoker([oldHook, wrappedHook])
    }
  }

  invoker.merged = true
  def[hookKey] = invoker
}

function remove(arr: Array<any>, item: any): void {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (item > -1) {
      arr.splice(index, 1)
    }
  }
}
