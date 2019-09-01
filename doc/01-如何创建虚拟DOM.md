# 如何创建虚拟节点

React/Vue都用到了虚拟DOM，围绕虚拟DOM，本篇主要解决下面3个问题。

为什么要使用虚拟DOM？
如何定义（创建）虚拟dom呢？
虚拟DOM如何映射为真实DOM？

我们的编码目标是下面的demo能够成功渲染。

```
let vm = new Vue({
  el: '#app',
  render (h) {
    return h('h1', 'Hello Vue!')
  }
})
```

## 为什么要使用虚拟节点

将下列代码拷贝至浏览器中运行：
```
let d = document.createElement('div')
for(let key in d) console.log(key)
```

我们会发现，真实dom上有非常多的属性，通过自定义虚拟dom能够有效节省空间。

另外，真实dom的重排重绘是非常消耗性能的，应该尽量少修改，借助虚拟DOM的diff算法，能够有效提升性能。

最重要的是，当前有非常多的跨端开发需求，如原生、web、小程序等等，借助虚拟DOM有助于跨端开发，一段代码处处运行。

## 创建虚拟DOM

VNode必备属性只有tag/data/children/text/elm，其他属性为vue功能需要，如componetOptions/componentInstance只在组件节点中才被使用。

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

我们知道真实DOM的节点类型非常多，如Element、Attr、Comment、Document、DocumentFragment、Text等，而VNode，只做4种形式：组件节点、子节点（children属性不为空）、文本节点、注释节点。

h为重载函数，根据参数不同生成不同类型的vnode：

1. 子节点

子节点类型，其tag和children属性不为空，其text属性为空。
```
v1 = h('h1', [h('', 'hello world')])

{
  children: [
    {
      children: undefined, 
      data: {},
      elm: undefined,
      tag: undefined,
      text: 'hello world'
    }
  ],
  data: {},
  elm: undefined,
  tag: "h1",
  text: undefined,
}

```

2. 文本节点
   
文本节点类型，其tag和children属性为空，其text属性不为空。
```
v2 = h('', 'hello world')               
{
  children: undefined, 
  data: {},
  elm: undefined,
  tag: undefined,
  text: 'hello world'
}
```

3. 注释节点

文本节点类型，其tag属性为`!`，children属性为空，其text属性不为空。 
```
v3 = h('!', 'hello comment')

{
  children: undefined, 
  data: {},
  elm: undefined,
  tag: '!',
  text: 'hello world'
}
```

4. 组件节点

组件节点类型，其componentOptions属性不为空。
```
v4 = h('button-count', [])

{
  children: undefined
  componentInstance: Proxy {$refs: {…}, $options: {…}}
  componentOptions: {Ctor: ƒ, propsData: undefined, children: Array(1), tag: "button-counter"}
  data: {on: undefined, hook: {…}}
  elm: button
  tag: "vue-component-1-button-counter"
  text: undefined
}
```

通过属性状态划分为4种类型，在进行diff算法时，针对不同的类型将进行不同的处理，如组件节点会调用`createComponentInstanceForVnode`进行初始化。

## 虚拟DOM如何映射为真实DOM？

我们创建了自己的虚拟DOM，接下来，将虚拟DOM映射为真实DOM，将`Hello Vue`渲染至浏览器。

映射过程有一个非常重要的方法`patch`，patch接收新旧节点，执行diff算法。

1. 如果两个节点为`sameVnode`关系，则调用`patchVnode`
2. 否则，直接删除旧的节点，添加新的节点

`webMethods.append`的本质是执行`parentElm.appendChild(createElm(vnode))`

```
function patch(oldVnode: VNode, vnode: VNode) {
  let parentElm = webMethods.parentNode(oldVnode.elm)

  if (isSameVnode(oldVnode, vnode)) {
    patchNode(oldVnode, vnode)
  } else {
    webMethods.remove(parentElm, oldVnode.elm)
    webMethods.append(parentElm, createElm(vnode))
  }

  return parentElm
}
```

`createElm`需要根据虚拟节点的类型进行不同的处理，同时它会将生成好的真实DOM挂载在`vnode.elm`属性之上，方便对真实dom进行操作。

```
function createElm(vnode: VNode): Node {
  // 组件节点
  if (createComponent(vnode)) {
    return vnode.elm
  }

  if (vnode.tag === '!') {
    // 注释节点
    vnode.elm = webMethods.createComment(vnode.text!)
  } else if (!vnode.tag) {
    // 文本节点
    vnode.elm = webMethods.createText(vnode.text!)
  } else {
    // 子节点
    vnode.elm = webMethods.createElement(vnode.tag!)
  }

  return vnode.elm
}
```

接着对相同虚拟节点（`sameVNode`）进行比较，根据children属性分情况处理，如updateChilden（比较子节点），removeChildren（删除子节点），insertChildren（添加子节点），setTextContent（修改文本的内容）。

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

最终通过不断递归，比较完所有虚拟DOM。

## Vue虚拟DOM处理的流程

回顾我们的DEMO，我们需要页面能够渲染出`<h1>Hello Vue!</h1>`

```
let vm = new Vue({
  el: '#app',
  render (h) {
    return h('h1', 'Hello Vue!')
  }
})
```

初始化vue实例后，调用render函数会返回vnode，而el指向的根节点会被初始化为oldVnode，即：

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

## 简易代码

我们根据上面的流程实现下功能吧。

补充说明下方法：`h`为生成VNode的函数，`createNodeAt`将真实DOM转为虚拟DOM，`patch`是进行映射的核心函数。

```
class Vue {
  constructor (options) {
    this.$options = options
    this._vnode = null

    if(options.el) {
      this.$mount(options.el)
    }
  },
  _render () {
    return this.$options.render.call(this, h)
  },
  _update (vnode) {
    let oldVnode = this._vnode
    this._vnode = vnode

    patch(oldVnode, vnode)
  }
  $mount (el) {
    this._vnode = createNodeAt(documeng.querySelector(options.el))
    this._update(this._render())
  }
}
```

ps: 尚未验证（运行）上述代码，后期将进行验证。

## 总结

虚拟DOM的diff算法可能没有表述清楚，推荐直接看snabbdom。基于虚拟DOM技术进行跨平台开发的方案有：ReactNative、Weex、taro等，尚未学习故不做叙述。

## 杠精一下

虚拟DOM究竟提升了多少性能？（https://www.zhihu.com/question/31809713）

虚拟DOM的起源？（https://juejin.im/post/5d085ce85188255e1305cda1）

虚拟DOM的diff算法？

## 系列文章

[【Ts重构Vue】00-Ts重构Vue前言](https://juejin.im/post/5d64ad8bf265da039135247b)

[【Ts重构Vue】01-如何创建虚拟节点](https://juejin.im/post/5d638c1a6fb9a06aff5e7e57)

[【Ts重构Vue】02-数据如何驱动视图变化](https://juejin.im/post/5d637ebc6fb9a06ad45151a7)

[【Ts重构Vue】03-如何给真实DOM设置样式](https://juejin.im/post/5d639eeff265da0394021683)