import Vue from '../../type/vue'
import { isUndef } from '../../helper/utils'
import { updateListeners } from '../../helper/events'

let _target: Vue | undefined = undefined

function add(event: string | Array<string>, fn: Function) {
  _target && _target.$on(event, fn)
}

function remove(event?: string | Array<string>, fn?: Function) {
  _target && _target.$off(event, fn)
}

function createOnceHandler(event: string | Array<string>, fn: Function) {
  const _target = _target

  return function onceHandler() {
    const res = fn.apply(null, arguments)
    if (res !== null) {
      _target.$off(event, onceHandler)
    }
  }
}

export function updateComponentListeners(vm: Vue, listeners: any, oldListeners?: any) {
  _target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, createOnceHandler, vm)
  _target = undefined
}
