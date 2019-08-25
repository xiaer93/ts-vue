import { Vue, VNodeData, VNodeProps, VNodeMethod, VueProps } from '../../type/index'
import { isFunction, isTruth, isPlainObject, noop, hasOwn, isUndef } from '../../helper/utils'
import { observe, observeComputed, defineObject } from '../observer'
import { warn } from '../../helper/warn'
import { proxyForVm, createProxy } from '../observer/cProxy'
import Watch from '../observer/watch'
import { isArray } from 'util'
import { validateProp } from './props'

export function initProps(vm: Vue): void {
  let proxyProp: any
  const propsData: VNodeProps = vm.$options.propsData
  const propsOptions = vm.$options.props || {}

  if (!isPlainObject(propsData)) return

  // fixme: 验证propsData是否合法，获取最终value

  // vm.$options.propsData = proxyProp = observe(propsData)
  vm.$options.propsData = proxyProp = createProxy(propsData)
  // Array和Object都可以可以for-in
  for (let key in propsOptions) {
    let value: any = validateProp(key, propsOptions, propsData, vm._proxyThis)
    defineObject(propsData, key, value)
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
  debugger

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
