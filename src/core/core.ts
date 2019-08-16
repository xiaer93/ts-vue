import {
  Vue,
  VueOptions,
  VNode,
  ProxyKey,
  ComputedWatch,
  VueHookMethod,
  VueStatus,
  VNodeDirectiveMethod,
  VueRefs,
  VueSlots
} from '../type/index'
import { createNodeAt, makeCreateElement } from './vnode'
import { observe } from './observer'
import patch from './web/index'
import webMethods from './web/dom'
import Watch from './observer/watch'
import { noop, isTruth, isFunction, isArray, isNode, isUndef, curry } from '../helper/utils'
import { warn, invokeWithErrorHandling } from '../helper/warn'
import { callhook } from '../helper/hook'
import nextTick from '../helper/next-tick'
import { updateComponentListeners } from './component/events'
import { resolveSlot } from './slot'

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
  static cid: number
  static directive: (key: string, options: VNodeDirectiveMethod) => void
  static component: (key: string, options: VueOptions) => void
  static extend: (vue: VueOptions) => Vue

  private _userRender: (h: any) => VNode
  private _proxyThis: any // 指向proxy代理之后的对象
  private _events: any

  public _vnode: VNode | null | undefined
  public _watcher?: Watch
  public _proxyKey: ProxyKey
  public _computedWatched: ComputedWatch

  public $el: Node | null | undefined
  public $status: VueStatus
  public $options: VueOptions
  public $createElement: any
  public $refs: VueRefs
  public $vnode?: VNode
  public $slots?: VueSlots
  public $scopedSlots?: any

  constructor(options: VueOptions) {
    console.log('oooooooo:', options)
    this._userRender = options.render
    this.$refs = {}
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
    // proxyVue.revoke()
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
  public $mount(el: Node | string) {
    this.$el = isNode(el) ? el : webMethods.query(el)
    this._mount()
  }
  public $on(event: string | Array<string>, fn: Function): Vue {
    const vm: Vue = this

    if (isArray(event)) {
      for (let i = 0, len = event.length; i < len; ++i) {
        vm.$on(event[i], fn)
      }
    } else {
      ;(vm._events[event] || (vm._events[event] = [])).push(fn)
      // fixme: hookEvent是？
    }

    return vm
  }
  public $off(event?: string | Array<string>, fn?: Function): Vue {
    const vm: Vue = this

    if (isUndef(event)) {
      vm._events = Object.create(null)
      return vm
    }

    if (Array.isArray(event)) {
      for (let i = 0, len = event.length; i < len; ++i) {
        vm.$off(event[i], fn)
      }
      return vm
    }

    const eventFns = vm._events[event]
    if (!isArray(eventFns)) {
      return vm
    }
    if (isUndef(fn)) {
      vm._events[event] = null
      return vm
    }

    for (let i = 0, len = eventFns.length; i < len; ++i) {
      if (eventFns[i] === fn) {
        eventFns.splice(i, 1)
        break
      }
    }

    return vm
  }
  public $emit(event: string, ...args: any[]): Vue {
    const vm: Vue = this

    const eventFns: Array<Function> = vm._events[event]
    if (eventFns) {
      const info = `event handler for "${event}"`
      for (let i = 0, len = eventFns.length; i < len; ++i) {
        invokeWithErrorHandling(eventFns[i], args, vm)
      }
    }

    return vm
  }

  public _t(
    name: string,
    fallback?: Array<VNode>,
    props?: any,
    bindObject?: any
  ): Array<VNode> | undefined {
    const scopedSlotFn = this.$scopedSlots[name]

    let nodes: Array<VNode> | undefined
    if (scopedSlotFn) {
      props = props || {}
      nodes = scopedSlotFn(props) || fallback
    } else {
      nodes = this.$slots[name] || fallback
    }
    return nodes
  }
  public _u = resolveScopedSlots

  // 指定代理后的Vue实例，通过代理后的实例才能访问到data、computed、methods等等
  public _init(thisProxy: any) {
    const options = this.$options
    this._proxyThis = thisProxy
    this.$createElement = makeCreateElement(thisProxy)

    if (options.isComponent) {
      this._initComponent()
    }

    this._initState()

    if (!options.isComponent) {
      this.$mount(options.el)
    }
  }
  private _initComponent() {
    const opts = this.$options
    const parentVnode = this.$options.parentVnode

    // 将vnode的信息整合至$options
    const vnodeComponentOptions = parentVnode.componentOptions
    opts.propsData = vnodeComponentOptions.propsData
    opts._parentListeners = vnodeComponentOptions.listeners
    opts._renderChildren = vnodeComponentOptions.children
  }
  private _mount() {
    const elm = this.$el
    const options = this.$options
    if (isUndef(this._vnode) && elm) {
      let oldVnode: VNode | null = elm ? createNodeAt(elm) : null
      this._vnode = oldVnode
    }

    if (!isTruth(this._vnode) && !options.isComponent) {
      warn('必须要有可挂载的节点')
    }

    const vm = this
    const updateComponent = () => {
      this._update(this._render())
    }
    this._watcher = new Watch(this._proxyThis, updateComponent, noop, {
      before() {
        if (vm.$status.isMounted && !vm.$status.isDestroyed) {
          callhook(vm._proxyThis, 'beforeUpdate')
        }
      }
    })

    this.$status.isMounted = true
    callhook(this._proxyThis, 'mounted')
  }
  private _initState() {
    this._initHook()

    callhook(this._proxyThis, 'beforeCreate')
    this._initRender()
    this._initEvent()
    this._initProps()
    this._initMethods()
    this._initData()
    this._initComputed()
    this._initWatch()
    callhook(this._proxyThis, 'created')
  }
  private _render(): VNode {
    return this._userRender(this.$createElement)
  }
  private _update(vnode: VNode | null) {
    let oldVnode: VNode = this._vnode!
    this._vnode = vnode

    this.$el = patch(oldVnode, vnode)
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
  public _initProps() {
    let proxyProp: any
    const propsData = this.$options.propsData

    if (!isTruth(propsData)) {
      return
    }

    this.$options.propsData = proxyProp = observe(propsData)
    for (let key in propsData) {
      this._proxyKey[key] = proxyProp
    }
  }
  private _initMethods() {
    const methods = this.$options.methods

    for (let key in methods) {
      this._proxyKey[key] = methods
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
  private _initEvent() {
    this._events = Object.create(null)
    // _parentListeners父组件挂载的事件
    const listeners = this.$options._parentListeners
    if (listeners) {
      updateComponentListeners(this, listeners)
    }
  }
  private _initRender() {
    const options = this.$options
    const parentVnode: VNode = (this.$vnode = options.parentVnode)
    const renderContext = parentVnode && parentVnode.context
    this.$slots = resolveSlot(options._renderChildren, renderContext)

    this.$scopedSlots = (parentVnode && parentVnode.data.scopedSlots) || {}
  }
}

export default VueReal

function resolveScopedSlots(fns: any, res: any) {
  res = res || {}
  for (let i = 0, len = fns.length; i < len; ++i) {
    if (isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn
    }
  }

  return res
}
