import { hasOwn } from '../../helper/utils'

const proxyFlag = Symbol('proxy object')

const defaultStrategy = {
  get(target: any, key: string) {
    return Reflect.get(target, key)
  },
  set(target: any, key: string, newVal: any) {
    Reflect.set(target, key, newVal)
  }
}

/**
 * 创建proxy对象，针对不同key执行不同策略
 */
// class CProxy {
//     static __proxyFlag__ = proxyFlag
//     proxy: ProxyConstructor
//     strategys: Strategy

//     constructor (obj: any) {
//         const self = this
//         this.strategys = {default: defaultStrategy}
//         this.proxy = new Proxy(obj, {
//             get(target, key: string) {
//                 const strategy = self.strategys[key] || self.strategys['default']
//                 return strategy.get(target, key)
//             },
//             set(target, key: string, val) {
//                 const strategy = self.strategys[key] || self.strategys['default']
//                 return strategy.set(target, key, val)
//             }
//         })
//     }
//     add (key: string, handler: StrategyMethod) {
//         this.strategys[key] = handler
//     }
//     delete (key: string) {
//         if(hasOwn(this.strategys, key)) {
//             this.strategys[key] = null
//         }
//     }
// }

/**
 * 创建响应式对象
 */
export function createProxy(obj: any) {
  let privateObj = Object.create(null)

  let proxy: any = new Proxy(obj, {
    get(target, key: string) {
      if (isPrivateKey(key)) {
        return privateObj[key]
      }

      const strategy = proxy.__strategys[key] || proxy.__strategys['default']
      return strategy.get(target, key)
    },
    set(target, key: string, val: any) {
      if (isPrivateKey(key)) {
        privateObj[key] = val
        return
      }
      const strategy = proxy.__strategys[key] || proxy.__strategys['default']
      return strategy.set(target, key, val)
    },
    ownKeys(target) {
      const privateKeys = Object.keys(privateObj)
      return Object.keys(target).filter(v => !privateKeys.includes(v))
    }
  })
  proxy.__originObj = obj
  proxy.__proxyFlag__ = proxyFlag
  proxy.__strategys = { default: defaultStrategy }

  return proxy
}

export function isProxy(val: any): boolean {
  return val.__proxyFlag__ === proxyFlag
}

/**
 * 给响应式对象定义响应式属性
 */
export function defineProxyKey(obj: any, key: string, handler: StrategyMethod) {
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

function isPrivateKey(key: string) {
  return key.substr(0, 2) === '__'
}

interface Strategy {
  [key: string]: StrategyMethod | null
}
interface StrategyMethod {
  get: (target: any, key: string) => any
  set: (target: any, key: string, val: any) => any
}
