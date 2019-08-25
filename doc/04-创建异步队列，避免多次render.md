# 如何避免多次patch，提高性能？

## 需求

在同一个函数中，同时修改两次值，每次修改都会通知watch（dep.notify）更新。减少watch的执行次数肯定对性能提升有非常大的帮助，如何减少watch的执行次数？

```
    let renderCount = 0;
    let v = new Vue({
        el: '#app',
        data () {
            return {
            color: "red"
            }
        },
        render (h) {
            console.log('render:', ++renderCount)
            return h('h1', {style: {color: this.color}}, 'hello world!')
        }
    })

    setTimeout(() => {
        v.color = '#000'
        v.color = '#111'
    }, 2000)
```

## 异步执行watch

JavaScript是单线程的，js执行完同步代码，接着执行异步队列中的函数。通过将watch推入异步队列，等待所有的同步操作（`v.color="#000"`）执行完后，接着执行watch更新UI。


将watch推入队列，不重复添加watch，并调用nextTick（等价于setTimeout(fn, 0)）
```
function queueWatcher(watch: Watch): void {
  if (!isTruth(hasAddQueue[watch.id])) {
    hasAddQueue[watch.id] = true
    if (!flush) {
      queue.push(watch)
    } else {
      queue.push(watch)
    }

    if (!wait) {
      wait = true
      nextTick(flushQueue)
    }
  }
}
```

执行watch队列，此时即保证watch的执行次数尽可能最少。
```
function flushQueue(): void {
  flush = true

  try {
    for (let i = 0; i < queue.length; ++i) {
      let w: Watch = queue[i]
      hasAddQueue[w.id] = null
      w.run()
    }
  } catch (e) {
    console.log(e)
  }
}
```

## 总结

通过异步事件更新渲染，减少render的次数，大大的提高了性能。另外，nextTick也常常用于其他，如在nextTick中获取更新后的真实dom。