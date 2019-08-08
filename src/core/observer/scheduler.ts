import Watch from './watch'
import nextTick from '../../helper/next-tick'
import { isDef, isTruth } from '../../helper/utils'
import { Vue } from '../../type'
import { callhook } from '../../helper/hook'

let flush: boolean = false
let wait: boolean = false
let hasAddQueue: any = {}

let queue: Array<Watch> = []

function flushQueue() {
  flush = true

  for (let i = 0; i < queue.length; ++i) {
    let w: Watch = queue[i]
    w.before && w.before()
    hasAddQueue[w.id] = null
    console.log(w.id)
    w.run()
  }

  const updateQueue = queue.slice()
  resetQueue()

  callUpdateHooks(updateQueue)
}

function resetQueue() {
  flush = wait = false
  queue.length = 0
  hasAddQueue = {}
}

export function queueWatcher(watch: Watch) {
  if (!isTruth(hasAddQueue[watch.id])) {
    //
    hasAddQueue[watch.id] = true
    if (!flush) {
      queue.push(watch)
    } else {
      // console.log(watch)
      // for(let i = 0; i < queue.length; ++i) {

      // }
      queue.push(watch)
    }

    if (!wait) {
      wait = true
      nextTick(flushQueue)
    }
  }
}

function callUpdateHooks(queue: Array<Watch>) {
  for (let i = queue.length - 1; i >= 0; --i) {
    const watcher = queue[i]
    const vm: Vue = watcher.vm
    // 渲染watcher，并且组件已经挂载、未销毁，才执行update
    if (vm._watcher === watcher && vm.$status.isMounted && !vm.$status.isDestroyed) {
      callhook(vm, 'update')
    }
  }
}
