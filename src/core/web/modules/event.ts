import { VNode, VueOptions, Vue } from '../../../type'
import { cache, isDef, isUndef, isTrue } from '../../../helper/utils'
import { isArray } from 'util'
import { invokeWithErrorHandling } from '../../../helper/warn'
import { updateListeners } from '../../../helper/events'

let _target: any

function createOnceHandler(name: string, fn: Function, capture: boolean) {
  return function onceHandler(...args) {
    let res = fn(...args)
    if (res) {
      remove(name, onceHandler, capture)
    }
  }
}

function add(
  name: string,
  handler: EventListener,
  capture: boolean,
  passive: boolean,
  target?: Node
) {
  ;(target || _target).addEventListener(name, handler, passive ? { passive, capture } : capture)
}
function remove(name: string, handler: EventListener, capture: boolean, target?: Node) {
  ;(target || _target).removeEventListener(name, handler, capture)
}

function updateEvent(oldVnode: VNode, vnode: VNode) {
  let oldOn = oldVnode.data!.on || {},
    on = vnode.data!.on || {},
    vm: Vue = vnode.context

  _target = vnode.elm
  updateListeners(on, oldOn, add, remove, createOnceHandler, vm)
  _target = undefined
}

export default {
  create: updateEvent,
  update: updateEvent
}
