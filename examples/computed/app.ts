import Vue from "../../src";

let runCount = 0

let v = new Vue({
  el: '#app',
  data () {
    return  {
        news: [1,2]
    }
  },
  computed: {
    newsStr() {
      console.log(this.news, this.news.length)
      return this.news.length
    }
  },
  watch: {
    newsStr (newVal) {
      console.log('watchwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww', newVal)
    }
  },
  render (h) {
    console.log('render: ', ++runCount)
    // return h('h1', this.newsStr)
    return h('h1', this.news.length)
  }
})

window.v = v

setTimeout(() => {
  // fixme: v.news = [1,2,3]
  // fixme: v.news.push(3)
  // 为什么没有驱动更新？,push3触发了watch，newsStr变化触发了watch。在执行watch中触发了watch，因此需要将watch添加进入队列
    // v.news.push(3)
    v.news = [1,2,3]
}, 1000)

setTimeout(() => {
  v.news.push(4)
}, 5000)