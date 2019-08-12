import { VNode } from '../../../type'
import { isDef, isUndef } from '../../../helper/utils'
import { makeMap } from '../util'

// attrs是响应式的吗？
// attrs应该不是响应式的，但是在vue中defineRective，避免setter改变了其值

// attrs也是响应式的，如果为dom上的属性，则优先转为attrs否则转为props？？？？？是这个逻辑吗? 还有dom-props是什么东西？
// attrs指的是可以setAttribute设定的属性，
// dom-props指的是document.body.innerHTML
// props是传递给子组件的自定义属性

function updateAttrs(oldVnode: VNode, vnode: VNode) {
  const opts = vnode.componentOptions // 创建组件实例时，传入的属性（render函数传入）
  // 子组件，未设置inheritAttrs，则直接返回
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data!.attrs) && isUndef(vnode.data!.attrs)) {
    return
  }

  const oldAttrs = oldVnode.data!.attrs || {}
  const attrs = vnode.data!.attrs || {}
  const elm: Element = vnode.elm!

  let cur: any, old: any
  for (let key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      setAttr(elm, key, cur)
    }
  }

  for (let key in oldAttrs) {
    if (isUndef(attrs[key])) {
      elm.removeAttribute(key)
    }
  }
}

function setAttr(elm: Element, key: string, value: string) {
  if (isBooleanAttr(key)) {
    if (isFalsyAttrValue(value)) {
      elm.removeAttribute(key)
    }
  } else {
    elm.setAttribute(key, value)
  }
}

const isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,translate,' +
    'truespeed,typemustmatch,visible'
)

const isFalsyAttrValue = (val: any): boolean => {
  return val == null || val === false
}

export default {
  create: updateAttrs,
  update: updateAttrs
}
