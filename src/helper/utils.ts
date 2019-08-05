import { VNode } from '../type'

export function isArray(val: any): val is Array<any> {
  return Array.isArray(val)
}

export function isFunction(val: any): val is Function {
  return getType(val) === '[object Function]'
}

export function isSameVnode(oldVnode: VNode, vnode: VNode): boolean {
  return oldVnode.tag === vnode.tag
}

export function noop() {}

function getType(val: any): string {
  return Object.prototype.toString.call(val)
}
