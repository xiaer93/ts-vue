import { isFunction } from 'util'
import { isDef } from './utils'

let callbacks: Array<() => void> = []
// 等待cb？
let pending: boolean = false

let timeFun = setImmediate

function flushCallbacks() {
  pending = false

  let cloneCbs = callbacks.slice(0)
  callbacks.length = 0
  for (let cb of cloneCbs) {
    cb()
  }
}

export default function nextTick(cb?: () => void, ctx?: object) {
  let _resolve: (value: any) => void
  callbacks.push(() => {
    if (isFunction(cb)) {
      try {
        cb!.call(ctx)
      } catch {}
    } else if (_resolve) {
      _resolve(ctx)
    }
  })

  if (!pending) {
    pending = true
    timeFun(flushCallbacks)
  }

  if (!cb && !isDef(Promise)) {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
