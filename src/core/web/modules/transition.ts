import { VNode } from '../../../type'
import {
  isDef,
  isUndef,
  isObject,
  isString,
  cache,
  remove,
  once,
  noop,
  isNumber,
  toNumber
} from '../../../helper/utils'
import webMethods from '../dom'
import { mergeVNodeHook } from '../../vnode'
import { nextFrame } from '../util'

let transitionProp = 'transition'
let transitionEndEvent = 'transitionend'
let animationProp = 'animation'
let animationEndEvent = 'animationend'

const TRANSITION: string = 'transition'
const ANIMATION: string = 'animtaion'

const hasTransition = true

if (hasTransition) {
  if (window.ontransitionend === undefined && (window as any).onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition'
    transitionEndEvent = 'webkitTransitionEnd'
  }
  if (window.onanimationend === undefined && (window as any).onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation'
    animationEndEvent = 'webkitAnimationEnd'
  }
}

export default {
  create: _enter
}

function _enter(_: any, vnode: VNode) {
  enter(vnode)
}

interface CustomElement extends Element {
  [key: string]: any
}

function enter(vnode: VNode, toggleDisplay?: () => void) {
  const el: CustomElement = vnode.elm

  if (isDef(el._leaveCb)) {
    el._leaveCb!.cancelled = true
    el._leaveCb!()
  }

  const data = resolveTransition(vnode.data.transition.name)
  if (isUndef(data)) return

  if (isDef(el._enterCb) || el.nodeType !== 1) return

  const { css, type, enterClass, enterToClass, leaveClass, leaveToClass, duration } = data

  const startClass = enterClass
  const activeClass = ''
  const toClass = enterToClass

  const explicitEnterDuration = toNumber(duration)

  const expectsCss = true
  const userWatnsControl = false

  const cb = (el._enterCb = once(() => {
    if (expectsCss) {
      removeTransitionClass(el, toClass)
    }
    if (cb.cancelled) {
      if (expectsCss) {
        removeTransitionClass(el, startClass)
      }
    }

    el._enterCb = null
  }))

  if (!vnode.data.show) {
    mergeVNodeHook(vnode, 'insert', () => {})
  }

  if (expectsCss) {
    addTransitionClass(el, startClass)
    nextFrame(() => {
      removeTransitionClass(el, startClass)
      if (!cb.cancelled) {
        addTransitionClass(el, toClass)
        if (!userWatnsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration)
          } else {
            whenTransitionEnds(el, type, cb)
          }
        }
      }
    })
  }
}

function resolveTransition(def?: string | Object) {
  if (isUndef(def)) {
    return {}
  }

  if (isObject(def)) {
  } else if (isString(def)) {
    return autoCssTransition(def)
  }
}

const autoCssTransition = cache(name => {
  return {
    enterClass: `${name}-enter`,
    enterToClass: `${name}-enter-to`,
    leaveClass: `${name}-leave`,
    leaveToClass: `${name}-leave-to`
  }
})

function removeTransitionClass(el: CustomElement, cls: string) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls)
  }
  webMethods.removeClass(el, cls)
}

function addTransitionClass(el: CustomElement, cls: string) {
  const transitionClasses: Array<string> = el._transitionClasses || (el._transitionClasses = [])
  if (!transitionClasses.includes(cls)) {
    transitionClasses.push(cls)
    webMethods.addClass(el, cls)
  }
}

function whenTransitionEnds(el: Element, expectedType?: string, cb?: Function) {
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType)

  if (!type) return cb()

  const evnet: string = type === TRANSITION ? transitionEndEvent : animationEndEvent
  let ended = 0
  const end = () => {
    el.removeEventListener(event, onEnd)
    cb()
  }
  const onEnd = e => {
    if (e.target === el) {
      if (++ended >= propCount) {
        end()
      }
    }
  }

  // 备胎计划
  setTimeout(() => {
    if (ended < propCount) {
      end()
    }
  }, timeout + 1)

  el.addEventListener(event, onEnd)
}

function isValidDuration(val: number): boolean {
  return isNumber(val) && !isNaN(val)
}

function getTransitionInfo(el: Element, expectedType?: string) {
  const styles: any = window.getComputedStyle(el)
  const transitionDelays: Array<string> = (styles[transitionProp + 'Delay'] || '').split(', ')
  const transitionDurations: Array<string> = (styles[transitionProp + 'Duration'] || '').split(', ')
  const transitionTimeout: number = getTimeout(transitionDelays, transitionDurations)
  const animationDelays: Array<string> = (styles[animationProp + 'Delay'] || '').split(', ')
  const animationDurations: Array<string> = (styles[animationProp + 'Duration'] || '').split(', ')
  const animationTimeout: number = getTimeout(animationDelays, animationDurations)

  let type: string,
    timeout: number = 0,
    propCount: number = 0
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION
      timeout = transitionTimeout
      propCount = transitionDurations.length
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION
      timeout = animationTimeout
      propCount = animationDurations.length
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout)
    type = timeout > 0 ? (transitionTimeout > animationTimeout ? TRANSITION : ANIMATION) : null
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0
  }

  const hasTransform: boolean = true

  return {
    type,
    timeout,
    propCount,
    hasTransform
  }
}

function getTimeout(delays: Array<string>, durations: Array<string>): number {
  while (delays.length < durations.length) {
    delays = delays.concat(delays)
  }

  return Math.max.apply(
    null,
    durations.map((d, i) => {
      return toMs(d) + toMs(delays[i])
    })
  )
}

function toMs(s: string): number {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}
