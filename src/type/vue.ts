import { CreateElement, VNode, VNodeMethod } from './vnode'

export interface Vue {}

export interface VueInstance {}

export interface VueConfig {
  el: string
  render: (h: CreateElement) => VNode

  data: () => any
  method?: VNodeMethod
}

export interface VueInstance {}
