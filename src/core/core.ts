import {
  Vue,
  CreateVnode,
  VueOptions,
  VNode,
  ProxyKey,
  ComputedWatch,
  VueHookMethod,
  VueStatus
} from '../type/index'
import { createVnode, createNodeAt } from './vnode'
import { observe, createVueProxy } from './observer'
import patch from './web/index'
import webMethods from './web/dom'
import Watch from './observer/watch'
import { noop, isTruth, isFunction, isArray } from '../helper/utils'
import { warn } from '../helper/warn'
import { callhook } from '../helper/hook'
import nextTick from '../helper/next-tick'

const hooks: Array<VueHookMethod> = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'update',
  'boforeDestroy',
  'destroyed'
]

let proxyVue: any

class VueReal implements Vue {
  private _vnode: VNode | null | undefined
  private _userRender: (h: CreateVnode) => VNode
  private _proxyThis: any // 指向proxy代理之后的对象

  public _watcher?: Watch
  public _proxyKey: ProxyKey
  public _computedWatched: ComputedWatch

  public $status: VueStatus
  public $options: VueOptions

  constructor(options: VueOptions) {
    this._userRender = options.render
    this.$options = options
    this.$status = {
      isBeingDestroyed: false,
      isMounted: false,
      isDestroyed: false
    }

    this._proxyKey = {}
    this._computedWatched = {}
  }
  public $destroy() {
    if (this.$status.isBeingDestroyed) return

    callhook(this, 'boforeDestroy')

    this.$status.isBeingDestroyed = true
    if (this._watcher) {
      this._watcher.teardown()
    }
    this._update(null)
    proxyVue.revoke()
    this.$status.isDestroyed = true

    callhook(this, 'destroyed')
  }
  public $forceUpdate() {
    // 强制渲染不使用nextTick
    this._watcher && this._watcher.update()
  }
  public $nextTick(fn?: Function): Promise<any> | undefined {
    return nextTick(fn, this)
  }
  public _init(thisProxy: any) {
    const options = this.$options
    this._proxyThis = thisProxy
    this._initHook()

    callhook(this, 'beforeCreate')
    this._initMethods()
    this._initData()
    this._initComputed()
    this._initWatch()
    callhook(this, 'created')

    const elm: Node | null = webMethods.query(options.el)
    let oldVnode: VNode | null = elm ? createNodeAt(elm) : null
    this._vnode = oldVnode

    const vm = this
    if (!isTruth(oldVnode)) {
      warn('必须要有可挂载的节点')
    } else {
      const updateComponent = () => {
        this._update(this._render())
      }
      this._watcher = new Watch(this._proxyThis, updateComponent, noop, {
        before() {
          if (vm.$status.isMounted && !vm.$status.isDestroyed) {
            callhook(vm, 'beforeUpdate')
          }
        }
      })

      this.$status.isMounted = true
      callhook(this, 'mounted')
    }
  }
  private _render(): VNode {
    createVnode.context = this
    return this._userRender(createVnode)
  }
  private _update(vnode: VNode | null) {
    let oldVnode: VNode = this._vnode!
    this._vnode = vnode
    patch(oldVnode, vnode)
  }
  private _initData() {
    // data如果为函数，则执行有可能会get？
    let proxyData: any
    let data: any = this.$options.data
    data = this.$options.data = isFunction(data) ? data() : data

    for (let key in data) {
      if (this._proxyKey[key]) {
        warn('data的key不合法')
      }
    }
    this.$options.data = proxyData = observe(data)
    for (let key in data) {
      this._proxyKey[key] = proxyData
    }
  }
  private _initMethods() {
    const method = this.$options.method

    for (let key in method) {
      this._proxyKey[key] = method
    }
  }
  private _initComputed() {
    const computed = this.$options.computed

    for (let key in computed) {
      if (this._proxyKey[key]) {
        warn('computed的key不合法')
      } else {
        this._computedWatched[key] = new Watch(this._proxyThis, computed[key], noop, {
          computed: true
        })
        this._proxyKey[key] = computed
      }
    }
  }
  private _initWatch() {
    const watch = this.$options.watch

    for (let key in watch) {
      new Watch(this, key, watch[key], { user: true })
    }
  }
  private _initHook() {
    for (let h of hooks) {
      const vueHooks = this.$options[h]
      this.$options[h] = isArray(vueHooks) ? vueHooks : isFunction(vueHooks) ? [vueHooks] : []
    }
  }
}

proxyVue = createVueProxy(VueReal)

export default proxyVue.proxy
