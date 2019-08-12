import { VNode } from '../../../type'
import { isUndef } from '../../../helper/utils'

function updateDOMProps(oldVnode: VNode, vnode: VNode) {
  if (isUndef(oldVnode.data!.domProps) && isUndef(vnode.data!.domProps)) {
    return
  }

  const elm: Element = vnode.elm
  const oldProps = oldVnode.data!.domProps || {}
  const props = vnode.data!.domProps || {}
  let cur: any

  for (let key in oldProps) {
    if (isUndef(props[key])) {
      elm[key] = ''
    }
  }

  for (let key in props) {
    cur = props[key]
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) vnode.children.length = 0
      if (cur === oldProps[key]) continue
      // 为什么此处用remove
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0])
      }
    }

    if (cur !== oldProps[key]) {
      try {
        elm[key] = cur
      } catch {}
    }
  }
}

export default {
  create: updateDOMProps,
  update: updateDOMProps
}
