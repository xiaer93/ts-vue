import Vue, { VNode } from "../../src";

let runCount = 0


// 实现v-model：：：https://cn.vuejs.org/v2/guide/render-function.html#v-model
// Vue.component('input-num', {
// })

let v = new Vue({
    el: '#app',
    data () {
      return  {
          news: [222]
      }
    },
    methods: {
    },
    render (h) {
      console.log(++runCount)
      const self = this
      return h('h1', {
          directives: [
              {
                  name: 'show',
                  value: self.news.length > 1,
                  expression: 'news.length > 1', 
                  arg: '',
                  modifiers: { }
              }
          ]
      }, self.news.join('&'))
    }
  })

window.v = v

setTimeout(() => {
  v.news.push('1212')
}, 1000)


// watcher执行的顺序了。导致ul-list没有更新

// setTimeout(() => {
//     debugger
//     v.getList()
// })