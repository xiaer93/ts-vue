import {
  CreateVnode,
  VueConfig,
  VNode,
  VNodeMethod,
  VNodeData,
  VNodeComputed,
  VNodeWatch,
  ProxyKey,
  ComputedWatch
} from '../type/index'
import { createVnode, createNodeAt } from './vnode'
import { observe, createVueProxy } from './observer'
import patch from './web/index'
import webMethods from './web/dom'
import Watch from './observer/watch'
import { noop, isTruth } from '../helper/utils'
import { warn } from '../helper/warn'

class Vue {
  private _vnode: VNode | null | undefined
  private _userRender: (h: CreateVnode) => VNode
  private _config: VueConfig
  private _data?: VNodeData
  private _method?: VNodeMethod
  private _computed?: VNodeComputed
  private _watch?: VNodeWatch
  private _proxyThis: any // 指向proxy代理之后的对象

  public _proxyKey: ProxyKey
  public _computedWatched: ComputedWatch

  constructor(config: VueConfig) {
    this._userRender = config.render
    this._config = config

    this._proxyKey = {}
    this._computedWatched = {}
  }
  public _init(thisProxy: any) {
    const config = this._config
    this._proxyThis = thisProxy
    this._initMethods(config)
    this._initData(config)
    this._initComputed(config)
    this._initWatch(config)

    const elm: Node | null = webMethods.query(config.el)
    let oldVnode: VNode | null = elm ? createNodeAt(elm) : null
    this._vnode = oldVnode

    if (!isTruth(oldVnode)) {
      warn('必须要有可挂载的节点')
    } else {
      const updateComponent = () => {
        this._update(this._render())
      }
      new Watch(this._proxyThis, updateComponent, noop)
    }
  }
  private _render(): VNode {
    createVnode.context = this
    return this._userRender(createVnode)
  }
  private _update(vnode: VNode) {
    let oldVnode: VNode = this._vnode!
    this._vnode = vnode
    patch(oldVnode, vnode)
  }
  private _initData(config: VueConfig) {
    // data如果为函数，则执行有可能会get？
    let proxyData: VNodeData
    this._data = config.data && config.data()

    for (let key in this._data) {
      if (this._proxyKey[key]) {
        warn('data的key不合法')
      }
    }
    this._data = proxyData = observe(this._data)
    for (let key in this._data) {
      this._proxyKey[key] = proxyData
    }
  }
  private _initMethods(config: VueConfig) {
    this._method = config.method

    for (let key in this._method) {
      this._proxyKey[key] = this._method
    }
  }
  private _initComputed(config: VueConfig) {
    this._computed = config.computed

    for (let key in this._computed) {
      if (this._proxyKey[key]) {
        warn('computed的key不合法')
      } else {
        this._computedWatched[key] = new Watch(this._proxyThis, this._computed[key], noop, {
          computed: true
        })
        this._proxyKey[key] = this._computed
      }
    }
  }
  private _initWatch(config: VueConfig) {
    this._watch = config.watch

    for (let key in this._watch) {
      new Watch(this, key, this._watch[key], { user: true })
    }
  }
}

export default createVueProxy(Vue)
