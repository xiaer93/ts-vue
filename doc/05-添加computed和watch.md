# 如何创建computed和watch？

在项目中computed和watch还是非常实用的，它们是如何实现的呢？

我们的编码目标是下面的demo能够成功渲染，最终渲染结果`<h1>未读消息：2</h1>`。

```
let v = new Vue({
  el: '#app',
  data () {
    return  {
      news: [1]
    }
  },
  computed: {
    newsCount() {
      return this.news.length
    },
  },
  render (h) {
    return h('h1',  '未读消息：' + this.newsCount)
  }
})

setTimeout(() => {
    v.news.push(2)
}, 1000)
```

## Vue响应式原理

[图片]

## 实现computed

computed属性比较特殊，其依赖其他数据属性，同时其自身也会驱动视图变化。

首先创建一个watch实例，监听computed函数中的数据，`new Watch(vm._proxyThis, getter, noop, {lazy: true})`。数据属性变化会触发getter执行，

```
function initComputed(vm: Vue) {
  let proxyComputed: any
  const computed = vm.$options.computed

  if (!isPlainObject(computed)) return

  for (let key in computed) {
    let userDef = computed[key]
    let getter = isFunction(userDef) ? userDef : userDef.get

    vm._computedWatched[key] = new Watch(vm._proxyThis, getter, noop, {
      lazy: true
    })
  }

  vm.$options.computed = proxyComputed = observeComputed(
    computed,
    vm._computedWatched,
    vm._proxyThis
  )
  for (let key in computed) {
    proxyForVm(vm._proxyThis, proxyComputed, key)
  }
}

function observeComputed(obj: VueComputed, _computedWatched: any, proxyThis: any): Object {
  if (!isPlainObject(obj) || isProxy(obj)) return obj

  let proxyObj = createProxy(obj)

  for (let key in obj) {
    defineComputed(proxyObj, key, obj[key], _computedWatched[key], proxyThis)
  }

  return proxyObj
}
```

接着将computed属性本身设置为响应式。调用`createComputedGetter`对属性进行封装，每次获取computed属性，实质上就是执行一次computed函数。

设置set，方便注入`computed:{news: {set: , get}}`形式，当调用set函数时可以触发更新。
```
function defineComputed(
  obj: any,
  key: string,
  userDef: VueComputedMethod,
  watcher: any,
  proxyThis: any
): void {
  if (!isProxy(obj)) return

  let dep: Dep = new Dep()

  const handler: any = {}
  if (isFunction(userDef)) {
    handler.get = createComputedGetter(watcher)
    handler.set = noop
  } else if (isObject(userDef)) {
    handler.get = createComputedGetter(watcher)
    handler.set = userDef.set || noop
  }

  defineProxyObject(obj, key, {
    get(target, key) {
      Dep.Target && dep.depend()
      return handler.get.call(proxyThis)
    },
    set(target, key, newVal) {
      handler.set.call(proxyThis, newVal)
      dep.notify()
      return true
    }
  })
}

function createComputedGetter(watcher: Watch): Function {
  return function computedGetter() {
    if (watcher) {
      // 计算值
      watcher.evaluate()
      // 将computed-dep添加watch对象
      Dep.Target && watcher.depend()

      return watcher.value
    }
  }
}
```

computed的缓存特性？

## 实现watch

watch实现较为简单，只需要为自己创建watch，监听依赖的变化即可。

```
function initWatch(vm: Vue) {
  const watch = vm.$options.watch

  for (let key in watch) {
    new Watch(vm._proxyThis, key, watch[key], { user: true })
  }
}

```

## Vue的实现流程

initComputed
initWatch

## 总结

vue的响应式逻辑主要依赖于Dep和Watch两个类，通过发布订阅模式实现数据驱动更新。

1. Proxy，receiver是干撒的？为什么会影响Reflect.set的结果？？？
2. vm.news = [1,2]，新设对象如何继续添加依赖？
