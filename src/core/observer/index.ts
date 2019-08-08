import Dep from './dep'
import { isPrimitive } from '../../helper/utils'
import { VueClass, Vue } from '../../type'
import { merge } from '../../helper/merge'
import { GlobalComponents } from '../component'

// 将data设为响应式的，data可以为数组、对象
// proxy对象，所有的操作都会被拦截
// 对数组 [].push(1)，会触发2次set，key为0， length
export function observe(data: any) {
  if (isPrimitive(data)) {
    return data
  }

  let dep = new Dep()

  let proxyData = new Proxy(data, {
    get(target, key) {
      Dep.Target && dep.depend()
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      // 如果给传入的值复制对象，则继续添加依赖。添加的依赖watch怎么收集的？还是原有就有？
      // 继续收集依赖，Dep.Target有render-watch托底，即每次可以给新的依赖添加watch
      if (!isPrimitive(value)) {
        value = observe(value)
      }
      const retStatus = Reflect.set(target, key, value)
      dep.notify()
      return retStatus
    }
  })

  for (let key in data) {
    let value = data[key]
    data[key] = observe(value)
  }

  return proxyData
}

export function createVueProxy(Vue: VueClass) {
  // 创建销毁对象
  // let ret: any = {
  //   proxy: null,
  //   revoke: null
  // }

  return new Proxy(Vue, {
    construct(target, argumentsList, newTarget) {
      const options = merge(argumentsList[0], { components: GlobalComponents })

      let vm = new target(options)
      let pvmObj = setProxy(vm)
      let pvm = pvmObj.proxy
      // ret.revoke = pvmObj.revoke

      // 传入proxyThis，获取代理后的对象
      pvm._init(pvm)
      return pvm
    }
  })

  // return ret
}

// 代理实例对象
function setProxy(vm: Vue) {
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
