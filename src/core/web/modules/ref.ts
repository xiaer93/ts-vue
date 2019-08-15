import { VNode } from '../../../type'
import { isUndef, remove, contains } from '../../../helper/utils'
import { isArray } from 'util'

export default {
  create(_: any, vnode: VNode) {
    registerRef(vnode)
  },
  update(oldVnode: VNode, vnode: VNode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true)
      registerRef(vnode)
    }
  },
  destroy(vnode: VNode) {
    registerRef(vnode, true)
  }
}

function registerRef(vnode: VNode, isRemove?: boolean) {
  const key = vnode.data.ref
  if (isUndef(key)) return

  const vm = vnode.context
  const ref = vnode.componentInstance || vnode.elm
  const refs = vm.$refs

  if (isRemove) {
    if (isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) {
      if (!isArray(refs[key])) {
        refs[key] = [ref]
      } else if (!contains(refs[key], ref)) {
        refs[key].push(ref)
      }
    } else {
      refs[key] = ref
    }
  }
}
