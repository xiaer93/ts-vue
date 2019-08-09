import { Vue, VNodeData, VNode, VueOptions, VueClass } from '../../type'
import { createSubVue } from '..'
import { createVnode } from '../vnode'
import { isDef } from '../../helper/utils'
import { callhook } from '../../helper/hook'
import { observe } from '../observer'

const componentVNodeHooks = {
  init(vnode: VNode) {
    debugger
    if (vnode.componentInstance && !vnode.componentInstance.$status.isDestroyed) {
      const mountedVnode = vnode
      componentVNodeHooks.prepatch(mountedVnode, mountedVnode)
    } else {
      const child = (vnode.componentInstance = createComponentInstanceForVnode(vnode, null))
      // $mount是什么操作？？？
      child.$mount()
    }
    console.log(vnode)
  },
  prepatch(oldVnode: VNode, vnode: VNode) {
    debugger
    const options = vnode.componentOptions
    const child = (vnode.componentInstance = oldVnode.componentInstance)
    // vnode是组件节点，child是组件节点的实例
    updateChildComponent(child, options.propsData, options.listeners, vnode, options.children)
  },
  insert(vnode: VNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance!.$status.isMounted) {
      componentInstance!.$status.isMounted = true
      callhook(componentInstance!, 'mounted')
    }
  },
  destroy(vnode: VNode) {
    const { componentInstance } = vnode
    if (!componentInstance!.$status.isDestroyed) {
      componentInstance!.$destroy()
    }
  }
}

const hooksToMerge = Object.keys(componentVNodeHooks)

/**
 * 创建组件
 */
export function createComponent(
  Ctor: VueOptions, // 定义组件时候的props
  data?: VNodeData, // 调用时候传入的props
  context?: Vue,
  children?: Array<VNode>,
  tag?: string
): VNode {
  const baseCtor = context.$options._base
  const SubVue: VueClass = baseCtor.extend(Ctor)
  data = data || {}
  installComponentHook(data)

  const name = (Ctor.options && Ctor.options.name) || tag
  const propsData = data.props
  return createVnode(
    `vue-component-${SubVue.cid}${name ? `-${name}` : ''}`,
    data,
    undefined,
    undefined,
    undefined,
    context,
    { SubVue, propsData, children, tag }
  )
}

export function createComponentInstanceForVnode(vnode: VNode, parent: any): Vue {
  const options: any = {
    isComponent: true,
    parentVnode: vnode,
    parent
  }

  // const inlineTemplate = vnode.data!.inlineTemplate
  // if(isDef(inlineTemplate)) {
  //   options.render = inlineTemplate.render
  // }

  let ret = new vnode.componentOptions!.SubVue(options)
  window.r = ret
  return ret
}

// 安装hook，在patch为真实dom时调用。（patch组件vnode，与patch一般vnode流程不太一致）
function installComponentHook(data: VNodeData) {
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; ++i) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}

function updateChildComponent(
  vm: Vue,
  propsData: any,
  listeners: any,
  parentVnode: Vue,
  renderChildren?: Array<VNode>
) {
  vm.$options.propsData = propsData
  vm._initProps()

  vm.$forceUpdate()
}

function mergeHook(f1: any, f2: any): Function {
  const merged = (a, b) => {
    f1(a, b)
    f2(a, b)
  }
  merged._merged = true
  return merged
}
