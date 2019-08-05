import Vue from './core'
import Dep, { popTarget, pushTarget } from './dep'

class Watch {
  private vm: Vue
  private deps: Array<Dep>
  private cb: () => void
  private getter: (vm: Vue) => any
  private dep?: Dep
  public value: any

  constructor(vm: Vue, key: any, cb: () => void, options?: any) {
    this.vm = vm
    this.deps = []
    this.cb = cb
    this.getter = key

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
    this.deps.push(dep)
    dep.addWatch(this)
  }
  update() {
    this.getAndInvoke(this.cb)
  }
  depend() {
    if (this.dep && Dep.Target) {
      this.dep.depend()
    }
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
