import Watch from './watch'

let targetPool: Array<Watch> = []

/**
 * 收集依赖
 */
class Dep {
  static Target: Watch | undefined

  private watches: Array<Watch>
  constructor() {
    this.watches = []
  }
  addWatch(watch) {
    this.watches.push(watch)
  }
  depend() {
    Dep.Target && Dep.Target.addDep(this)
  }
  notify() {
    this.watches.forEach(v => {
      v.update()
    })
  }
}

export function pushTarget(watch) {
  Dep.Target && targetPool.push(Dep.Target)
  Dep.Target = watch
}

export function popTarget() {
  Dep.Target = targetPool.pop()
}

export default Dep
