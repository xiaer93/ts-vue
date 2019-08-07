import { VNode } from '../../../type'

type VNodeStyle = Record<string, string>

// 更新样式
function updateStyle(oldVnode: VNode, vnode: VNode): void {
  // debugger
  let cur: any,
    name: string,
    elm = vnode.elm,
    oldStyle = oldVnode.data!.style,
    style = vnode.data!.style

  if (!oldStyle && !style) return
  if (oldStyle === style) return

  oldStyle = oldStyle || ({} as VNodeStyle)
  style = style || ({} as VNodeStyle)

  for (name in oldStyle) {
    if (!style[name]) {
      ;(elm as any).style[name] = ''
    }
  }

  for (name in style) {
    ;(elm as any).style[name] = style[name]
  }
}

function removeStyle(vnode: VNode, rm: () => void) {}

export default {
  create: updateStyle,
  update: updateStyle
}
