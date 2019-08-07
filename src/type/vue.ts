import { CreateElement, VNode, VNodeMethod } from './vnode'

export interface Vue {}

export interface VueInstance {}

export interface VNodeComputed {
  [key: string]: () => void
}
export interface VNodeWatch {
  [key: string]: Function
}

export interface VueConfig {
  el: string
  render: (h: CreateElement) => VNode

  data: () => any
  method?: VNodeMethod
  computed?: VNodeComputed
  watch?: VNodeWatch
}

export interface VueInstance {}
