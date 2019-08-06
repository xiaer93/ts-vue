import { CreateElement, VueConfig, VNode, VNodeMethod, VNodeData } from '../type/index'
import { createElement } from './vnode'
import Observe from './observer/observe'
import patch from '../web/index'
import webMethods from '../web/dom'
import Dep from './observer/dep'
import Watch from './observer/watch'
import { noop } from '../helper/utils'
import { isPrimitive } from 'util'

let proxyKey: any = {}

class Vue {
  private _vnode: VNode | null | undefined
  private _render: (h: CreateElement) => VNode
  private _data?: VNodeData
  private _method?: VNodeMethod

  public el: string

  constructor(config: VueConfig) {
    this.el = config.el
    this._render = config.render

    this._initMethods(config)
    this._initData(config)
  }
  _init() {
    let oldVnode: VNode | null = createNodeAt(this.el)
    this._vnode = oldVnode

    if (!oldVnode) {
      console.warn('必须要有可挂载的节点')
    } else {
      const self = this
      const updateComponent = () => {
        self._update(self.render())
      }
      new Watch(this, updateComponent, noop)
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

    for (let key in this._data) {
      if (proxyKey[key]) {
        console.warn('data的key不合法')
      } else {
        proxyKey[key] = this._data
        this._data[key] = defineKey(this._data[key])
      }
    }
  }
  private _initMethods(config: VueConfig) {
    this._method = config.method

    for (let key in this._method) {
      proxyKey[key] = this._method
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
        return Reflect.get(proxyKey[key], key, receiver)
        // target._data._ob[key]
      }
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      if (key in proxyKey) {
        return Reflect.set(proxyKey[key], key, value, receiver)
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    }
  })
}

const ProxyVue = new Proxy(Vue, {
  construct(target, argumentsList, newTarget) {
    let vm = new target(...argumentsList)
    let pvm = setProxy(vm)

    pvm._init()

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
