import { Vue, VNodeData, VNode, VueOptions, VueClass } from '../../type'
import { createVnode } from '../vnode'
import { callhook } from '../../helper/hook'
import { updateComponentListeners } from './events'
import { isTrue } from '../../helper/utils'
import { resolveSlot } from '../slot'
import { initProps } from '../init'

const componentVNodeHooks = {
  init(vnode: VNode) {
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
  const Ctor: VueClass = baseCtor.extend(Ctor)
  data = data || {}

  // data.on为自定义事件，nativeOn为原生事件
  const listeners = data.on
  data.on = data.nativeOn

  // if(isTrue(Ctor.options.abstract)) {
  //   let slot = data.slot
  //   data = {}
  //   if(slot) {
  //     data.slot = slot
  //   }
  // }

  installComponentHook(data)

  const name = (Ctor.options && Ctor.options.name) || tag
  const propsData = data.props
  return createVnode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data,
    undefined,
    undefined,
    undefined,
    context,
    { Ctor, propsData, children, tag, listeners }
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

  let ret = new vnode.componentOptions!.Ctor(options)
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
  const oldListeners = vm.$options._parentListeners
  vm.$options.propsData = propsData
  vm.$options._parentListeners = listeners
  vm.$options._renderChildren = renderChildren
  updateComponentListeners(vm, listeners, oldListeners)

  // 更新component-props
  initProps(vm)

  // 更新插槽---每个vnode都有context
  vm.$slots = resolveSlot(renderChildren, parentVnode.context)
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
