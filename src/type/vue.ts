import { CreateVnode, VNode, VNodeMethod, VNodeComputed, VNodeWatch, VNodeData } from './vnode'
import { Watch } from './watch'

export interface ComputedWatch {
  [key: string]: Watch
}

export interface ProxyKey {
  [key: string]: VNodeData | VNodeMethod | VNodeComputed
}

export interface Vue {
  _proxyKey: ProxyKey
  _computedWatched: ComputedWatch

  _init: (thisProxy: any) => void
}

export interface VueClass {
  new (config: VueConfig): Vue
}

export interface VueClassStaic extends Vue {}

export interface VueConfig {
  el: string
  render: (h: CreateVnode) => VNode

  data?: () => any
  method?: VNodeMethod
  computed?: VNodeComputed
  watch?: VNodeWatch
}
