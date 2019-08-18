import Dep from './dep'
import { isPrimitive, isFalse, always, hasOwn, isDef, isArray } from '../../helper/utils'
import { VueClass, Vue } from '../../type'
import { merge } from '../../helper/merge'
import { GlobalComponents } from '../component'
import { createProxy, isProxy, defineProxyKey, defineProxyArray } from './cProxy'

// 将data设为响应式的，data可以为数组、对象
// proxy对象，所有的操作都会被拦截
// 对数组 [].push(1)，会触发2次set，key为0， length

// observe创建响应式对象
export function observe(obj: any) {
  if (isPrimitive(obj) || isProxy(obj)) {
    return obj
  }

  let proxyObj = createProxy(obj)

  if (isArray(obj)) {
    defineProxyArray(obj, {})
  } else {
    for (let key in obj) {
    }
  }

  // let proxyData = new Proxy(data, {
  //   get(target, key) {
  //     Dep.Target && dep.depend()
  //     return Reflect.get(target, key)
  //   },
  //   set(target, key, value) {
  //     // 如果给传入的值复制对象，则继续添加依赖。添加的依赖watch怎么收集的？还是原有就有？
  //     // 继续收集依赖，Dep.Target有render-watch托底，即每次可以给新的依赖添加watch
  //     if (!isPrimitive(value)) {
  //       value = observe(value)
  //     }
  //     const retStatus = Reflect.set(target, key, value)
  //     dep.notify()
  //     return retStatus
  //   }
  // })

  // for (let key in data) {
  //   let value = data[key]
  //   data[key] = observe(value)
  // }

  return proxyData
}

// 代理实例对象
// data-computed-props-attrs-domProps等，有的可以set和get，有的只允许get
export function setProxy(vm: Vue) {
  const proxyKey = vm._proxyKey
  const computedWatched = vm._computedWatched
  return Proxy.revocable(vm, {
    get(target, key, receiver) {
      if (key in proxyKey) {
        if (key in computedWatched) {
          // computed属性
          let watch = computedWatched[key as string]
          // 计算值
          watch.evaluate()
          // 将computed-dep添加watch对象
          Dep.Target && watch.depend()
          return watch.value
        }
        return Reflect.get(proxyKey[key as string], key, receiver)
      }
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      if (key in proxyKey) {
        // fixme: receiver值得是什么鬼？
        return Reflect.set(proxyKey[key as string], key, value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}

// 给响应式对象添加响应式属性值
export function defineReactive(
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

  defineProxyKey(obj, key, {
    get(target, key) {
      Dep.Target && dep.depend()
      return val
    },
    set(target, key, newVal) {
      if (val === newVal || newVal === val.__originObj) return false

      if (customSetter) {
        return customSetter()
      }

      newVal = shallow ? newVal : observe(newVal)
      val = newVal
      dep.notify()
    }
  })

  // let proxyData = createProxy(data, {
  //   get(target, key) {
  //     Dep.Target && dep.depend()
  //     val = Reflect.get(target, key)
  //     return val
  //   },
  //   set(target, key, newVal) {
  //     // 如果给传入的值复制对象，则继续添加依赖。添加的依赖watch怎么收集的？还是原有就有？
  //     // 继续收集依赖，Dep.Target有render-watch托底，即每次可以给新的依赖添加watch
  //     if(val === newVal) return false

  //     customSetter && customSetter()

  //     newVal = shallow ? newVal : observe(newVal)
  //     const retStatus = Reflect.set(target, key, newVal)
  //     dep.notify()
  //     return retStatus
  //   }
  // })

  // return proxyData
}
