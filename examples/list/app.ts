import Vue from "../../src";

let runCount = 0

let v = new Vue({
  el: '#app',
  data () {
    return {
      news: [
        12121,
        2341242134,
        21341234,
        9999
      ]
    }
  },
  render (h) {
    console.log(++runCount)
    return h('ul', this.news.map(v => {
      return h('li', v)
    }))
  }
})

window.v = v
setTimeout(() => {
  // 不能直接修改v.newsma ???
  v.news.push(66666)
}, 2000)