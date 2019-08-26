import Vue from "../../src";

let runCount = 0

console.log(Vue)

console.log

let v = new Vue({
  el: '#app',
  data () {
    return {
      news: [1]
    }
  },
  computed: {

  },
  beforeCreate () {
    console.log('beforeCreated: ', this.news)
  },
  created () {
    console.log('created: ', this.news)
  },
  beforeMount () {
    console.log('beforeMounte: ', this.news)
  },
  mounted () {
    console.log('mounted: ', this.news)
  },
  beforeUpdate () {
    console.log('beforeUpdate: ', this.news)
  },
  update () {
    console.log('update: ', this.news)
  },
  boforeDestroy () {
    console.log('beforeDestory: ', this.news)
  },
  destroyed () {
    console.log('destroyed: ', this.news)
  },
  render (h) {
    return h('h1', this.news.join(','))
  }
})

window.v = v

setTimeout(() => {
    v.news = [1,2,3]
}, 1000)

setTimeout(() => {
  v.$destroy()
}, 5000)