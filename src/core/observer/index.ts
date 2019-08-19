import Dep from './dep'
import {
  isPrimitive,
  isFalse,
  always,
  hasOwn,
  isDef,
  isArray,
  isFunction,
  noop,
  isObject,
  isPlainObject
} from '../../helper/utils'
import { VueClass, Vue, VNodeComputed } from '../../type'
import { createProxy, isProxy, defineProxyObject, defineProxyArray } from './cProxy'
import Watch from './watch'

// observe创建响应式对象
// proxy对象，所有的操作都会被拦截
// 对数组 [].push(1)，会触发2次set，key为0， length
export function observe(obj: any) {
  // 字面量类型或已经为响应式类型则直接返回
  if (isPrimitive(obj) || isProxy(obj)) {
    return obj
  }

  let proxyObj = createProxy(obj)

  if (isArray(proxyObj)) {
    defineArray(proxyObj)
  } else {
    for (let key in proxyObj) {
      defineObject(proxyObj, key, undefined, undefined, false)
    }
  }

  return proxyObj
}

/**
 * 为computed创建响应式对象
 */
export function observeComputed(obj: VNodeComputed, _computedWatched: any, proxyThis: any) {
  if (!isPlainObject(obj)) return

  let proxyObj = createProxy(obj)

  for (let key in obj) {
    defineComputed(proxyObj, key, obj[key], _computedWatched[key], proxyThis)
  }

  return proxyObj
}

export function defineObject(
  obj: any,
  key: string,
  val?: any,
  customSetter?: Function,
  shallow?: boolean
) {
  if (!isProxy(obj)) {
    return
  }

  let dep: Dep = new Dep()

  val = isDef(val) ? val : obj[key]
  val = shallow ? val : observe(val)

  defineProxyObject(obj, key, {
    get(target: any, key: string) {
      Dep.Target && dep.depend()
      return val
    },
    set(target: any, key: string, newVal) {
      if (val === newVal || newVal === val.__originObj) return false

      if (customSetter) {
        return customSetter()
      }

      newVal = shallow ? newVal : observe(newVal)
      val = newVal
      let status = Reflect.set(target, key, val)
      dep.notify()
      return status
    }
  })
}

function defineArray(obj: any) {
  if (!isProxy(obj)) {
    return
  }

  let dep: Dep = new Dep()

  let handler = {
    get(target: any, key: string) {
      Dep.Target && dep.depend()
      return Reflect.get(target, key)
    },
    set(target: any, key: string, newVal: any) {
      if (isPrimitive(newVal)) {
        newVal = observe(newVal)
      }
      const status = Reflect.set(target, key, newVal)
      dep.notify()
      return status
    }
  }

  defineProxyArray(obj, handler)
}

function defineComputed(obj: any, key: string, userDef: any, watcher: any, proxyThis: any) {
  if (!isProxy(obj)) {
    return
  }

  const handler: any = {}
  if (isFunction(userDef)) {
    handler.get = createComputedGetter(watcher)
    handler.set = noop
  } else if (isObject(userDef)) {
    handler.get = createComputedGetter(watcher)
    handler.set = userDef.set || noop
  }

  defineProxyObject(obj, key, {
    get(target, key) {
      return handler.get()
    },
    set(target, key, newVal) {
      handler.set.call(proxyThis, newVal)
      return true
    }
  })
}

function createComputedGetter(watcher: Watch) {
  return function computedGetter() {
    if (watcher) {
      // 计算值
      watcher.evaluate()
      // 将computed-dep添加watch对象
      Dep.Target && watcher.depend()

      return watcher.value
    }
  }
}
