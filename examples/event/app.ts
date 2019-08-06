import Vue from "../../src";

let runCount = 0

let v = new Vue({
  el: '#app',
  data () {
    return  {
        news: []
    }
  },
  method: {
      getList () {
          this.news.push(Math.random().toString().substr(3, 10))
          console.log(this.news)
      }
  },
  render (h) {
      console.log('render:', ++runCount)
    return h('div', [
        h('button', {
            on: {
                click () {
                    console.log(123)
                    this.getList()
                }
            }
        }, '添加list'),
        h('ul', this.news.map(v => {
            return h('li', v)
        }))
    ])
  }
})

window.v = v

// setTimeout(() => {
//     debugger
//     v.getList()
// })