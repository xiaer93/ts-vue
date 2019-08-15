import { VueOptions, VNodeDirectiveMethod, VueHookMethod } from '../type'

type Components = {
  [key: string]: VueOptions
}
type Directives = {
  [key: string]: VNodeDirectiveMethod
}

let components: Components = {}
let directives: Directives = {}

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
