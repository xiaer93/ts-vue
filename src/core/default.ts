import { VNodeData, VNode, VNodeDirective, Vue, VNodeComputed } from '../type'
import { isArray, isDef } from '../helper/utils'
import { isDate } from 'util'

export const DefaultDirectives = {
  show: {
    bind(el: Element, { value }: VNodeDirective, vnode: VNode) {
      const originalDisplay = ((el as any).__vOriginDisplay =
        el.style.display === 'none' ? '' : el.style.display)

      el.style.display = value ? originalDisplay : 'none'
    },
    update(el: Element, { value, oldValue }: VNodeDirective, vnode: VNode) {
      // fixme: 为什么取反
      if (!value === !oldValue) return

      el.style.display = value ? (el as any).__vOriginDisplay : 'none'
    },
    unbind(
      el: Element,
      binding: VNodeDirective,
      vnode: VNode,
      oldVnode: VNode,
      isDestroy: boolean
    ) {
      if (!isDestroy) {
        el.style.display = (al as el).__vOriginDisplay
      }
    }
  }
}

export const DefaultComponents = {
  transition: {
    name: 'transition',
    props: {
      name: String
    },
    abstract: true,

    render(h: Function) {
      let children: any = this.$slots.default
      if (!children) return

      const rawChild: VNode = children[0]
      const id: string = `__transition-${this._uid}-`

      const child = getRealChild(rawChild)

      const data: any = ((child.data || (child.data = {})).transition = extractTransitionData(this))
      const oldRawChild: VNode = this._vnode
      const oldChild: VNode = getRealChild(oldRawChild)

      if (child.data.directives && child.data.directives.some(d => d.name === 'show')) {
        child.data.show = true
      }

      return rawChild
    }
  }
}

function getRealChild(vnode: VNode): VNode {
  let compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function getFirstComponentChild(children: Array<VNode>): VNode {
  if (isArray(children)) {
    for (let i = 0, len = children.length; i < len; ++i) {
      let child = children[i]
      if (isDef(child) && isDef(child.componentOptions)) {
        return child
      }
    }
  }
}

function extractTransitionData(comp: Vue) {
  let data = Object.create(null)
  const options = comp.$options

  for (let key in options.propsData) {
    data[key] = comp[key]
  }

  // fixme: parentListeners从哪里来的？
  const listeners = options._parentListeners
  for (let key in listeners) {
    data[key] = listeners[key]
  }

  return data
}
