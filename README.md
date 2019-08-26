# 使用ts重构Vue

## 为什么要重构

本科机械设计制造及其自动化，17年机缘巧合之下自学了大半年跨行来到前端。工作中主要为业务代码，一直希望能够提高编程能力。恰好，公司的业务栈主要以vue为主，作为前端的三大框架之一，理解它的逻辑，对于日常工作肯定有一些帮助。于是就有了使用ts重构vue的冲动。更甚者，我希望自己能够参与到开源社区的建设，努力变得更好。


## 重构计划

使用到的技术栈如下：

1. TypeScript
2. Jest
3. es6
4. rollup

使用TypeScript编写，使用Jest做单元测试，使用rollup构建。

vue功能十分复杂，此次重构并不是完全的照（拷）搬（贝），所以我优先挑选主线功能去实现。我希望最佳的开发模式是，以问题（feature）引领，去阅读源码，理解后通过自己的方式去实现。

同时，vue2.x是通过Object.defineProperity实现的响应式，我将不考虑兼容性问题，直接使用Proxy进行开发，在针对数组的监听上，将更加友好高效。

源码很复杂，重构时首先实现最基本的功能即可。接着一步步开发，不断完善。
如，1、实现组件功能，2.传递props数据，3.实现emit事件，4.实现transition内置组件模块


## feature

设想的功能点，首先肯定是可以创建虚拟节点，接着可以将虚拟dom挂载至真实dom。再接着一步一步实现其他的功能。

1. 如何创建虚拟节点？
2. 如何将虚拟节点映射至真实dom？
3. 如何监听响应，实现双向数据绑定？
4. 如何创建组件？
5. 如何实现异步组件？
6. 如何实现hook？
7. 如何实现内置组件？
8. 如何编写扩展？

## 基础准备篇

1. 虚拟dom

我们知道，js和dom像两座孤岛，中间通过桥梁连接。如何尽量减少dom的操作，对于性能来说显得尤为重要。因此，通过VNode记录节点信息，在js侧进行diff对比，尽量减少dom的操作。具体的diff算法，推荐阅读snabbdom，vue的源码也参考了这个开源库。

```
export class VNodeRel implements VNode {
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
  isComment?: boolean
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


1. Proxy和Reflect使用

Object.defineProperty通过直接操作原始对象，在数组对象上有诸多限制。而Proxy可以做到更精细，但是proxy必须操作返回对象。因此，下述我们事先了一个类的代理方式。

```
class P {
  constructor () {
    this.data = {name: 'xiaoming'}
    return new Proxy(this, {
      get (target, key) {
        return Reflect.get(target.data, key)
      }
    })
  }
}
let p = new P()
console.log(p.name)

```

1. 事件循环介绍---nextTick等

熟悉vue的很清楚，vue的每次更新都是异步更新。同时vue中有一个非常重要的函数$nextTick。异步在vue中非常重要，所以了解明白js事件循环，有助于了解vue的异步更新的原理。


## 总结

vue源码很复杂，有跨平台代码（web、weex、server），有各种性能监控，还有其他等等复杂功能。看源码时切记不要完美主义，没必要一开始就必须理解所有的代码。而是通过问题主线去阅读，去了解vue实现的原理。在此特别推荐大神写的源码分析：https://ustbhuangyi.github.io/vue-analysis/。推荐配合源码一起阅读。

## 补充

ts学习推荐：https://coding.imooc.com/class/chapter/330.html

## 杠精一下

1. 为什么使用ts？

词汇：
vnode， vue定义的虚拟节点
patch，虚拟节点转为真实Dom

为什么使用ts？


## 其他文档


