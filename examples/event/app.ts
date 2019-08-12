import Vue from "../../src";

let runCount = 0

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
        }, `点击次数：${this.count}`)
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
    console.log('render:', ++runCount)
    return h('div', [
        // h('button', {
        //     on: {
        //         click () {
        //             this.getList()
        //         }
        //     }
        // }, '添加list'),
        h('button-count', {
            on: {
                customClick (count) {
                    console.log(count, self)
                    self.getList()
                }
            }
        }),
        h('ul', self.news.map(v => {
            return h('li', v)
        }))
    ])
  }
})

window.v = v


// watcher执行的顺序了。导致ul-list没有更新

// setTimeout(() => {
//     debugger
//     v.getList()
// })