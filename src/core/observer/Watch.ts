import Vue from '../core'
import Dep, { popTarget, pushTarget } from './dep'
import { queueWatcher } from './scheduler'

let watchId = 0

class Watch {
  private vm: Vue
  private deps: Array<Dep>
  private cb: () => void
  private getter: (vm: Vue) => any
  private dep?: Dep

  public id: number
  public value: any

  constructor(vm: Vue, key: any, cb: () => void, options?: any) {
    this.vm = vm
    this.deps = []
    this.cb = cb
    this.getter = key
    this.id = ++watchId

    this.value = this.get()
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
    this.getAndInvoke(this.cb)
  }

  private getAndInvoke(cb: () => void) {
    let vm: Vue = this.vm
    let value = this.getter.call(vm, vm)
    if (value !== this.value) {
      cb.call(this.vm)
    }
  }
}

export default Watch
