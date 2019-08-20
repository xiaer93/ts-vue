import { VNode, VNodeMethod, VNodeComputed, VNodeWatch, VNodeData } from './vnode'
import { Watch } from './watch'

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

export interface Vue {
  _computedWatched: ComputedWatch
  _watcher?: Watch

  $options: VueOptions
  $status: VueStatus
  $refs: VueRefs
  $slots?: VueSlots
  $vnode?: VNode

  $createElement: (a: any, b: any, c: any) => VNode
  $destroy: () => void
  $forceUpdate: () => void
  $nextTick: (fn?: Function) => Promise<any> | undefined
  $mount: (elm: Node) => void
  $on: (event: string | Array<string>, fn: Function) => Vue
  $off: (event?: string | Array<string>, fn?: Function) => Vue
  $once: (event?: string | Array<string>, fn?: Function) => Vue
  $emit: (event: string, ...args: any[]) => Vue

  $watch: (key: string, fn: (newValue?: any, oldValue?: any) => void) => void

  _t: RenderSlot

  [key: string]: any
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

  data?: VueData
  props?: any
  methods?: VueMethod
  computed?: VueComputed
  watch?: VueWatch
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

export interface VueData {
  (): Object
  [key: string]: Object
}

export interface VueMethod extends VNodeMethod {}
export interface VueWatch extends VNodeWatch {}
export interface VueComputed {
  [key: string]: VueComputedMethod
}

export type VueComputedMethod = StrategyMethod | Function

export interface VueStatus {
  isBeingDestroyed: boolean
  isMounted: boolean
  isDestroyed: boolean
}

export interface VueRefs {
  [key: string]: Array<Element> | Element | undefined
}

export interface VueSlots {
  [key: string]: Array<VNode>
}

// render方法
export interface RenderSlot {
  (name: string, fallback?: Array<VNode>, props?: any, bindObject?: any): Array<VNode> | undefined
}

export interface Strategy {
  [key: string]: StrategyMethod | null
}
export interface StrategyMethod {
  get: (target: any, key: string) => any
  set: (target: any, key: string, val: any) => any
}
