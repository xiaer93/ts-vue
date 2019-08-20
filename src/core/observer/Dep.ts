import Watch, { ArrayWatch } from './watch'

let targetPool: ArrayWatch = []

/**
 * 收集依赖
 */
class Dep {
  static Target: Watch | undefined

  private watches: ArrayWatch

  constructor() {
    this.watches = []
  }
  addWatch(watch: Watch) {
    !this.watches.includes(watch) && this.watches.push(watch)
  }
  removeWatch(watch: Watch) {
    let index = this.watches.indexOf(watch)
    if (index !== -1) {
      this.watches.splice(index, 1)
    }
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

export function pushTarget(watch: Watch): void {
  Dep.Target && targetPool.push(Dep.Target)
  Dep.Target = watch
}

export function popTarget(): void {
  Dep.Target = targetPool.pop()
}

export type ArrayDep = Array<Dep>
export default Dep
