## 为什么要重构

通过重构学习作者的编码思想，同时锻炼自己的能力。希望未来能够参与到开源库，甚至自己能够撸一个轮子。

## 使用到的技术栈

从无到有，重构vue对于我来说是一个不小的挑战。这个过程充满未知，所以我也不确定

1. TypeScript
2. Jest
3. es6-Reflect
4. rollup

## 计划

此次重构并不是完全的照搬，也不可能完全不看源码。我希望自己最佳的模式是，以问题（feature）引领，去阅读源码，理解后通过自己的方式去实现。

源码很复杂，重构时首先实现最基本的功能即可。
如，1、实现组件功能，2.传递props数据，3.实现emit事件，4.实现transition内置组件模块






## feature

1. 如何创建虚拟节点？
2. 如何将虚拟节点映射至真实dom？
3. 如何监听响应，实现双向数据绑定？
4. 如何创建组件？
5. 如何实现异步组件？
6. 如何实现hook？
7. 如何实现内置组件？
8. 如何编写扩展？

## 准备篇

1. 虚拟dom
2. Proxy和Reflect使用
3. 事件循环介绍---nextTick等


class P {
  constructor () {
    this.name = 'cje'

    return new Proxy(this, {
      get (target, key) {
        return Reflect.get(target, key)
      }
    })
  }

  init () {
    

  }
}
let p = new P()
p即是一个代理对象