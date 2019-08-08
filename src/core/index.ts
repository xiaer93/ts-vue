import Vue from './core'
import { merge } from '../helper/merge'
import { VueOptions } from '../type'
import { registerComponent } from './component'
import { createVueProxy } from './observer'

let cid = 0

export function createSubVue(options: VueOptions) {
  class SubVue extends Vue {
    static cid = ++cid
    constructor(opts: VueOptions) {
      opts = merge(options, opts)
      super(opts)
    }
  }

  return createVueProxy(SubVue)
}

Vue.cid = 0
Vue.component = registerComponent
export default Vue
