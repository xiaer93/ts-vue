import Vue from './core'

/**
 * 订阅data和props？？？
 */
class Observe {
  private vm: Vue
  constructor(vm: Vue) {
    this.vm = vm
  }
}

export default Observe
