import Watch from './watch'
import nextTick from '../../helper/next-tick'
import { isDef, isTruth } from '../../helper/utils'
import { Vue } from '../../type'
import { callhook } from '../../helper/hook'

type ArrayWatch = Array<Watch>

let flush: boolean = false
let wait: boolean = false
let hasAddQueue: any = {}

let queue: ArrayWatch = []

function flushQueue(): void {
  flush = true

  queue.sort(function(a, b) {
    return a.id - b.id
  })

  try {
    for (let i = 0; i < queue.length; ++i) {
      let w: Watch = queue[i]
      w.before && w.before()
      hasAddQueue[w.id] = null
      console.log('watcher: ', w.id)
      w.run()
    }
  } catch (e) {
    console.log(e)
  }

  const updateQueue = queue.slice()

  resetQueue()
  callUpdateHooks(updateQueue)
}

function resetQueue(): void {
  flush = wait = false
  queue.length = 0
  hasAddQueue = {}
}

export function queueWatcher(watch: Watch): void {
  if (!isTruth(hasAddQueue[watch.id])) {
    hasAddQueue[watch.id] = true
    if (!flush) {
      queue.push(watch)
    } else {
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

function callUpdateHooks(queue: ArrayWatch): void {
  for (let i = queue.length - 1; i >= 0; --i) {
    const watcher = queue[i]
    const vm: Vue = watcher.vm
    // 渲染watcher，并且组件已经挂载、未销毁，才执行update
    if (vm._watcher === watcher && vm.$status.isMounted && !vm.$status.isDestroyed) {
      callhook(vm, 'update')
    }
  }
}
