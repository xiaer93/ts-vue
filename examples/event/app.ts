import Vue from "../../src";

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

window.v = v