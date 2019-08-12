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
  return getType(val) !== '[object Undefined]'
}

export function isUndef(val: any): boolean {
  return !isDef(val)
}

export function isPrimitive(val: any): val is string | number {
  return !['object', 'function'].includes(typeof val) || val === null
}

export function isTruth(val: any): boolean {
  return isDef(val) && val != null
}

export function isTrue(val: any): val is true {
  return val === true
}

export function isObject(val: any): val is object {
  return val !== null && typeof val === 'object'
}

export function isPlainObject(val: any): val is object {
  return getType(val) === '[object Object]'
}

export function isNode(val: any): val is Node {
  return val && val.nodeType === 1
}
export function isString(val: any): val is string {
  return typeof val === 'string'
}

export function curry(fn: Function, argLen: number = fn.length, ...args: any[]): any {
  return args.length < argLen ? curry.bind(null, fn, argLen, ...args) : fn(...args)
}

export function noop() {}

function getType(val: any): string {
  return Object.prototype.toString.call(val)
}

/**
 * fixme：ts如何支持变量参数？
 */
export function cache(fn: (val: any) => any) {
  let hit: any = {}
  return function(val: any): any {
    return hit[val] || (hit[val] = fn(val))
  }
}
