import Vue from '../core'
import Dep, { popTarget, pushTarget } from './dep'
import { queueWatcher } from './scheduler'
import { isFunction, noop } from '../../helper/utils'
import { WatchOptions } from '../../type'

let watchId = 0

class Watch {
  private vm: any
  private deps: Array<Dep>
  private cb: () => void
  private getter: any
  private dep?: Dep
  private options: WatchOptions

  public id: number
  public value: any

  constructor(vm: any, key: any, cb: () => void, options?: WatchOptions) {
    this.vm = vm
    this.deps = []
    this.cb = cb
    this.getter = isFunction(key) ? key : parsePath(key) || noop
    this.id = ++watchId
    this.options = options || {}

    if (this.options.computed) {
      this.dep = new Dep()
      this.value = undefined
    } else {
      this.value = this.get()
    }
  }
  get(): any {
    let vm = this.vm
    pushTarget(this)
    let value = this.getter.call(vm, vm)
    popTarget()

    return value
  }
  addDep(dep: Dep) {
    // console.log(dep)
    !this.deps.includes(dep) && this.deps.push(dep)
    dep.addWatch(this)
  }
  update() {
    queueWatcher(this)
  }
  depend() {
    if (this.dep && Dep.Target) {
      this.dep.depend()
    }
  }
  run() {
    if (this.options.computed) {
      this.getAndInvoke(() => {
        this.dep!.notify()
      })
    } else {
      this.getAndInvoke(this.cb)
    }
  }
  evaluate() {
    this.value = this.get()
    return this.value
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

export default Watch
