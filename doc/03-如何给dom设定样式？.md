# 如何给dom设定其他属性？

前面我们分析了vnode转为dom的过程，我们知道vue还支持动态style和class，如`<div :class="{active: false}"></div>`的形式。如何对dom进行更精细化的操作？

## 需求

通过修改v.color的值，可以更改字体的颜色。

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

## patch-hook

在vnode转为dom过程中，通过在各个阶段执行hook函数，通过拓展的方式引入各种模块。


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
```

如patchNode过程，会执行prepatch、update、postpatch等等hook，进而可以在真实dom上进行各种操作。

以style样式为例，在节点生成（create）、更新（update）过程中执行updateStyle，对真实dom的样式进行各种操作。

```
// 更新样式
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

依赖hook实现各种拓展，核心模块仅仅关心自身逻辑，各种其他需求借助拓展实现。