import { VueOptions } from '../type'
import { isArray, isTruth } from './utils'

// 将全局信息合并至子类，如全局component、directive、hooks
export function merge(opts: VueOptions, baseOpts: VueOptions): VueOptions {
  let retOpts: any = {}

  for (let key in baseOpts) {
    let p = planWay[key]
    if (p) {
      retOpts[key] = p(opts[key], baseOpts[key])
    } else {
      // retOpts
      retOpts[key] = baseOpts[key]
    }
  }

  for (let key in opts) {
    if (retOpts.hasOwnProperty(key)) {
    } else {
      retOpts[key] = opts[key]
    }
  }

  return retOpts
}

// 组件是个对象
const planWay = {
  components: mergeBy
}

function mergeBy(left, right) {
  let ret = {}
  left = left || {}
  right = right || {}
  for (let [key, value] of Object.entries(left)) {
    ret[key] = value
  }

  for (let [key, value] of Object.entries(right)) {
    ret[key] = value
  }

  return ret
}
