# 如何创建虚拟节点？

React/Vue都用到了虚拟DOM，为什么要使用虚拟DOM？如何定义（创建）虚拟dom呢？虚拟DOM如何映射为真实DOM？

## 为什么要使用虚拟节点？

将下列代码拷贝至浏览器中运行：
```
let d = document.createElement('div')
for(let key in d) console.log(key)
```

我们会发现，真实dom上有非常多的属性，通过自定义虚拟dom能够有效节省空间。

另一方面，dom的重排重绘是非常消耗性能的，应该尽量少修改真实Dom，借助虚拟DOM的diff算法，能够有效的提升性能。

最重要的是，当前有非常多的跨端开发需求，如原生、web、小程序等等，借助虚拟DOM有助于跨端开发，一段代码处处运行。

## 创建虚拟DOM？

我们知道真实DOM的节点类型非常多，有Element、Attr、Comment、Document、DocumentFragment、Text等等。

而我们定义的VNode，只有4种类型：组件节点、子节点、文本节点、注释节点，大大简化了对比的难度。

定义VNode类，VNode必备属性只有tag/data/children/text/elm，其他属性为vue功能需要，如componetOptions/componentInstance只在组件节点中才被使用。

```
export class VNode {
  tag?: string
  data?: VNodeData
  children?: Array<VNode>
  text?: string
  elm?: Node

  context?: Vue
  componentOptions?: VueOptions
  componentInstance?: Vue
  parent?: VNode
  key?: string | number
  constructor(
    tag?: string,
    data?: VNodeData,
    children?: Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Vue,
    componentOptions?: VueOptions
  ) {
    this.tag = tag
    this.data = data || ({} as VNodeData)
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context || bindContenxt
    this.componentOptions = componentOptions
  }
}

```

在vue-render方法中，此处`h`即为创建虚拟节点的函数。
```
new Vue({
  render (h) {
    return h('h1', 'hello world')
  }
})
```

h为重载函数，根据参数不同生成不同类型的vnode：

```
v1 = h('h1', [h('', 'hello world')])    // 包含children的节点
v2 = h('', 'hello world')               // 文本节点
v3 = h('!', 'hello comment')            // 注释节点，此注释表示法引用子snabbdom，vue中使用isComment判断
v4 = h('button-count', [])              // 组件节点，实例化组件、插槽等都会利用到此
```

## 虚拟DOM如何映射为真实DOM？

通过上述的方法，我们可以创建自己的虚拟DOM，接下来，如何将虚拟DOM映射为真实DOM。vue参考了snabbdom库，强烈推荐先研究snabbdom，再接着看vue源码。

映射过程有一个非常重要的方法`patch`，使用`patch(oldVnode, vnode)`进行diff算法，具体的diff算法请直接阅读snabbdom源码，此处以patchNode方法为例进行简单说明。

patchNode用于比较相同节点（tag、key等相同的虚拟DOM），根据新旧虚拟DOM的不同，patchNode执行不同的处理方案。如updateChilden（比较子节点），removeChildren（删除子节点），insertChildren（添加子节点），setTextContent（修改文本的内容）。

通过不断递归，最终映射完所有虚拟DOM。

```
function patchNode(oldVnode: VNode, vnode: VNode) {
  let i: any
  const data = vnode.data,
    oldCh = oldVnode.children,
    ch = vnode.children,
    elm = (vnode.elm = oldVnode.elm!)

  if (oldVnode === vnode) return

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
```

## Vue过程简析

```
let vm = new Vue({
  el: '#app',
  render (h) {
    return h('h1', 'hello world')
  }
})
```

初始化vue实例后，render函数会返回vnode，而el指向的根节点会被初始化为oldVnode，即：

```
oldVnode = {
  tag: 'DIV'
  elm: //指向真实dom
}
vnode = {
  tag: 'h1',
  ele: undefined,
  children: [
    {
      tag: '',
      text: 'hello world'
    }
  ]
}
```

接着执行`patch(oldVnode, vnode)`，对节点进行比较，完成渲染。

## 总结

当前三大框架都应用到了虚拟DOM技术，基于虚拟DOM进行跨平台开发的方案有：ReactNative、Weex、taro等。

## 杠精一下

虚拟DOM究竟提升了多少性能？（https://www.zhihu.com/question/31809713）

虚拟DOM的起源？（https://juejin.im/post/5d085ce85188255e1305cda1）

虚拟DOM的diff算法？