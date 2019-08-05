import { VNode } from '../type'
import { isSameVnode } from '../helper/utils'
import webMethods from '../web/dom'

/**
 * 挂载节点
 */
export default function patch(oldVnode: VNode, vnode: VNode) {
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
}

/**
 * 比较相同节点(标签相同)
 */
function patchNode(oldVnode: VNode, vnode: VNode) {
  let oldCh = oldVnode.children,
    ch = vnode.children,
    elm = (vnode.elm = oldVnode.elm!)

  if (oldCh) {
    // 子节点
    if (ch) {
      if (ch === oldCh) return
      updateChildren(elm!, oldCh, ch)
    } else {
      removeChildren(elm!, oldCh, 0, oldCh.length)
      webMethods.setTextContent(elm!, vnode.text!)
    }
  } else {
    // 文本节点
    if (ch) {
      webMethods.setTextContent(elm, '')
      insertChildren(elm!, null, ch, 0, ch.length)
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
      let before = ch[newEnd + 1] === null ? null : ch[newEnd + 1].elm!
      insertChildren(parentElm, before, ch, newStart, newEnd)
    } else {
      removeChildren(parentElm, oldCh, oldStart, oldEnd)
    }
  }
}

/**
 * 删除子节点
 */
function removeChildren(parentElm: Node, ch: Array<VNode>, start: number, end: number) {
  if (!parentElm || !ch) return

  for (let i = start; i < end; ++i) {
    webMethods.remove(parentElm!, ch[i].elm!)
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

  for (let i = start; i < end; ++i) {
    if (ch[i] !== null) {
      webMethods.insertBefore(parentElm!, createElm(ch[i]), before)
    }
  }
}

/**
 * 生成真实节点: div、text、comment
 */
function createElm(vnode: VNode): Node {
  let elNode: any
  if (vnode.tag === '!') {
    elNode = webMethods.createElement(vnode.text!)
  } else if (vnode.text) {
    elNode = webMethods.createText(vnode.text!)
  } else {
    elNode = webMethods.createElement(vnode.tag!)
  }
  vnode.elm = elNode

  return elNode
}
