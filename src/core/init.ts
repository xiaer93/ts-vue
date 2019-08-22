import {
  Vue,
  VNodeData,
  VNodeProps,
  VNodeMethod,
  ComponentProps,
  VueProps,
  ComponentPropsType
} from '../type/index'
import { isFunction, isTruth, isPlainObject, noop, hasOwn, isUndef } from '../helper/utils'
import { observe, observeComputed } from './observer'
import { warn } from '../helper/warn'
import { proxyForVm, createProxy } from './observer/cProxy'
import Watch from './observer/watch'
import { isArray } from 'util'

export function initProps(vm: Vue): void {
  let proxyProp: any
  const propsData: VNodeProps = vm.$options.propsData
  const propsOptions: ComponentProps = vm.$options.props || {}

  if (!isPlainObject(propsData)) return

  // fixme: 验证propsData是否合法，获取最终value

  // vm.$options.propsData = proxyProp = observe(propsData)
  vm.$options.propsData = proxyProp = createProxy(propsData)
  for (let key in propsData) {
    proxyForVm(vm._proxyThis, proxyProp, key)
  }
}

export function initMethods(vm: Vue): void {
  const methods: VNodeMethod | undefined = vm.$options.methods

  if (!isPlainObject(methods)) return

  const propsKey: Array<string> = Object.keys(vm.$options.props || {})
  const existedKey: Array<string> = [...propsKey]

  for (let key in methods) {
    if (existedKey.includes(key)) {
      warn('methods的key不合法')
      break
    }
    proxyForVm(vm._proxyThis, methods, key)
  }
}

export function initData(vm: Vue) {
  // data如果为函数，则执行有可能会get？
  let proxyData: any
  let originData: any = vm.$options.data
  let data: VNodeData = (vm.$options.data = isFunction(originData) ? originData() : originData)

  if (!isPlainObject(data)) return

  const methodsKey = Object.keys(vm.$options.methods || {})
  const propsKey = Object.keys(vm.$options.props || {})
  const existedKey = [...methodsKey, ...propsKey]

  vm.$options.data = proxyData = observe(data)

  for (let key in proxyData) {
    if (existedKey.includes(key)) {
      warn('data的key不合法')
      break
    }
    proxyForVm(vm._proxyThis, proxyData, key)
  }
}

export function initComputed(vm: Vue) {
  let proxyComputed: any
  const computed = vm.$options.computed

  if (!isPlainObject(computed)) return

  const propsKey: Array<string> = Object.keys(vm.$options.props || {})
  const methodsKey: Array<string> = Object.keys(vm.$options.methods || {})
  const dataKey: Array<string> = Object.keys(vm.$options.data || {})
  const existedKey: Array<string> = [...methodsKey, ...propsKey, ...dataKey]

  for (let key in computed) {
    if (existedKey.includes(key)) {
      warn('computed的key不合法')
      break
    }

    let userDef = computed[key]
    let getter = isFunction(userDef) ? userDef : userDef.get

    vm._computedWatched[key] = new Watch(vm._proxyThis, getter, noop, {
      lazy: true
    })
  }

  vm.$options.computed = proxyComputed = observeComputed(
    computed,
    vm._computedWatched,
    vm._proxyThis
  )
  for (let key in computed) {
    proxyForVm(vm._proxyThis, proxyComputed, key)
  }
}

export function initWatch(vm: Vue) {
  const watch = vm.$options.watch

  for (let key in watch) {
    new Watch(vm._proxyThis, key, watch[key], { user: true })
  }
}

function validateProp(key: string, propsOptions: ComponentProps, propsData: VueProps, vm: Vue) {
  let prop: ComponentPropsType = propsOptions[key]
  let absent: boolean = !hasOwn(propsData, key)
  let value: any = propsData[key]

  if (isUndef(value)) {
    value = getPropDefaultValue(vm, prop, key)
  }

  assertProp(prop, key, value, vm, absent)
  return value
}

function getPropDefaultValue(vm: Vue, prop: ComponentPropsType, key: string): any {
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  let def = (prop as any).default
  if (isFunction(def) && getType((prop as any).type) !== 'function') {
    return def.call(vm)
  } else {
    return def
  }
}

function getTypeIndex() {}

function getType(val: any): string {
  var match = val && val.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

// 断言props的类型是否符合要求
function assertProp(
  prop: ComponentPropsType,
  name: string,
  value: any,
  vm: Vue,
  absent: boolean
): any {
  if ((prop as any).required && absent) {
    return warn(`Missing required prop: "${name}" ${vm}`)
  }

  if (value === null && !(prop as any).required) {
    return
  }

  // props在抵达这里之前经过了格式化
  let type = prop.type
  let valid = !type || type === true
  let exceptedTypes = []
  if (type) {
    if (!isArray(type)) type = [type]
    for (let i = 0, len = (type as Array<any>).length; i < len; ++i) {
      let assertedType = assertType(value, type[i])
      exceptedTypes.push(assertedType.expectedType || '')
      valid = assertedType.valid
    }
  }

  if (!valid) {
    return warn('props 类型错误')
  }

  let validator = prop.validator
  if (validator && !validator(value)) {
    return warn(`Invalid prop: custom validator check failed for prop "${name}"`)
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/
function assertType(value: any, type: any) {
  let valid: boolean
  let expectedType: string = getType(type)
  if (simpleCheckRE.test(expectedType)) {
    let t = typeof value
    valid = t === expectedType.toLowerCase()
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value)
  } else if (expectedType === 'Array') {
    valid = isArray(value)
  } else {
    valid = value instanceof type
  }

  return {
    valid,
    expectedType
  }
}
