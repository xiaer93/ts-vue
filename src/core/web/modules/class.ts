import { VNode, VNodeData, VElement } from '../../../type'
import { isUndef, isDef, isObject, isString, isTruth } from '../../../helper/utils'

function updateClass(oldVnode: VNode, vnode: VNode) {
  const el: VElement = vnode.elm!
  const data: VNodeData = vnode.data!
  const oldData: VNodeData = oldVnode.data!

  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) &&
    (isUndef(oldData) || (isUndef(oldData.staticClass) && isUndef(oldData.class)))
  ) {
    return
  }

  let cls = getClassForVnode(vnode)

  if (cls !== el._prevClass) {
    el.setAttribute('class', cls.trim())
    el._prevClass = cls
  }
}

function getClassForVnode(vnode: VNode): string {
  let data: VNodeData = vnode.data!
  let parentVnode: VNode = vnode
  let childNode: VNode = vnode

  // 循环获取组件上的所有class。为什么循环，透明组件吗？
  while (isDef(childNode.componentInstance)) {
    childNode = vnode.componentInstance!._vnode
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data)
    }
  }
  // while(isDef(childNode.componentInstance)) {
  //   childNode = vnode.componentInstance!._vnode
  //   if(childNode && childNode.data) {
  //     data = mergeClassData(childNode.data, data)
  //   }
  // }

  return renderClass(data.staticClass, data.class)
}

function mergeClassData(child: VNodeData, parent: VNodeData): VNodeData {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class) ? [child.class, parent.class] : parent.class
  } as VNodeData
}

function concat(a: string, b: string): string {
  return a ? (b ? a + ' ' + b : a) : b || ''
}

function renderClass(staticClass: string, dynamicClass: any): string {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
}

function stringifyClass(dynamicClass: any): string {
  if (Array.isArray(dynamicClass)) {
    return stringifyArray(dynamicClass)
  }
  if (isObject(dynamicClass)) {
    return stringifyObject(dynamicClass)
  }
  if (isString(dynamicClass)) {
    return dynamicClass
  }
}

function stringifyArray(value: Array<any>): string {
  let res: string = ''
  let stringified: string

  for (let i = 0, len = value.length; i < len; ++i) {
    if (isDef((stringified = stringifyClass(value[i]))) && stringified !== '') {
      res += ` ${stringified}`
    }
  }

  return res
}
function stringifyObject(value: any): string {
  let res: string = ''
  for (const key in value) {
    if (isTruth(value[key])) {
      res += ` ${key}`
    }
  }

  return res
}

export default {
  create: updateClass,
  update: updateClass
}
