# 如何创建computed和watch？


## 需求

监听v.news的变化，重新计算newsStr的值，如果变化则驱动视图的更新。

```
let v = new Vue({
  el: '#app',
  data () {
    return  {
        news: [1]
    }
  },
  computed: {
    newsStr() {
      return this.news.length.toString()
    },
  },
  render (h) {
    return h('h1',  '未读消息：' + this.newsStr)
  }
})


setTimeout(() => {
    v.news.push(2)
}, 1000)
```

## 

computed和watch定义的函数，本身会依赖于props或者data，因此需要创建watch，监听依赖的变化。同时computed的数据如果被render调用，则其也需要为自己创建依赖，变化后通知render重新渲染。另外，computed具有缓存特性，能够提高性能）

## computed的实现

创建watch，同时也将自己定为依赖。

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

## watch实现

watch实现较为简单，只需要为自己创建watch，监听依赖的变化即可。

```
function initWatch(vm: Vue) {
  const watch = vm.$options.watch

  for (let key in watch) {
    new Watch(vm._proxyThis, key, watch[key], { user: true })
  }
}

```

## 总结

vue的响应式逻辑主要依赖于Dep和Watch两个类，通过发布订阅模式实现数据驱动更新。

1. Proxy，receiver是干撒的？为什么会影响Reflect.set的结果？？？
2. vm.news = [1,2]，新设对象如何继续添加依赖？
