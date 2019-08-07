import { VNode, Module } from '../../type'
import { isSameVnode, isDef } from '../../helper/utils'
import webMethods from './dom'
import { isArray, isPrimitive } from 'util'
import { createVnode } from '../vnode'

/**
 * vnode进行diff算法，挂载更新真实dom！
 * 通过定义hook，方便进行各种属性操作，如style、class、event等等
 */
type ArrayOf<T> = {
  [K in keyof T]: (T[K])[]
}

type VNodeQueue = Array<VNode>
type ModuleHooks = ArrayOf<Module>

const hooks: (keyof Module)[] = ['create', 'destroy', 'insert', 'remove', 'update']
let insertedVnodeQueue: VNodeQueue = []
let cbs = {} as ModuleHooks

const emptyNode = createVnode('')

export function createPatcher(modules?: Array<Partial<Module>>) {
  modules = isArray(modules) ? modules : []

  for (let i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (let j = 0; j < modules.length; ++j) {
      const hook = modules[j][hooks[i]]
      if (isDef(hook)) {
        ;(cbs[hooks[i]] as Array<any>).push(hook)
      }
    }
  }

  return patch
}

/**
 * 挂载节点
 */
function patch(oldVnode: VNode, vnode: VNode) {
  let parentElm: Node | null = webMethods.parentNode(oldVnode.elm!)
  if (!parentElm) {
    return
  }

  if (isSameVnode(oldVnode, vnode)) {
    patchNode(oldVnode, vnode)
  } else {
    webMethods.remove(parentElm, oldVnode.elm!)
    webMethods.append(parentElm, createElm(vnode))
  }

  // hook-insert   节点自己的
  // for(let i = 0; i < insertedVnodeQueue.length; ++i) {
  //   insertedVnodeQueue[i]!.data!.hook.insert(insertedVnodeQueue[i])
  // }
}

/**
 * 比较相同节点(标签相同)
 */
function patchNode(oldVnode: VNode, vnode: VNode) {
  let oldCh = oldVnode.children,
    ch = vnode.children,
    elm = (vnode.elm = oldVnode.elm!)

  if (oldVnode === vnode) return

  invokeHooks('update')(oldVnode, vnode)

  if (oldCh) {
    // 子节点
    if (ch) {
      if (ch === oldCh) return
      updateChildren(elm!, oldCh, ch)
    } else {
      removeChildren(elm!, oldCh, 0, oldCh.length - 1)
      webMethods.setTextContent(elm!, vnode.text!)
    }
  } else {
    // 文本节点
    if (ch) {
      webMethods.setTextContent(elm, '')
      insertChildren(elm!, null, ch, 0, ch.length - 1)
    } else {
      webMethods.setTextContent(elm!, vnode.text!)
    }
  }
}

/**
 * 比较相同节点的子节点
 */
