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

export function isDef(val: any): val is undefined {
  return !isUnDef(val)
}

export function isUnDef(val: any): boolean {
  return getType(val) === '[object Undefined]'
}

export function isPrimitive(val: any): val is string | number {
  return ['string', 'number'].includes(typeof val)
}

export function noop() {}

function getType(val: any): string {
  return Object.prototype.toString.call(val)
}
