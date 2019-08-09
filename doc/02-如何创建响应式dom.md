## 数据如何驱动视图发生变化？

关键的3个类，Oberve，Dep，Watch

dep收集依赖，watch监听变化,

Proxy对象配合Reflect对象

监听对象（数组）属性变化

```
let ary = [1,2,3]
let proxyAry = new Proxy(ary, {
  get (target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  set (target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
})


// 对代理对象进行操作
proxyAry[1] = 99

fixme: 重新整理observe逻辑。

1、监听data、监听data的变化
```

// vue中是如何处理传入参数的？如何保存访问data、method、等等


// 每次render都需要收集一次依赖，同时更新watch和dep、更新依赖watcher。避免未使用的属性变更触发更新。提高性能。