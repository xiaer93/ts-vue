import { VNodeData, VNode, VNodeDirective } from '../type'

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
