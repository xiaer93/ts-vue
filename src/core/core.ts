import { CreateElement, VueConfig, VNode } from '../type/index'
import { createElement } from './vnode'
import Observe from './observer/Obersve'
import patch from '../web/index'
import webMethods from '../web/dom'
import Dep from './observer/Dep'
import Watch from './watch'
import { noop } from '../helper/utils'
import { isPrimitive } from 'util'

class Vue {
  private el: string
  private render: (h: CreateElement) => VNode
  public _data?: any
  private _vnode: VNode | null | undefined

  constructor(config: VueConfig) {
    this.el = config.el
    this.render = config.render

    this._data = config.data && config.data()

    this.initData()
  }
  _init() {
    let oldVnode: VNode | null = createNodeAt(this.el)
    this._vnode = oldVnode

    if (!oldVnode) {
      console.warn('必须要有可挂载的节点')
    } else {
      const self = this
      const updateComponent = () => {
        self._update(self._render())
      }
      new Watch(this, updateComponent, noop)
    }
  }
  _render(): VNode {
    let vnode: VNode = this.render(createElement)
    return vnode
  }
  _update(vnode: VNode) {
    let oldVnode: VNode = this._vnode!
    this._vnode = vnode
    patch(oldVnode, vnode)
  }
  initData() {
    if (!this._data || this._data._ob) return

    for (let key in this._data) {
      this._data[key] = defineKey(this._data[key])
    }

    // this._data._ob =
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
  dep.v = data

  let proxyData = new Proxy(data, {
    get(target, key, receiver) {
      if (Dep.Target) {
        // fixme: 如何避免数组多次收集依赖？dep和watch不存储相同的对象
        Dep.Target && dep.depend()
      }
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
      if (key in vm._data) {
        return Reflect.get(target._data, key, receiver)
        // target._data._ob[key]
      }
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      //
      if (key in vm._data) {
        target._data._ob[key] = value
        return false
      } else {
        return Reflect.set(target._data, key, value, receiver)
      }
    }
  })
}

const ProxyVue = new Proxy(Vue, {
  construct(target, argumentsList, newTarget) {
    let vm = new target(...argumentsList)
    let pvm = setProxy(vm)

    console.log(pvm)

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
