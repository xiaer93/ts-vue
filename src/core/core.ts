import {
  CreateElement,
  VueConfig,
  VNode,
  VNodeMethod,
  VNodeData,
  VNodeComputed,
  VNodeWatch
} from '../type/index'
import { createElement } from './vnode'
import Observe from './observer/observe'
import patch from '../web/index'
import webMethods from '../web/dom'
import Dep from './observer/dep'
import Watch from './observer/watch'
import { noop } from '../helper/utils'
import { isPrimitive } from 'util'

interface ComputedWatch {
  [key: string]: Watch
}

let proxyKey: any = {}
let computedWatched: ComputedWatch = {}

class Vue {
  private _vnode: VNode | null | undefined
  private _render: (h: CreateElement) => VNode
  private _config: VueConfig
  private _data?: VNodeData
  private _method?: VNodeMethod
  private _computed?: VNodeComputed
  private _watch?: VNodeWatch
  private _thisProxy: any // 指向proxy代理之后的对象

  public el: string

  constructor(config: VueConfig) {
    this.el = config.el
    this._render = config.render
    this._config = config
  }
  _init(thisProxy: any) {
    const config = this._config
    this._thisProxy = thisProxy
    this._initMethods(config)
    this._initData(config)
    this._initComputed(config)
    this._initWatch(config)

    let oldVnode: VNode | null = createNodeAt(this.el)
    this._vnode = oldVnode

    if (!oldVnode) {
      console.warn('必须要有可挂载的节点')
    } else {
      const self = this
      const updateComponent = () => {
        self._update(self.render())
      }
      new Watch(this._thisProxy, updateComponent, noop)
    }
  }
  render(): VNode {
    createElement.context = this
    let vnode: VNode = this._render(createElement)
    console.log(vnode)
    return vnode
  }
  _update(vnode: VNode) {
    let oldVnode: VNode = this._vnode!
    this._vnode = vnode
    patch(oldVnode, vnode)
  }
  private _initData(config: VueConfig) {
    this._data = config.data && config.data()

    this._data = defineKey(this._data)
    for (let key in this._data) {
      if (proxyKey[key]) {
        console.warn('data的key不合法')
      } else {
        proxyKey[key] = this._data
        // this._data[key] = defineKey(this._data[key])
      }
    }
  }
  private _initMethods(config: VueConfig) {
    this._method = config.method

    for (let key in this._method) {
      proxyKey[key] = this._method
    }
  }
  private _initComputed(config: VueConfig) {
    this._computed = config.computed

    for (let key in this._computed) {
      computedWatched[key] = new Watch(this._thisProxy, this._computed[key], noop, {
        computed: true
      })
      proxyKey[key] = this._computed
    }
  }
  private _initWatch(config: VueConfig) {
    this._watch = config.watch

    for (let key in this._watch) {
      new Watch(this, key, this._watch[key], { user: true })
    }
  }
}

function createNodeAt(selectorText: string): VNode | null {
  let elNode = webMethods.query(selectorText)
  if (!elNode) {
    return null
  } else {
    let vnode: VNode = createElement(elNode!.nodeName)
    vnode.elm = elNode
    return vnode
  }
}

// 将data设为响应式的，data可以为数组、对象
// proxy对象，所有的操作都会被拦截

// 对数组 [].push(1)，会触发2次set，key为0， length
function defineKey(data: any) {
  let dep = new Dep()

  let proxyData = new Proxy(data, {
    get(target, key, receiver) {
      // fixme: 如何优化性能？
      // 1. 如何避免数组多次收集依赖，dep和watch不存储重复对象
      // 2. 将watch推入队列，异步执行（相同watch不重复推入）
      Dep.Target && dep.depend()
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      // 如果给传入的值复制对象，则继续添加依赖。添加的依赖watch怎么收集的？还是原有就有？
      // 继续收集依赖，Dep.Target有render-watch托底，即每次可以给新的依赖添加watch
      if (!isPrimitive(value)) {
        value = defineKey(value)
      }
      let flag = Reflect.set(target, key, value, receiver)
      dep.notify()
      return flag
    }
  })

  for (let key in data) {
    let value = data[key]
    if (!isPrimitive(value)) {
      data[key] = defineKey(value)
    }
  }

  return proxyData
}

/**
 * fixme: 此处改为Proxy，如何进行？
 */
function setProxy(vm: Vue) {
  return new Proxy(vm, {
    get(target, key, receiver) {
      if (key in proxyKey) {
        console.log(key)
        if (key in computedWatched) {
          // computed属性
          let watch = computedWatched[key as string]
          // 计算值
          watch.evaluate()
          // 将computed-dep添加watch对象
          Dep.Target && watch.depend()
          return watch.value
        }
        return Reflect.get(proxyKey[key], key, receiver)
      }
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      if (key in proxyKey) {
        console.log(key, proxyKey[key])
        // fixme: receiver值得是什么鬼？
        return Reflect.set(proxyKey[key], key, value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}

// 代理Vue的实例，访问实例时指向新的地址！！！
const ProxyVue = new Proxy(Vue, {
  construct(target, argumentsList, newTarget) {
    let vm = new target(...argumentsList)
    let pvm = setProxy(vm)

    pvm._init(pvm)

    return pvm
  }
})

export default ProxyVue

// const source = '_data'
// const ProxyVue = new Proxy({}, {
//   construct(target, argumentsList, newTarget) {

//   },
//      get (target: any, key, receiver) {
//        if(key in target[source]) {
//          return Reflect.get(target[source]['_ob'], key, receiver)
//        } else {
//          return Reflect.get(target, key, receiver)
//        }
//     },
//      set(target: any, key, value, receiver) {
//        if(key in target[source]) {
//          return Reflect.set(target[source]['_ob'], key, value, receiver)
//        } else {
//          return Reflect.set(target, key, value, receiver)
//        }
//      }
// })

// export default ProxyVue

// function setProxy(vm: Vue, source: string, data: any) {
//   return new Proxy(vm, {
//     get (target: any, key, receiver) {
//       if(key in target[source]) {
//         return Reflect.get(target[source]['_ob'], key, receiver)
//       } else {
//         return Reflect.get(target, key, receiver)
//       }
//     },
//     set(target: any, key, value, receiver) {
//       if(key in target[source]) {
//         return Reflect.set(target[source]['_ob'], key, value, receiver)
//       } else {
//         return Reflect.set(target, key, value, receiver)
//       }
//     }
//   })
// }
