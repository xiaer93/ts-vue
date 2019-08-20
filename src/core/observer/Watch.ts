import Dep, { popTarget, pushTarget, ArrayDep } from './dep'
import { queueWatcher } from './scheduler'
import { isFunction, noop } from '../../helper/utils'
import { WatchOptions, Vue, noopFn } from '../../type'

let watchId = 0

class Watch {
  private deps: ArrayDep
  private cb: noopFn
  private getter: any
  private options: WatchOptions

  public vm: any
  public id: number
  public value: any
  public before?: noopFn

  constructor(vm: Vue, key: any, cb: noopFn, options?: WatchOptions) {
    this.vm = vm
    this.deps = []
    this.cb = cb
    this.getter = isFunction(key) ? key : parsePath(key) || noop
    this.id = ++watchId
    this.options = options || {}
    this.before = this.options.before

    this.value = this.options.lazy ? undefined : this.get()
  }
  private get(): any {
    let vm = this.vm
    pushTarget(this)
    let value = this.getter.call(vm, vm)
    popTarget()

    return value
  }
  addDep(dep: Dep) {
    !this.deps.includes(dep) && this.deps.push(dep)
    dep.addWatch(this)
  }
  update() {
    queueWatcher(this)
  }
  depend() {
    for (let dep of this.deps) {
      dep.depend()
    }
  }
  run() {
    this.getAndInvoke(this.cb)
  }
  evaluate() {
    this.value = this.get()
    return this.value
  }
  teardown() {
    for (let dep of this.deps) {
      dep.removeWatch(this)
    }
    this.deps.length = 0
  }

  private getAndInvoke(cb: Function) {
    let vm: Vue = this.vm
    // let value = this.getter.call(vm, vm)
    let value = this.get()
    if (value !== this.value) {
      if (this.options!.user) {
        cb.call(vm, value, this.value)
      } else {
        cb.call(this.vm)
      }
      this.value = value
    }
  }
}

function parsePath(key: string): any {
  return function(vm: any) {
    return vm[key]
  }
}

export type ArrayWatch = Array<Watch>

export default Watch
