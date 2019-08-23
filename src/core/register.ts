import { VueOptions, VNodeDirectiveMethod, VueHookMethod } from '../type'
import { isFunction } from '../helper/utils'
import Vue from '..'

type Components = {
  [key: string]: VueOptions
}
type Directives = {
  [key: string]: VNodeDirectiveMethod
}

let components: Components = {}
let directives: Directives = {}
let mixins = Object.create(null)
mixins.value = Object.create(null)
let installedPlugins: Array<any> = []

export function registerComponent(name: string, options: VueOptions) {
  if (components[name]) return
  components[name] = options
}

export const GlobalComponents = components

export function registerDirectives(name: string, options: VNodeDirectiveMethod) {
  if (directives[name]) return
  directives[name] = options
}

export const GlobalDirectives = directives

// 此处逻辑需要修改： fixme
export const GlobalMixins = mixins
export function registerMixin(mixin: any) {
  mixins.value = mixin
}

// 注册插件
export function registerPlugins(plugin: Function | Object, ...args: Array<any>): Vue {
  if (installedPlugins.includes(plugin)) {
    return this
  }

  args.unshift(this)
  if (isFunction(plugin.install)) {
    plugin.install.apply(plugin, args)
  } else if (isFunction(plugin)) {
    plugin.apply(null, args)
  }

  installedPlugins.push(plugin)
  return this
}
