import Watch from './watch'
import nextTick from '../../helper/next-tick'
import { isDef, isTruth } from '../../helper/utils'

let flush: boolean = false
let wait: boolean = false
let hasAddQueue: any = {}

let queue: Array<Watch> = []

function flushQueue() {
  flush = true

  for (let i = 0; i < queue.length; ++i) {
    let w: Watch = queue[i]
    hasAddQueue[w.id] = null
    w.run()
  }

  resetQueue()
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
