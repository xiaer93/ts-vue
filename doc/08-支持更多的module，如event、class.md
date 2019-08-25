# 如何给dom绑定事件？

如何给dom挂载事件，？

## 需求

注册组件button-count，当点击之后，自己更新状态，同时触发自定义事件customClick，父组件监听到变化后，向news中添加一条记录。
```
Vue.component('button-count', {
    data () {
        return {
            count: 0
        }
    },
    render (h) {
        const self = this
        return h('button', {
            on: {
                click () {
                    self.$emit('customClick', ++self.count)
                }
            }
        }, `点击次数：${self.count}`)
    }
})

let v = new Vue({
  el: '#app',
  data () {
    return  {
        news: []
    }
  },
  methods: {
      getList () {
        this.news.push(Math.random().toString().substr(3, 10))
      }
  },
  render (h) {
    const self = this
    return h('div', [
        h('button-count', {
            on: {
                customClick (count) {
                    console.log(count, self)
                    self.getList()
                }
            }
        }),
        h('p', self.news.join('***'))
    ])
  }
})
```

## 事件的分类

在vue中，通过v-bind绑定的事件主要2类，一类是原生事件，一类是自定义事件。$on, $emit等

## 总结

