import { VueOptions, Vue, ComponentProps } from '../type'
import {
  isArray,
  isTruth,
  isString,
  camelize,
  isPlainObject,
  isUndef,
  hasOwn,
  extend
} from './utils'
import { warn } from './warn'
import { isFunction } from 'util'

// 组件是个对象
const strats: any = {
  components: mergeBy
}

strats.data = function(parentVal: any, childVal: any, vm: Vue) {
  if (isTruth(vm)) {
    return mergeDataOrFn(parentVal, childVal, vm)
  } else {
    if (childVal && !isFunction(childVal)) {
      warn('The data should be a function')
      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }
}

strats.propsData = function(parentVal: any, childVal: any, vm: Vue) {
  if (!isTruth(vm)) {
    warn('props can only used during new Vue??')
  }
  return defaultStrat(parentVal, childVal)
}

strats.watch = function(parentVal: any, childVal: any, vm: Vue, key: string) {
  if (isUndef(childVal)) return Object.create(null)

  if (!isTruth(parentVal)) return childVal

  let ret: any = Object.create(null)
  extend(ret, parentVal)

  if (isPlainObject(childVal)) {
    for (let key in childVal) {
      let parent = ret[key]
      let child = childVal[key]
      if (parent && !isArray(parent)) {
        parent = [parent]
      }
      ret[key] = parent ? parent.concat(child) : isArray(child) ? child : [child]
    }
  }

  return ret
}

strats.props = strats.methods = strats.computed = function(
  parentVal: any,
  childVal: any,
  vm: Vue,
  key: string
) {
  if (!parentVal) return childVal
  let ret = Object.create(null)
  extend(ret, parentVal)
  if (isPlainObject(childVal)) {
    extend(ret, childVal)
  }

  return ret
}

// 将全局信息合并至子类，如全局component、directive、hooks
// vm不为空，则为组件自身调用，否则为定义新组件时候调用
export function merge(parent: VueOptions, child: VueOptions, vm?: Vue): VueOptions {
  let retOpts: any = {}

  // fixme: normalize组件数据
  normalizeProps(child)

  for (let key in parent) {
    mergeField(key)
  }

  for (let key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  function mergeField(key: string) {
    let strat = strats[key] || defaultStrat
    retOpts[key] = strat(parent[key], child[key], vm, key)
  }

  return retOpts
}

function defaultStrat(parentVal: any, childVal: any, vm?: Vue, key?: string) {
  return isUndef(childVal) ? parentVal : childVal
}

function mergeDataOrFn(parentVal: any, childVal: any, vm?: Vue) {
  if (isTruth(vm)) {
    return function() {
      let instanceData = isFunction(childVal) ? childVal.call(vm, vm) : childVal
      let defaultData = isFunction(parentVal) ? parentVal.call(vm, vm) : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      }
      return defaultData
    }
  } else {
    if (!childVal) return parentVal
    if (!parentVal) return childVal

    return function(this: Vue) {
      return mergeData(
        isFunction(childVal) ? childVal.call(this, this) : childVal,
        isFunction(parentVal) ? parentVal.call(this, this) : parentVal
      )
    }
  }
}

// 合并data？
function mergeData(to: any, from: any) {
  if (!from) return to

  let keys = Reflect.ownKeys(from)

  for (let i = 0, len = keys.length; i < len; ++i) {
    let key = keys[i]
    let toVal = to[key]
    let fromVal = from[key]
    if (!hasOwn(to, key)) {
      //fixme: 源码使用set定义响应式
      to[key] = fromVal
    } else if (toVal !== fromVal && isPlainObject(to) && isPlainObject(from)) {
      mergeData(toVal, fromVal)
    }
  }

  return to
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

// propsOptions在合并的时候进行了转化
// 对定义组件的props进行转化
function normalizeProps(options: VueOptions, vm?: Vue): void {
  let props: ComponentProps = options.props
  if (!props) return

  let res: any = {}
  let i: any, name: string
  if (isArray(props)) {
    i = props.length
    while (i--) {
      let val = props[i]
      if (isString(val)) {
        name = camelize(val)
        res[name] = { type: null }
      } else {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (let key in props) {
      let val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val) ? val : { type: val }
    }
  } else {
    warn('Invalid value for option "props": expected an Array or an Object, error')
  }
  options.props = res
}
