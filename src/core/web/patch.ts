import { VNode, Module } from '../../type'
import { isSameVnode, isDef, isUndef, isPrimitive, isArray, isTruth } from '../../helper/utils'
import webMethods from './dom'
import { createEmptyVnode } from '../vnode'

/**
 * vnode进行diff算法，挂载更新真实dom！
 * 通过定义hook，方便进行各种属性操作，如style、class、event等等
 */
type ArrayOf<T> = {
  [K in keyof T]: (T[K])[]
}

type VNodeQueue = Array<VNode>
type ModuleHooks = ArrayOf<Module>

const hooks: (keyof Module)[] = [
  'create',
  'destroy',
  'insert',
  'remove',
  'update',
  'prepatch',
  'postpatch',
  'init'
]

let insertedVnodeQueue: VNodeQueue = []
let cbs = {} as ModuleHooks

export const emptyNode = createEmptyVnode()

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
function patch(oldVnode: VNode | null, vnode: VNode | null) {
  if (!isTruth(oldVnode)) {
    return createElm(vnode)
  }

  let parentElm: Node | null = webMethods.parentNode(oldVnode.elm!)
  if (!parentElm) {
    return
  }

  if (vnode === null) {
    webMethods.remove(parentElm, oldVnode.elm!)
    return
  }

  if (isSameVnode(oldVnode, vnode)) {
    patchNode(oldVnode, vnode)
  } else {
    webMethods.remove(parentElm, oldVnode.elm!)
    webMethods.append(parentElm, createElm(vnode))
  }

  // hook-insert
  invokeInsertHook()
  return parentElm
}

/**
 * 比较相同节点(标签相同)
 */
function patchNode(oldVnode: VNode, vnode: VNode) {
  let i: any
  const data = vnode.data,
    oldCh = oldVnode.children,
    ch = vnode.children,
    elm = (vnode.elm = oldVnode.elm!)

  vnode.componentInstance = oldVnode.componentInstance

  if (oldVnode === vnode) return

  invokeVnodeHooks(oldVnode, vnode, 'prepatch')
  // invokeHooks(oldVnode, vnode, 'update')
  invokeCbHooks('update')(oldVnode, vnode)

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

  invokeVnodeHooks(oldVnode, vnode, 'postpatch')
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
      let before = isUndef(ch[newEnd + 1]) ? null : ch[newEnd + 1].elm!
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
        invokeCbHooks('remove')(ch, rm)
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
  if (createComponent(vnode)) {
    return vnode.elm
  }

  if (vnode.tag === '!') {
    vnode.elm = webMethods.createComment(vnode.text!)
  } else if (!vnode.tag) {
    vnode.elm = webMethods.createText(vnode.text!)
  } else {
    vnode.elm = webMethods.createElement(vnode.tag!)

    // 先执行子元素hook
    createChildren(vnode, vnode.children)
    //hook-create
    invokeCreateHook(vnode)
  }

  return vnode.elm
}

function createChildren(vnode: VNode, children: Array<VNode>) {
  for (let ch of children) {
    if (ch !== null) {
      webMethods.append(vnode.elm, createElm(ch))
    }
  }
}

// 执行全局的hook函数
function invokeCbHooks(hook: keyof Module) {
  let hookHandler = cbs[hook]

  return function(...args) {
    for (let i = 0; i < hookHandler.length; ++i) {
      hookHandler[i](...args)
    }
  }
}

// 执行vnode节点的hook函数
function invokeVnodeHooks(oldVnode: VNode | null, vnode: VNode, hookKey: keyof Module) {
  let i: any
  if (isDef((i = vnode.data)) && isDef((i = i.hook)) && (i = i[hookKey])) {
    oldVnode ? i(oldVnode, vnode) : i(vnode)
  }
}

function invokeHooks(oldVnode, vnode: VNode, hookKey: string) {
  invokeVnodeHooks(oldVnode, vnode, hookKey)
  invokeCbHooks(hookKey)(oldVnode, vnode)
}

function invokeCreateHook(vnode: VNode) {
  invokeCbHooks('create')(emptyNode, vnode)
  let i: any = vnode.data.hook
  if (isDef(i)) {
    if (isDef(i.create)) i.create(emptyNode, vnode)
    if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
  }
}

function invokeInsertHook() {
  for (let i = 0, len = insertedVnodeQueue.length; i < length; ++i) {
    insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i])
  }
  insertedVnodeQueue = []
}

function invokeDestroyHook(vnode: VNode) {
  invokeCbHooks('destroy')(vnode)
  if (isArray(vnode.children)) {
    for (let ch of vnode.children) {
      if (ch !== null) {
        invokeDestroyHook(ch)
      }
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

function createComponent(vnode: VNode): boolean {
  let i: any = vnode.data
  if (isDef(i)) {
    invokeVnodeHooks(null, vnode, 'init')

    if (isDef(vnode.componentInstance)) {
      initComponent(vnode)
      return true
    }
  }
  return false
}

// 组件vnode没有加入insertedVnodeQueue
function initComponent(vnode) {
  vnode.elm = vnode.componentInstance.$el
}
