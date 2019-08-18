import { VNode, VueOptions } from '../type'
import { VNodeRel } from '../core/vnode'

export function isNumber(val: any): val is number {
  return typeof val === 'number'
}

export function isArray(val: any): val is Array<any> {
  return Array.isArray(val)
}

export function isFunction(val: any): val is Function {
  return getType(val) === '[object Function]'
}

export function isNull(val: any): val is null {
  return val === null
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

export function isFalse(val: any): val is false {
  return val === false
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

export function isVNode(val: any): val is VNode {
  return val instanceof VNodeRel
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

export function resolveAsset(options: VueOptions, key: string, tag: string) {
  return options[key] && options[key][tag]
}

export function remove(data?: Array<any>, item?: any) {
  if (isUndef(data)) return

  let index: number = data.findIndex(v => v === item)
  if (index !== -1) {
    data.splice(index, 1)
  }
}

export function contains(data?: Array<any>, item?: any): boolean {
  if (isUndef(data) || isUndef(item)) return false

  let index: number = data.findIndex(v => v === item)
  return index !== -1
}

export function flatten(val: Array<any>): Array<any> {
  return [].concat(...val.map(v => (isArray(v) ? flatten(v) : v)))
}

export function once(fn: Function): Function {
  let isRun = false
  return function() {
    if (isRun) return
    isRun = true
    fn.apply(null, arguments)
  }
}

export function toNumber(val: any): number {
  return parseInt(val)
}

export function always(val: any): Function {
  return () => val
}

export function hasOwn(obj: Object, key: string | number | symbol): boolean {
  return !isNull(obj) && obj.hasOwnProperty(key)
}
