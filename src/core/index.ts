import Vue from './core'
import { merge } from '../helper/merge'
import { VueOptions } from '../type'
import { setProxy } from './observer'
import {
  GlobalComponents,
  GlobalDirectives,
  registerComponent,
  registerDirectives
} from './register'
import { DefaultDirectives } from './default'

let cid = 0

export function createSubVue(options: VueOptions) {
  const Super = this
  /**
   * 将组件的构造函数存入组件的options中，方便下次直接获取；同时保证cid的值不会变化
   */
  const cacheCtor = options._Ctor || (options._Ctor = {})

  if (cacheCtor[Super.cid]) {
    return cacheCtor[Super.cid]
  }
  class SubVue extends Vue {
    // 静态方法
    static cid = ++cid
    static component = registerComponent
    static extend = extend

    constructor(opts: VueOptions) {
      opts = merge(options, opts)
      super(opts)
    }
  }
  const proxySubVue = extend(SubVue)
  cacheCtor[Super.cid] = proxySubVue
  proxySubVue.options = options

  return proxySubVue
}

function extend(Vue: VueClass) {
  // 创建销毁对象
  let proxyVue = new Proxy(Vue, {
    construct(target, argumentsList, newTarget) {
      const options = merge(argumentsList[0], {
        components: GlobalComponents,
        directives: GlobalDirectives
      })
      // 绑定Vue，方便或许获取静态方法extend
      options._base = proxyVue

      let vm = new target(options)
      let pvmObj = setProxy(vm)
      let pvm = pvmObj.proxy

      // 传入proxyThis，获取代理后的对象
      pvm._init(pvm)
      return pvm
    }
  })

  return proxyVue
}

Vue.cid = 0
Vue.component = registerComponent
Vue.directive = registerDirectives
Vue.extend = createSubVue

for (let key in DefaultDirectives) {
  Vue.directive(key, DefaultDirectives[key])
}

export default extend(Vue)
