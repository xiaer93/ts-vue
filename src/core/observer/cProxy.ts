import { Vue, StrategyMethod, Strategy } from '../../type/index'
import { isString } from 'util'
import { hasOwn } from '../../helper/utils'

const proxyFlag = Symbol('[object Proxy]')

const defaultStrategy = {
  get(target: any, key: string) {
    return Reflect.get(target, key)
  },
  set(target: any, key: string, newVal: any) {
    return Reflect.set(target, key, newVal)
  }
}

/**
 * 创建响应式对象
 */
export function createProxy(obj: any) {
  // 如果对象不可拓展，则直接返回原始对象。（preventExtensions、seal、freeze处理后的对象，都是不可拓展的[添加新的属性]）
  if (!Object.isExtensible(obj) || isProxy(obj)) return obj

  let privateObj: any = {}
  privateObj.__strategys = { default: defaultStrategy }
  privateObj.__originObj = obj
  privateObj.__proxyFlag = proxyFlag

  let __strategys: Strategy = privateObj.__strategys

  let proxy: any = new Proxy(obj, {
    get(target, key: string) {
      if (isPrivateKey(key)) {
        return privateObj[key]
      }

      const strategy: StrategyMethod = (__strategys[key] ||
        __strategys['default']) as StrategyMethod
      return strategy.get(target, key)
    },
    set(target, key: string, val: any) {
      if (isPrivateKey(key)) {
        privateObj[key] = val
        return
      }
      // if(key == 1) debugger
      console.log(key)

      const strategy: StrategyMethod = (__strategys[key] ||
        __strategys['default']) as StrategyMethod
      return strategy.set(target, key, val)
    },
    ownKeys(target) {
      const privateKeys = Object.keys(privateObj)
      return Object.keys(target).filter(v => !privateKeys.includes(v))
    }
  })

  function isPrivateKey(key: string) {
    return hasOwn(privateObj, key)
  }

  return proxy
}

/**
 * 判断是否为响应式对象
 */
export function isProxy(val: any): boolean {
  return val.__proxyFlag === proxyFlag
}

/**
 * 给响应式对象定义响应式属性
 */
export function defineProxyObject(obj: any, key: string, handler: StrategyMethod): void {
  if (!isProxy(obj)) return

  let __strategys: Strategy = obj.__strategys
  __strategys[key] = handler
}

/**
 * 给响应式数组定义响应式属性
 */
export function defineProxyArray(obj: Array<any>, handler: StrategyMethod) {
  if (!isProxy(obj)) return
  let __strategys: Strategy = (obj as any).__strategys
  __strategys['default'] = handler
}

export function proxyForVm(vm: Vue, source: any, key: string) {
  if (!isProxy(vm)) return

  let __strategys: Strategy = (vm as any).__strategys
  __strategys[key] = {
    get(target: any, key: string) {
      return Reflect.get(source, key)
    },
    set(target: any, key: string, newVal: any) {
      return Reflect.set(source, key, newVal)
    }
  }
}
