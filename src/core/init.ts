import { Vue, VNodeData, VNodeProps, VNodeMethod } from '../type/index'
import { isFunction, isTruth, isPlainObject } from '../helper/utils'
import { observe, observeComputed } from './observer'
import { warn } from '../helper/warn'
import { proxyForVm } from './observer/cProxy'
import Watch from './observer/watch'

export function initProps(vm: Vue): void {
  let proxyProp: any
  const propsData: VNodeProps = vm.$options.propsData

  if (!isPlainObject(propsData)) return

  vm.$options.propsData = proxyProp = observe(propsData)
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

    vm._computedWatched[key] = new Watch(vm._proxyThis, computed[key], noop, {
      computed: true
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
    new Watch(vm, key, watch[key], { user: true })
  }
}
