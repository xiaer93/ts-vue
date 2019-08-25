import { Vue } from '../type'
import { isUndef, isTrue, isArray, cache } from './utils'
import { invokeWithErrorHandling } from './warn'

type EventInfo = {
  name: string
  once: boolean
  capture: boolean
  passive: boolean
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

/**
 * 在此处不绑定this
 */
export function createFnInvoker(fns: Function | Array<Function>) {
  function invoker(...args) {
    let fns = invoker.fns
    if (isArray(fns)) {
      const cloned = (fns as Array<Function>).splice(0)
      for (let fn of cloned) {
        invokeWithErrorHandling(fn, args)
      }
    } else {
      invokeWithErrorHandling(fns, args)
    }
  }

  invoker.fns = fns
  return invoker
}

export function updateListeners(
  on: any,
  oldOn: any,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Vue
) {
  let cur: any, old: any, event: EventInfo

  for (let name in on) {
    cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    if (isUndef(cur)) {
    } else if (isUndef(old)) {
      // 是否封装过，执行数组或函数
      if (isUndef(cur!.fns)) {
        cur = on[name] = createFnInvoker(cur!, vm)
      }
      // 是否只执行一次
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      add(event.name, cur, event.capture, event.passive)
    } else if (cur !== old) {
      // fixme: cur不是invokeHandle呀？？？？？？这段代码是什么逻辑？？？
      old.fns = cur
      on[name] = old
    }
  }

  for (let name in oldOn) {
    event = normalizeEvent(name)
    if (isUndef(on[name])) {
      remove(name, oldOn[name], event.capture)
    }
  }
}