function updateChildren(parentElm: Node, oldCh: Array<VNode>, ch: Array<VNode>) {
  let oldStart = 0,
    oldEnd = oldCh.length - 1,
    oldStartVnode: VNode = oldCh[oldStart],
    oldEndVnode: VNode = oldCh[oldEnd]
  let newStart = 0,
    newEnd = ch.length - 1,
    newStartVnode: VNode = ch[newStart],
    newEndVnode: VNode = ch[newEnd]

  //
  while (oldStart <= oldEnd && newStart <= newEnd) {
    if (oldStartVnode === null) {
      oldStartVnode = oldCh[++oldStart]
    } else if (oldEndVnode === null) {
      oldEndVnode = oldCh[--oldEnd]
    } else if (newStartVnode === null) {
      newStartVnode = ch[newStart]
    } else if (newEndVnode === null) {
      newEndVnode = ch[newEnd]
    }
    // 判断逻辑
    else if (isSameVnode(oldStartVnode, newStartVnode)) {
      patchNode(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStart]
      newStartVnode = ch[++newStart]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patchNode(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEnd]
      newEndVnode = ch[--newEnd]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patchNode(oldStartVnode, newEndVnode)
      webMethods.insertBefore(
        parentElm,
        oldStartVnode.elm!,
        webMethods.nextSibling(oldEndVnode.elm!)
      )
      oldStartVnode = oldCh[++oldStart]
      newEndVnode = ch[--newEnd]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patchNode(oldEndVnode, newStartVnode)
      webMethods.insertBefore(parentElm, oldEndVnode.elm!, oldStartVnode.elm!)
      oldEndVnode = oldCh[--oldEnd]
      newStartVnode = ch[++newStart]
    } else {
      webMethods.insertBefore(parentElm, createElm(newStartVnode), oldStartVnode.elm!)
      newStartVnode = ch[++newStart]
    }
  }

  if (oldStart <= oldEnd || newStart <= newEnd) {
    if (oldStart > oldEnd) {
      let before = !isDef(ch[newEnd + 1]) ? null : ch[newEnd + 1].elm!
      insertChildren(parentElm, before, ch, newStart, newEnd)
    } else {
      removeChildren(parentElm, oldCh, oldStart, oldEnd)
    }
  }
}

/**
 * 删除子节点
 */
function removeChildren(parentElm: Node, vnodes: Array<VNode>, start: number, end: number) {
  if (!parentElm || !vnodes) return

  for (let i = start; i <= end; ++i) {
    let ch: VNode = vnodes[start],
      listeners: number,
      rm: () => void

    if (ch !== null) {
      if (isDef(ch.tag)) {
        listeners = cbs.remove.length + 1
        rm = createRmCb(ch.elm!, listeners)
        // fixme: destroy和remove的先后顺序？
        invokeDestroyHook(ch)
        invokeHooks('remove')(ch, rm)
        rm()
      } else {
        webMethods.remove(parentElm!, ch.elm!)
      }
    }
  }
}

/**
 * 添加子节点
 */
function insertChildren(
  parentElm: Node,
  before: Node | null,
  ch: Array<VNode>,
  start: number,
  end: number
) {
  if (!parentElm || !ch) return

  for (let i = start; i <= end; ++i) {
    if (ch[i] !== null) {
      webMethods.insertBefore(parentElm!, createElm(ch[i]), before)
    }
  }
}

/**
 * 生成真实节点: div、text、comment
 */
function createElm(vnode: VNode): Node {
  if (vnode.tag === '!') {
    vnode.elm = webMethods.createComment(vnode.text!)
  } else if (!vnode.tag) {
    vnode.elm = webMethods.createText(vnode.text!)
  } else {
    vnode.elm = webMethods.createElement(vnode.tag!)

    //hook-create
    invokeHooks('create')(emptyNode, vnode)

    // 遍历子节点
    if (isArray(vnode.children)) {
      for (let ch of vnode.children) {
        if (ch !== null) {
          webMethods.append(vnode.elm, createElm(ch))
        }
      }
    } else if (isPrimitive(vnode.text)) {
      webMethods.append(vnode.elm, webMethods.createText(vnode.text!))
    }

    insertedVnodeQueue.push(vnode)
  }

  return vnode.elm
}

function invokeHooks(hook: keyof Module) {
  let hookHandler = cbs[hook]

  return function(...args) {
    for (let i = 0; i < hookHandler.length; ++i) {
      hookHandler[i](...args)
    }
  }
}

function createRmCb(elm: Node, listeners: number) {
  return function() {
    if (--listeners === 0) {
      const parentElm: Node = webMethods.parentNode(elm)!
      webMethods.remove(parentElm, elm)
    }
  }
}

function invokeDestroyHook(vnode: VNode) {
  invokeHooks('destroy')(vnode)
  if (isArray(vnode.children)) {
    for (let ch of vnode.children) {
      if (ch !== null) {
        invokeDestroyHook(ch)
      }
    }
  }
}
