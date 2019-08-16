import { VNode, Vue, VueSlots } from '../type'
import { isUndef } from '../helper/utils'

export function resolveSlot(children?: Array<VNode>, contenxt?: Vue): VueSlots {
  if (isUndef(children) || !children!.length) {
    return {}
  }
  let slots: VueSlots = {}

  for (let i = 0, len = children.length; i < len; ++i) {
    const child = children[i]
    const data = child.data

    // fixme: 什么逻辑？？？
    if (child.context === contenxt && data && data.slot) {
      const name = data.slot
      const slot = slots[name] || (slots[name] = [])
      slot.push(child)
    } else {
      ;(slots.default || (slots.default = [])).push(child)
    }
  }

  for (let name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }

  return slots
}

// 注释(且非异步节点)、文本
function isWhitespace(node: VNode) {
  return node.tag === '!' || node.text === ''
}
