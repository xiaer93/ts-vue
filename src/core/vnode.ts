import { VNodeData, CreateVElement, VNode } from '../type/vnode'
import { isArray } from 'util'
import { Vue, VueOptions } from '../type'
import { isReserveTag } from './web/element'
import { isTruth, isDef, isPrimitive } from '../helper/utils'
import { createComponent } from './component/create-component'

class VNodeRel implements VNode {
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
  isComment?: boolean
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
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context
    this.componentOptions = componentOptions
  }
}

/**
 * 创建虚拟节点：子节点、文本节点、注释节点、组件节点
 */
export const createVElement: CreateVElement = function(tag: string, b?: any, c?: any): VNode {
  let data: VNodeData | undefined,
    children: Array<VNode> | undefined,
    text: string = '',
    isComment: boolean = false
  const context: Vue = createVElement.context
  let Ctor

  if (!isTruth(tag)) return createEmptyVnode()

  if (isDef(c)) {
    data = b
    b = c
  }

  if (isArray(b)) {
    children = b
  } else {
    text = b
  }

  data = data || ({} as VNodeData)

  if (isArray(children)) {
    for (let i = 0; i < children.length; ++i) {
      if (isPrimitive(children[i])) {
        children[i] = new VNodeRel('!', undefined, undefined, tag)
      }
    }
  }

  if (isReserveTag(tag)) {
    return new VNodeRel(tag, data, children, text, undefined, context)
  } else if (context && isDef((Ctor = resolveAsset(context.$options, 'components', tag)))) {
    console.log(Ctor)
    return createComponent(Ctor, data, context, children, tag)
  } else {
    return new VNodeRel('!', undefined, undefined, tag)
  }
}

export function createNodeAt(elm: Node): VNode {
  const vnode: VNode = createVElement(elm!.nodeName)
  vnode.elm = elm
  return vnode
}

export function createEmptyVnode() {
  return new VNodeRel('', {} as VNodeData)
}

export function createVnode(...args) {
  return new VNodeRel(...args)
}

function resolveAsset(options: VueOptions, key: string, tag: string) {
  return options[key] && options[key][tag]
}
