import { Vue, VueOptions, VueClass } from '../../type'
import { isArray, isTruth } from '../../helper/utils'

let components: any = {}

export function registerComponent(name: string, options: VueOptions) {
  if (components[name]) return
  components[name] = options
}

export const GlobalComponents = components
