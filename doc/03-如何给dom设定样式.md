# 如何给dom设定其他属性？

Vue支持动态style和class，如：`<div :class="{active: false}" :style="{color: "red"}"></div>`，如何对将其他属性映射至真实DOM的操作？

我们的编码目标是下面的demo能够成功渲染。

```
let v = new Vue({
  el: '#app',
  data () {
    return {
      color: "red"
    }
  },
  render (h) {
    return h('h1', {style: {color: this.color}}, 'hello world!')
  }
})

setTimeout(() => {
  v.color ='#000'
}, 2000)

```

## 回顾虚拟节点映射过程

前面分析了虚拟DOM映射为真实DOM的过程，是否可以在映射过程将动态样式更新到真实DOM上？

图片

我们在映射过程中添加hook，以patchNode方法为例，在方法执行过程中，在不同时期会执行hook函数，如`invokeVnodeHooks(oldVnode, vnode, 'prepatch')`会执行prepatch钩子函数，在钩子函数中进而可以在真实dom上进行各种操作。



VNode的钩子有：create、destroy、insert、remove、update、prepatch、postpatch、init

```
function patchNode(oldVnode: VNode, vnode: VNode) {
  let i: any
  const data = vnode.data,
    oldCh = oldVnode.children,
    ch = vnode.children,
    elm = (vnode.elm = oldVnode.elm!)

  vnode.componentInstance = oldVnode.componentInstance

  if (oldVnode === vnode) return

  invokeVnodeHooks(oldVnode, vnode, 'prepatch')
  invokeCbHooks('update')(oldVnode, vnode)

  if (oldCh) {
    ...
  } else {
    ...
  }

  invokeVnodeHooks(oldVnode, vnode, 'postpatch')
}

function invokeVnodeHooks(oldVnode: VNode | null, vnode: VNode, hookKey: keyof Module) {
  let i: any
  if (isDef((i = vnode.data)) && isDef((i = i.hook)) && (i = i[hookKey])) {
    oldVnode ? i(oldVnode, vnode) : i(vnode)
  }
}
```

以style样式功能为例，只需要在节点生成（create）、更新（update）过程中执行updateStyle，即可对真实dom的样式进行各种操作。

```
function updateStyle(oldVnode: VNode, vnode: VNode): void {
  let cur: any,
    name: string,
    elm = vnode.elm,
    oldStyle = oldVnode.data!.style,
    style = vnode.data!.style

  if (!oldStyle && !style) return
  if (oldStyle === style) return

  oldStyle = oldStyle || ({} as VNodeStyle)
  style = style || ({} as VNodeStyle)

  for (name in oldStyle) {
    if (!style[name]) {
      ;(elm as any).style[name] = ''
    }
  }

  for (name in style) {
    ;(elm as any).style[name] = style[name]
  }
}

function removeStyle(vnode: VNode, rm: () => void) {}

export default {
  create: updateStyle,
  update: updateStyle
}

```

## 总结

核心模块仅关心自身逻辑，其他需求借助钩子函数实现。vue的style、class等等属性都是基于vnode-hook实现拓展的，在不同平台的差异也就很方便实现定制化。

## 杠精一下

vue/react都有生命周期，vnode-hook，如何开发可拓展的框架？