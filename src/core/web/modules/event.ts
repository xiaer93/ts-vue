import { VNode, VueConfig, Vue } from '../../../type'
import { cache, isDef, isTruth, isTrue } from '../../../helper/utils'
import { isArray } from 'util'

type EventInfo = {
  name: string
  once: boolean
  capture: boolean
  passive: boolean
}

function invokeWithErrorHandling(fn: Function, args: Array<any>, context: Object) {
  try {
    // 绑定函数上下文
    fn.apply(context, args)
  } catch {}
}

function createOnceHandler(target: Node, name: string, fn: Function, capture: boolean) {
  return function onceHandler(...args) {
    let res = fn(...args)
    if (res) {
      remove(target, name, onceHandler, capture)
    }
  }
}

const normalizeEvent = cache((name: string) => {
  const passive: boolean = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once: boolean = name.charAt(0) === '~'
  name = once ? name.slice(1) : name
  const capture: boolean = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name

  return {
    name,
    once,
    capture,
    passive
  }
})

function add(
  target: Node,
  name: string,
  handler: EventListener,
  capture: boolean,
  passive: boolean
) {
  target.addEventListener(name, handler, passive ? { passive, capture } : capture)
}
function remove(target: Node, name: string, handler: EventListener, capture: boolean) {
  target.removeEventListener(name, handler, capture)
}

function createFnInvoker(fns: Function | Array<Function>, vm: Vue) {
  function invoker(...args) {
    let fns = invoker.fns
    if (isArray(fns)) {
      const cloned = (fns as Array<Function>).splice(0)
      for (let fn of cloned) {
        invokeWithErrorHandling(fn, args, vm)
      }
    } else {
      invokeWithErrorHandling(fns, args, vm)
    }
  }

  invoker.fns = fns
  return invoker
}

function updateEvent(oldVnode: VNode, vnode: VNode) {
  let oldOn = oldVnode.data!.on || {},
    on = vnode.data!.on || {},
    vm: Vue = vnode.context,
    cur: any,
    old: any,
    event: EventInfo
  let target: Node = oldVnode.elm || vnode.elm

  for (let name in on) {
    cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    if (!isDef(cur)) {
    } else if (!isDef(old)) {
      // 是否封装过，执行数组或函数
      if (!isDef(cur!.fns)) {
        cur = on[name] = createFnInvoker(cur!, vm)
      }
      // 是否只执行一次
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(target, event.name, cur, event.capture)
      }
      add(target, event.name, cur, event.capture, event.passive)
    } else if (cur !== old) {
      // fixme: cur不是invokeHandle呀？？？？？？这段代码是什么逻辑？？？
      old.fns = cur
      on[name] = old
    }
  }

  for (let name in oldOn) {
    event = normalizeEvent(name)
    if (!isDef(on[name])) {
      remove(target, name, oldOn[name], event.capture)
    }
  }
}

export default {
  create: updateEvent,
  update: updateEvent
}
