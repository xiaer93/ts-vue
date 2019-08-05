import { CreateElement, VNode } from './vnode'

export interface Vue {}

export interface VueInstance {}

export interface VueConfig {
  el: string
  render: (h: CreateElement) => VNode

  data: () => any
}

export interface VueInstance {}
