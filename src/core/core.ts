import { CreateElement, VueConfig, VNode } from '../type/index'
import { createElement } from './vnode'
import Observe from './Obersve'
import patch from './patch'
import webMethods from '../web/dom'
import Dep from './dep'
import Watch from './watch'
import { noop } from '../helper/utils'

export default class Vue {
  private el: string
  private render: (h: CreateElement) => VNode
  private _data?: any
  private _vnode: VNode | null | undefined

  constructor(config: VueConfig) {
    this.el = config.el
    this.render = config.render

    this._data = config.data && config.data()

    setProxy(this, '_data', this._data)
    this.initData()

    this._init()
  }
  _init() {
    let oldVnode: VNode | null = createNodeAt(this.el)
    this._vnode = oldVnode

    if (!oldVnode) {
      console.warn('必须要有可挂载的节点')
    } else {
      const self = this
      const updateComponent = () => {
        self._render(self._update.bind(this))
      }
      new Watch(this, updateComponent, noop)
    }
  }
  _render(cb) {
    console.log('nnnnnnn', this.name, this._data._ob.name)
    let vnode: VNode = this.render(createElement)
    console.log(vnode)
    cb(vnode)
  }
  _update(vnode: VNode) {
    let oldVnode: VNode = this._vnode!
    this._vnode = vnode
    patch(oldVnode, vnode)
  }
  initData() {
    if (!this._data) return
    // let ob = this._data._ob || new Observe(this)
    this._data._ob = defineKey(this._data)
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

function defineKey(data: any) {
  let dep = new Dep()

  return new Proxy(data, {
    get(target, key, receiver) {
      Dep.Target && dep.depend()
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      let flag = Reflect.set(target, key, value, receiver)
      dep.notify()
      return flag
    }
  })
}

/**
 * fixme: 此处改为Proxy，如何进行？
 */
function setProxy(vm: Vue, source: string, data: any) {
  for (let key in data) {
    Object.defineProperty(vm, key, {
      get() {
        return vm[source]['_ob'][key]
      },
      set(newVal) {
        vm[source]['_ob'][key] = newVal
      }
    })
  }
}

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
