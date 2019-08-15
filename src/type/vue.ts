import { VNode, VNodeMethod, VNodeComputed, VNodeWatch, VNodeData } from './vnode'
import { Watch } from './watch'
import { create } from 'domain'

export type VueHookMethod =
  | 'beforeCreate'
  | 'created'
  | 'beforeMount'
  | 'mounted'
  | 'beforeUpdate'
  | 'update'
  | 'boforeDestroy'
  | 'destroyed'

type VueHookFunction = Function | Array<Function>

export interface ComputedWatch {
  [key: string]: Watch
}

export interface ProxyKey {
  [key: string]: VNodeData | VNodeMethod | VNodeComputed
}

export interface Vue {
  _events: any

  _proxyKey: ProxyKey
  _computedWatched: ComputedWatch

  _watcher?: Watch
  _init: (thisProxy: any) => void

  $options: VueOptions
  $status: VueStatus
  $refs: VueRefs

  $createElement: (a: any, b: any, c: any) => VNode
  $destroy: () => void
  $forceUpdate: () => void
  $nextTick: (fn?: Function) => Promise<any> | undefined
  $mount: (elm: Node) => void
  $on: (event: string | Array<string>, fn: Function) => Vue
  $off: (event?: string | Array<string>, fn?: Function) => Vue
  $once: (event?: string | Array<string>, fn?: Function) => Vue
  $emit: (event: string, ...args: any[]) => Vue
}

export interface VueClass {
  cid: number
  new (options: VueOptions): Vue
}

export interface VueClassStaic extends Vue {}

export interface VueOptions {
  el: string
  render: (h: any) => VNode

  components?: Array<Vue>

  data?: () => any
  props?: any
  methods?: VNodeMethod
  computed?: VNodeComputed
  watch?: VNodeWatch
  beforeCreate?: VueHookFunction
  created?: VueHookFunction
  beforeMount?: VueHookFunction
  mounted?: VueHookFunction
  beforeUpdate?: VueHookFunction
  update?: VueHookFunction
  boforeDestroy?: VueHookFunction
  destroyed?: VueHookFunction

  [key: string]: any
}

export interface VueStatus {
  isBeingDestroyed: boolean
  isMounted: boolean
  isDestroyed: boolean
}

export interface VueRefs {
  [key: string]: Array<Element> | Element | undefined
}
